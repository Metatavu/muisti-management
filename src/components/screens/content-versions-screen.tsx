import Api from "../../api/api";
import {
  ContentVersionActiveCondition,
  Exhibition,
  ExhibitionDeviceGroup,
  ExhibitionPage,
  ExhibitionRoom,
  VisitorVariable,
  VisitorVariableType
} from "../../generated/client";
import { ContentVersion } from "../../generated/client/models/ContentVersion";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import {
  AccessToken,
  ActionButton,
  BreadcrumbData,
  ConfirmDialogData,
  DeleteDataHolder,
  LanguageOptions,
  MultiLingualContentVersion
} from "../../types";
import DeleteUtils from "../../utils/delete-utils";
import CardItem from "../generic/card/card-item";
import CardList from "../generic/card/card-list";
import ConfirmDialog from "../generic/confirm-dialog";
import GenericDialog from "../generic/generic-dialog";
import WithDebounce from "../generic/with-debounce";
import BasicLayout from "../layouts/basic-layout";
import {
  Box,
  CircularProgress,
  MenuItem,
  TextField,
  TextFieldProps,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import produce from "immer";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  roomId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  error?: Error;
  exhibition?: Exhibition;
  room?: ExhibitionRoom;
  contentVersions: ContentVersion[];
  deviceGroups: ExhibitionDeviceGroup[];
  multiLingualContentVersions: MultiLingualContentVersion[];
  selectedMultiLingualContentVersion?: MultiLingualContentVersion;
  dialogOpen: boolean;
  deleteDialogOpen: boolean;
  addNewContentVersion: boolean;
  formError?: string;
  visitorVariables?: VisitorVariable[];
  confirmDialogData: ConfirmDialogData;
  selectedContentVersion?: ContentVersion;
}

/**
 * Component for content version view
 */
class ContentVersionsScreen extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      multiLingualContentVersions: [],
      contentVersions: [],
      deviceGroups: [],
      dialogOpen: false,
      deleteDialogOpen: false,
      addNewContentVersion: false,
      confirmDialogData: {
        title: strings.contentVersion.delete.deleteTitle,
        text: strings.contentVersion.delete.deleteText,
        cancelButtonText: strings.confirmDialog.cancel,
        positiveButtonText: strings.confirmDialog.delete,
        deletePossible: true,
        onCancel: this.onCloseOrCancelClick,
        onClose: this.onCloseOrCancelClick
      }
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchData();
    this.setState({ loading: false });
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { room, error } = this.state;
    const actionBarButtons = this.getActionButtons();
    const breadcrumbs = this.getBreadcrumbsData();

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={keycloak}
          history={history}
          title={""}
          breadcrumbs={breadcrumbs}
          actionBarButtons={actionBarButtons}
          error={error}
          clearError={() => this.setState({ error: undefined })}
        >
          <div className={classes.loader}>
            <CircularProgress size={50} color="secondary" />
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={room?.name || ""}
        breadcrumbs={breadcrumbs}
        actionBarButtons={actionBarButtons}
      >
        {this.renderContentVersionCardsList()}
        {this.renderAddDialog()}
        {this.renderConfirmDeleteDialog()}
      </BasicLayout>
    );
  };

  /**
   * Renders content versions as card list
   */
  private renderContentVersionCardsList = () => {
    const { multiLingualContentVersions, exhibition, room, selectedContentVersion, deviceGroups } =
      this.state;

    if (!exhibition) {
      return null;
    }

    const cards = multiLingualContentVersions.map((multiLingualContentVersion) => {
      const deviceGroupName =
        deviceGroups.find(
          (group) => group.id === multiLingualContentVersion.languageVersions[0].deviceGroupId
        )?.name || "";

      const languageVersions = this.sortLanguageVersions(
        multiLingualContentVersion.languageVersions
      );
      const primaryVersion =
        languageVersions.find(
          (languageVersion) => languageVersion.language === LanguageOptions.FI
        ) ?? languageVersions[0];

      const languages = (
        <Typography variant="body1">
          {languageVersions.map((languageVersion) => languageVersion.language).join(" / ")}
        </Typography>
      );

      const defaultLocale = (multiLingualContentVersion.languageVersions.filter(
        (lang) => lang.language === LanguageOptions.FI
      ) || multiLingualContentVersion.languageVersions[0])[0];

      return (
        <CardItem
          key={primaryVersion.id}
          title={primaryVersion.name}
          subtitle={room?.name}
          context={
            <div>
              <div>
                <Typography variant="body1">{deviceGroupName}</Typography>
                {languages}
              </div>
            </div>
          }
          onClick={() => this.onCardClick(multiLingualContentVersion.languageVersions[0])}
          menuOptions={this.getCardMenuOptions(multiLingualContentVersion)}
          selected={
            selectedContentVersion?.id === multiLingualContentVersion.languageVersions[0].id
          }
          onActionClick={() => this.openTimeline(defaultLocale)}
        />
      );
    });

    return <CardList title={strings.contentVersion.contentMaterials}>{cards}</CardList>;
  };

  /**
   * Render add dialog
   */
  private renderAddDialog = () => {
    const { selectedContentVersion, formError } = this.state;

    return (
      <GenericDialog
        cancelButtonText={strings.genericDialog.cancel}
        positiveButtonText={strings.genericDialog.save}
        title={strings.contentVersion.addDialogTitle}
        error={!!formError}
        onConfirm={this.onDialogSaveClick}
        onCancel={this.onCloseOrCancelClick}
        open={this.state.dialogOpen}
        onClose={this.onCloseOrCancelClick}
      >
        <Box width={320}>
          <Box mb={2}>
            <Typography variant="body1">{strings.contentVersion.addDialogDescription}</Typography>
          </Box>
          <WithDebounce
            name="name"
            label={strings.contentVersion.name}
            value={selectedContentVersion?.name || ""}
            onChange={this.onNameChange}
            debounceTimeout={250}
            component={(props) => <TextField {...props} />}
          />
          {this.renderActivityCondition()}
          {formError && (
            <Typography variant="body1" color="error">
              {formError}
            </Typography>
          )}
        </Box>
      </GenericDialog>
    );
  };

  /**
   * Renders activity condition options
   */
  private renderActivityCondition = () => {
    const { selectedMultiLingualContentVersion, visitorVariables } = this.state;
    const activeCondition =
      selectedMultiLingualContentVersion?.languageVersions[0]?.activeCondition;

    const label = activeCondition?.userVariable
      ? strings.exhibition.resources.dynamic.key
      : strings.generic.noSelection;
    return (
      <>
        <Box mt={2} mb={2}>
          <Typography variant="body1">{strings.contentVersion.contentIsActiveWhen}</Typography>
        </Box>
        <TextField
          fullWidth
          name="userVariable"
          label={label}
          select
          value={activeCondition?.userVariable || ""}
          onChange={this.onActiveConditionSelectChange}
        >
          {visitorVariables?.map((variable) => (
            <MenuItem key={variable.id} value={variable.name}>
              {variable.name}
            </MenuItem>
          ))}
          {
            <MenuItem key={"no-value"} value={""}>
              {strings.generic.noSelection}
            </MenuItem>
          }
        </TextField>
        {activeCondition?.userVariable && (
          <>
            <Box mt={2} mb={2}>
              <Typography variant="body1">{strings.contentVersion.equals}</Typography>
            </Box>
            {visitorVariables
              ?.filter((variable) => variable.name === activeCondition?.userVariable)
              .map((variable) => {
                this.renderVariables(variable, activeCondition?.equals);
              })}
          </>
        )}
      </>
    );
  };

  /**
   * Renders variables
   *
   * @param visitorVariable visitor variables
   * @param value current value
   */
  private renderVariables = (visitorVariable: VisitorVariable, value?: string) => {
    const { classes } = this.props;

    const textFieldProps: TextFieldProps = {
      className: classes.field,
      fullWidth: true,
      label: strings.exhibition.resources.dynamic.equals,
      name: "equals",
      value: value,
      onChange: this.onActiveConditionValueChange
    };

    switch (visitorVariable.type) {
      case VisitorVariableType.Enumerated:
        return (
          <TextField {...textFieldProps} select>
            {visitorVariable._enum?.map((value, index) => (
              <MenuItem key={index} value={value}>
                {value}
              </MenuItem>
            ))}
          </TextField>
        );
      case VisitorVariableType.Boolean:
        return (
          <TextField {...textFieldProps} select>
            <MenuItem key="true" value="true">
              {strings.visitorVariables.booleanValues.true}
            </MenuItem>
            <MenuItem key="false" value="false">
              {strings.visitorVariables.booleanValues.false}
            </MenuItem>
          </TextField>
        );
      case VisitorVariableType.Number:
        return <TextField {...textFieldProps} type="number" />;
      default:
        return <TextField {...textFieldProps} />;
    }
  };

  /**
   * Render content version confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedContentVersion, deleteDialogOpen, confirmDialogData } = this.state;

    if (selectedContentVersion) {
      return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
    }
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.contentVersion.add, action: this.onAddMultiLingualContentVersionClick }
    ] as ActionButton[];
  };

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId, roomId } = this.props;

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);
    const [exhibition, room, contentVersions, visitorVariables] = await Promise.all([
      exhibitionsApi.findExhibition({ exhibitionId }),
      exhibitionRoomsApi.findExhibitionRoom({ exhibitionId: exhibitionId, roomId: roomId }),
      contentVersionsApi.listContentVersions({ exhibitionId, roomId }),
      visitorVariablesApi.listVisitorVariables({ exhibitionId: exhibitionId })
    ]);

    /**
     * Content versions are linked together if they have the same name but different language.
     * It is for now the only way to recognize different languages of the same content.
     * That's why when creating new content versions and modifying existing ones,
     * the user should be prohibited to make two content versions with the same name and language.
     */
    const multiLingualContentVersions: MultiLingualContentVersion[] = [];
    contentVersions.forEach((contentVersion) => {
      const existingIndex = multiLingualContentVersions.findIndex((multiLingualContentVersion) => {
        const { languageVersions } = multiLingualContentVersion;
        const sameName = languageVersions.some(
          (languageVersion) => languageVersion.name === contentVersion.name
        );
        const differentLanguage = languageVersions.every(
          (languageVersion) => languageVersion.language !== contentVersion.language
        );
        return sameName && differentLanguage;
      });

      if (existingIndex > -1) {
        multiLingualContentVersions[existingIndex].languageVersions.push(contentVersion);
        return;
      }

      multiLingualContentVersions.push({ languageVersions: [contentVersion] });
    });

    this.setState({
      exhibition,
      room,
      multiLingualContentVersions,
      visitorVariables,
      contentVersions
    });
  };

  /**
   * Get card menu options
   *
   * @param multiLingualContentVersion multilingual content version
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (
    multiLingualContentVersion: MultiLingualContentVersion
  ): ActionButton[] => {
    return [
      {
        name: strings.exhibitions.cardMenu.delete,
        action: () => this.onDeleteClick(multiLingualContentVersion)
      },
      {
        name: strings.exhibitions.cardMenu.edit,
        action: () => this.editMultiLingualContentVersion(multiLingualContentVersion)
      }
    ];
  };

  /**
   * Deletes multilingual content version
   *
   * @param multiLingualContentVersion multilingual content version to delete
   */
  private deleteMultiLingualContentVersion = async (
    multiLingualContentVersion: MultiLingualContentVersion
  ) => {
    const { accessToken, exhibitionId } = this.props;
    const { languageVersions } = multiLingualContentVersion;

    if (languageVersions.some((languageVersion) => !languageVersion.id)) {
      return;
    }

    const contentVersionApi = Api.getContentVersionsApi(accessToken);
    try {
      await Promise.all(
        languageVersions.map((languageVersion) =>
          contentVersionApi.deleteContentVersion({
            exhibitionId: exhibitionId,
            contentVersionId: languageVersion.id!
          })
        )
      );
    } catch (error) {
      this.setState({ error: new Error(error) });
      return;
    }

    this.setState(
      produce((draft: State) => {
        const foundIndex = this.findMultiLingualContentVersionIndex(
          multiLingualContentVersion,
          draft.multiLingualContentVersions
        );

        if (foundIndex > -1) {
          draft.multiLingualContentVersions.splice(foundIndex, 1);
        }

        draft.deleteDialogOpen = false;
        draft.selectedMultiLingualContentVersion = undefined;
      })
    );
  };

  /**
   * Event handler for card delete click
   *
   * @param multiLingualContentVersion clicked multi lingual content version
   */
  private onDeleteClick = async (multiLingualContentVersion: MultiLingualContentVersion) => {
    const { accessToken, exhibitionId } = this.props;
    const { confirmDialogData } = this.state;

    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const pagesApi = Api.getExhibitionPagesApi(accessToken);

    const tempDeleteData = { ...confirmDialogData } as ConfirmDialogData;
    const allContentVersions: ContentVersion[] = [];
    const allPages: ExhibitionPage[] = [];

    for (const contentVersion of multiLingualContentVersion.languageVersions) {
      const [contentVersions, pages] = await Promise.all([
        contentVersionsApi.listContentVersions({
          exhibitionId: exhibitionId
        }),
        pagesApi.listExhibitionPages({
          exhibitionId: exhibitionId,
          contentVersionId: contentVersion.id
        })
      ]);
      allContentVersions.push(...contentVersions);
      allPages.push(...pages);
    }

    if (allContentVersions.length > 0 || allPages.length > 0) {
      // TODO: causing a read only error if try to delete straight after creating a new content version
      confirmDialogData.deletePossible = false;
      confirmDialogData.contentTitle = strings.contentVersion.delete.contentTitle;

      const holder: DeleteDataHolder[] = [];
      holder.push({
        objects: allContentVersions,
        localizedMessage: strings.deleteContent.groupContentVersions
      });
      holder.push({ objects: allPages, localizedMessage: strings.deleteContent.pages });
      confirmDialogData.contentSpecificMessages =
        DeleteUtils.constructContentDeleteMessages(holder);
    }

    tempDeleteData.onConfirm = () =>
      this.deleteMultiLingualContentVersion(multiLingualContentVersion);

    this.setState({
      deleteDialogOpen: true,
      selectedMultiLingualContentVersion: multiLingualContentVersion,
      selectedContentVersion: multiLingualContentVersion.languageVersions[0],
      confirmDialogData: tempDeleteData
    });
  };

  /**
   * Edit multilingual content version
   *
   * @param multiLingualContentVersion multilingual content version to edit
   */
  private editMultiLingualContentVersion = (
    multiLingualContentVersion: MultiLingualContentVersion
  ) => {
    this.setState({
      dialogOpen: true,
      selectedMultiLingualContentVersion: multiLingualContentVersion,
      selectedContentVersion: multiLingualContentVersion.languageVersions[0],
      addNewContentVersion: false
    });
  };

  /**
   * Get breadcrumbs data
   *
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { exhibitionId } = this.props;
    const { exhibition, room } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/exhibitions" },
      { name: exhibition?.name, url: `/exhibitions/${exhibitionId}/content` },
      { name: room?.name || "" }
    ] as BreadcrumbData[];
  };

  /**
   * Event handler for card click
   *
   * @param contentVersionId content version id
   */
  private onCardClick = (contentVersion: ContentVersion) => {
    this.setState({
      selectedContentVersion: contentVersion
    });
  };

  /**
   * Opens timeline screen
   *
   * @param contentVersion selected content version
   */
  private openTimeline = (contentVersion: ContentVersion) => {
    const { history } = this.props;
    history.push(`${history.location.pathname}/contentVersions/${contentVersion.id}/timeline`);
  };

  /**
   * Event handler for name change
   *
   * @param event react change event
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedMultiLingualContentVersion, multiLingualContentVersions } = this.state;

    if (!selectedMultiLingualContentVersion) {
      return;
    }

    const { value } = event.target;
    const { languageVersions } = selectedMultiLingualContentVersion;
    const updatedLanguageVersions: ContentVersion[] = languageVersions.map((languageVersion) => ({
      ...languageVersion,
      name: value
    }));

    const updatedMultiLingualContentVersion: MultiLingualContentVersion = {
      languageVersions: updatedLanguageVersions
    };

    this.setState({
      selectedMultiLingualContentVersion: updatedMultiLingualContentVersion
    });

    if (value === "") {
      this.setState({ formError: strings.contentVersion.nameIsMandatory });
      return;
    }

    const selectedVersionIndex = this.findMultiLingualContentVersionIndex(
      updatedMultiLingualContentVersion,
      multiLingualContentVersions
    );
    const otherVersions = multiLingualContentVersions.filter(
      (version, index) => index !== selectedVersionIndex
    );
    const existingName = this.isExistingName(value, otherVersions);
    if (existingName) {
      this.setState({ formError: strings.contentVersion.nameAlreadyTaken });
      return;
    }

    this.setState({ formError: undefined });
  };

  /**
   * Event handler for active condition select change
   *
   * @param event react change event
   */
  private onActiveConditionSelectChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { selectedMultiLingualContentVersion } = this.state;
    const { name, value } = event.target;

    if (!selectedMultiLingualContentVersion || !name) {
      return;
    }

    const { languageVersions } = selectedMultiLingualContentVersion;

    const updatedLanguageVersions: ContentVersion[] = languageVersions.map((languageVersion) => {
      const newActiveCondition: ContentVersionActiveCondition = {
        userVariable: value,
        equals: ""
      };

      return {
        ...languageVersion,
        activeCondition: newActiveCondition
      };
    });

    const updatedMultiLingualContentVersion: MultiLingualContentVersion = {
      languageVersions: updatedLanguageVersions
    };

    this.setState({
      selectedMultiLingualContentVersion: updatedMultiLingualContentVersion
    });
  };

  /**
   * Event handler for active condition select change
   *
   * @param event react change event
   */
  private onActiveConditionValueChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { selectedMultiLingualContentVersion } = this.state;
    const { name, value } = event.target;

    if (!selectedMultiLingualContentVersion || !name) {
      return;
    }

    const { languageVersions } = selectedMultiLingualContentVersion;

    const updatedLanguageVersions: ContentVersion[] = languageVersions.map((languageVersion) => {
      if (languageVersion.activeCondition) {
        const updatedActiveCondition: ContentVersionActiveCondition = {
          ...languageVersion.activeCondition,
          [name]: value
        };
        return {
          ...languageVersion,
          activeCondition: updatedActiveCondition
        };
      }

      return languageVersion;
    });

    const updatedMultiLingualContentVersion: MultiLingualContentVersion = {
      languageVersions: updatedLanguageVersions
    };

    this.setState({
      selectedMultiLingualContentVersion: updatedMultiLingualContentVersion
    });
  };

  /**
   * On dialog save click handler
   */
  private onDialogSaveClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedMultiLingualContentVersion, addNewContentVersion, selectedContentVersion } =
      this.state;

    if (!selectedMultiLingualContentVersion || !selectedContentVersion) {
      return;
    }

    const newState = await produce(this.state, async (draft) => {
      const contentVersionApi = Api.getContentVersionsApi(accessToken);

      if (addNewContentVersion) {
        const newContentVersion = await contentVersionApi.createContentVersion({
          exhibitionId: exhibitionId,
          contentVersion: selectedMultiLingualContentVersion.languageVersions[0]
        });

        const newMultiLingualContentVersion = {
          languageVersions: [newContentVersion]
        };

        draft.selectedMultiLingualContentVersion = newMultiLingualContentVersion;
        draft.multiLingualContentVersions.push(newMultiLingualContentVersion);
        draft.contentVersions.push(newContentVersion);
      } else {
        const { languageVersions } = selectedMultiLingualContentVersion;
        const updatedLanguageVersions = await Promise.all(
          languageVersions.map((languageVersion) =>
            contentVersionApi.updateContentVersion({
              contentVersionId: languageVersion.id!,
              exhibitionId: exhibitionId,
              contentVersion: languageVersion
            })
          )
        );

        const updatedMultiLingualContentVersion: MultiLingualContentVersion = {
          languageVersions: updatedLanguageVersions
        };

        draft.selectedMultiLingualContentVersion = updatedMultiLingualContentVersion;
        const versionIndex = this.findMultiLingualContentVersionIndex(
          updatedMultiLingualContentVersion,
          draft.multiLingualContentVersions
        );

        if (versionIndex > -1) {
          draft.multiLingualContentVersions.splice(
            versionIndex,
            1,
            updatedMultiLingualContentVersion
          );
          draft.contentVersions.splice(versionIndex, 1, updatedLanguageVersions[0]);
        }
      }

      draft.dialogOpen = false;
    });

    this.setState(newState);
  };

  /**
   * On add multilingual content version click
   */
  private onAddMultiLingualContentVersionClick = () => {
    const { roomId } = this.props;
    const selectedMultiLingualContentVersion: MultiLingualContentVersion = {
      languageVersions: [
        {
          name: "",
          language: LanguageOptions.FI,
          rooms: [roomId]
        }
      ]
    };

    this.setState({
      dialogOpen: true,
      selectedMultiLingualContentVersion: selectedMultiLingualContentVersion,
      selectedContentVersion: selectedMultiLingualContentVersion.languageVersions[0],
      addNewContentVersion: true
    });
  };

  /**
   * On dialog close or cancel click handler
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      dialogOpen: false,
      deleteDialogOpen: false,
      selectedMultiLingualContentVersion: undefined
    });
  };

  /**
   * Returns index of matching multilingual content version from given list if found
   *
   * @param multiLingualContentVersion multilingual content version to find
   * @param multiLingualContentVersionList list of multilingual content versions to search from
   * @return index of multilingual content version if found, otherwise -1
   */
  private findMultiLingualContentVersionIndex = (
    multiLingualContentVersion: MultiLingualContentVersion,
    multiLingualContentVersionList: MultiLingualContentVersion[]
  ) => {
    return multiLingualContentVersionList.findIndex((versionInList) =>
      versionInList.languageVersions.every(
        (languageVersion, index) =>
          languageVersion.id === multiLingualContentVersion.languageVersions[index].id
      )
    );
  };

  /**
   * Sorts language versions
   *
   * @param languageVersions language versions
   */
  private sortLanguageVersions = (languageVersions: ContentVersion[]) => {
    const sortedList: ContentVersion[] = [];

    [LanguageOptions.FI, LanguageOptions.EN, LanguageOptions.SV, LanguageOptions.RU].forEach(
      (languageOption) => {
        const foundLanguage = languageVersions.find(
          (version) => version.language === languageOption
        );
        foundLanguage && sortedList.push(foundLanguage);
      }
    );

    return sortedList;
  };

  /**
   * Returns whether given name already exists in other content versions
   *
   * @param name name as string
   * @param multiLingualContentVersions list of multilingual content versions
   */
  private isExistingName = (
    name: string,
    multiLingualContentVersions: MultiLingualContentVersion[]
  ) => {
    return multiLingualContentVersions.some(
      (multiLingualContentVersion) => multiLingualContentVersion.languageVersions[0].name === name
    );
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ContentVersionsScreen));
