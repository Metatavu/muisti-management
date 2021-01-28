import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, TextField, Box, Typography } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import { AccessToken, ActionButton, BreadcrumbData, LanguageOptions, MultiLingualContentVersion } from "../../types";
import Api from "../../api/api";
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import { ContentVersion } from "../../generated/client/models/ContentVersion";
import GenericDialog from "../generic/generic-dialog";
import ConfirmDialog from "../generic/confirm-dialog";
import produce from "immer";
import WithDebounce from "../generic/with-debounce";

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
  multiLingualContentVersions: MultiLingualContentVersion[];
  selectedMultiLingualContentVersion?: MultiLingualContentVersion;
  dialogOpen: boolean;
  deleteDialogOpen: boolean;
  addNewContentVersion: boolean;
  formError?: string;
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
      dialogOpen: false,
      deleteDialogOpen: false,
      addNewContentVersion: false
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchData();
    this.setState({ loading: false });
  }

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
          keycloak={ keycloak }
          history={ history }
          title={ "" }
          breadcrumbs={ breadcrumbs }
          actionBarButtons={ actionBarButtons }
          error={ error }
          clearError={ () => this.setState({ error: undefined }) }
        >
          <div className={ classes.loader }>
            <CircularProgress size={ 50 } color="secondary"></CircularProgress>
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ room?.name || "" }
        breadcrumbs={ breadcrumbs }
        actionBarButtons={ actionBarButtons }
      >
        { this.renderContentVersionCardsList() }
        { this.renderAddDialog() }
        { this.renderConfirmDeleteDialog() }
      </BasicLayout>
    );
  }

  /**
   * Renders content versions as card list
   */
  private renderContentVersionCardsList = () => {
    const { multiLingualContentVersions, exhibition, room } = this.state;

    if (!exhibition) {
      return null;
    }

    const cards = multiLingualContentVersions.map(multiLingualContentVersion => {
      const languageVersions = this.sortLanguageVersions(multiLingualContentVersion.languageVersions);
      const primaryVersion = languageVersions.find(languageVersion => languageVersion.language === LanguageOptions.FI) ?? languageVersions[0];

      const languages = (
        <Typography variant="body1">
          { languageVersions.map(languageVersion => languageVersion.language).join(" / ") }
        </Typography>
      );

      return (
        <CardItem
          key={ primaryVersion.id! }
          title={ primaryVersion.name }
          subtitle={ room?.name }
          context={ languages }
          onClick={ () => this.onCardClick(primaryVersion.id!) }
          menuOptions={ this.getCardMenuOptions(multiLingualContentVersion) }
        />
      );
    });

    return (
      <CardList title={ strings.contentVersion.contentMaterials }>
        { cards }
      </CardList>
    );
  }

  /**
   * Render add dialog
   */
  private renderAddDialog = () => {
    const { selectedMultiLingualContentVersion, formError } = this.state;

    return(
      <GenericDialog
        cancelButtonText={ strings.genericDialog.cancel }
        positiveButtonText={ strings.genericDialog.save }
        title={ strings.contentVersion.addDialogTitle }
        error={ !!formError }
        onConfirm={ this.onDialogSaveClick }
        onCancel={ this.onCloseOrCancelClick }
        open={ this.state.dialogOpen }
        onClose={ this.onCloseOrCancelClick }
      >
        <Box width={ 320 }>
          <Box mb={ 2 }>
            <Typography variant="body1">
              { strings.contentVersion.addDialogDescription }
            </Typography>
          </Box>
          <WithDebounce
            name="name"
            label={ strings.contentVersion.name }
            value={ selectedMultiLingualContentVersion?.languageVersions[0]?.name || "" }
            onChange={ this.onNameChange }
            debounceTimeout={ 250 }
            component={ props => <TextField { ...props } /> }
          />
          { formError &&
            <Typography variant="body1" color="error">
              { formError }
            </Typography>
          }
        </Box>
      </GenericDialog>
    );
  }

  /**
   * Render content version confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedMultiLingualContentVersion } = this.state;

    if (selectedMultiLingualContentVersion) {
      return (
        <ConfirmDialog
          open={ this.state.deleteDialogOpen }
          title={ strings.contentVersion.deleteTitle }
          text={ strings.contentVersion.deleteText }
          onClose={ this.onCloseOrCancelClick }
          onCancel={ this.onCloseOrCancelClick }
          onConfirm={ () => this.deleteMultiLingualContentVersion(selectedMultiLingualContentVersion) }
          positiveButtonText={ strings.confirmDialog.delete }
          cancelButtonText={ strings.confirmDialog.cancel }
        />
      );
    }
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.contentVersion.add, action: this.onAddMultiLingualContentVersionClick }
    ] as ActionButton[];
  }

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId, roomId } = this.props;

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const [ exhibition, room, contentVersions ] = await Promise.all<Exhibition, ExhibitionRoom, ContentVersion[]>([
      exhibitionsApi.findExhibition({ exhibitionId }),
      exhibitionRoomsApi.findExhibitionRoom({ exhibitionId: exhibitionId, roomId: roomId }),
      contentVersionsApi.listContentVersions({ exhibitionId, roomId })
    ]);

    /**
     * Content versions are linked together if they have the same name but different language.
     * It is for now the only way to recognize different languages of the same content.
     * That's why when creating new content versions and modifying existing ones,
     * the user should be prohibited to make two content versions with the same name and language.
     */
    const multiLingualContentVersions: MultiLingualContentVersion[] = [];
    contentVersions.forEach(contentVersion => {
      const existingIndex = multiLingualContentVersions.findIndex(multiLingualContentVersion => {
        const { languageVersions } = multiLingualContentVersion;
        const sameName = languageVersions.some(languageVersion => languageVersion.name === contentVersion.name);
        const differentLanguage = languageVersions.every(languageVersion => languageVersion.language !== contentVersion.language);
        return sameName && differentLanguage;
      });

      if (existingIndex > -1) {
        multiLingualContentVersions[existingIndex].languageVersions.push(contentVersion);
        return;
      }

      multiLingualContentVersions.push({ languageVersions: [ contentVersion ] });
    });

    this.setState({
      exhibition,
      room,
      multiLingualContentVersions
    });
  }

  /**
   * Get card menu options
   *
   * @param multiLingualContentVersion multilingual content version
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (multiLingualContentVersion: MultiLingualContentVersion): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.delete,
      action: () => this.setState({ deleteDialogOpen: true, selectedMultiLingualContentVersion: multiLingualContentVersion })
    },
    {
      name: strings.exhibitions.cardMenu.edit,
      action: () => this.editMultiLingualContentVersion(multiLingualContentVersion)
    }];
  }

  /**
   * Deletes multilingual content version
   * 
   * @param multiLingualContentVersion multilingual content version to delete
   */
  private deleteMultiLingualContentVersion = async (multiLingualContentVersion: MultiLingualContentVersion) => {
    const { accessToken, exhibitionId } = this.props;
    const { languageVersions } = multiLingualContentVersion;

    if (languageVersions.some(languageVersion => !languageVersion.id)) {
      return;
    }

    const contentVersionApi = Api.getContentVersionsApi(accessToken);
    try {
      await Promise.all(
        languageVersions.map(languageVersion =>
          contentVersionApi.deleteContentVersion({
            exhibitionId: exhibitionId,
            contentVersionId: languageVersion.id!,
          })
        )
      );
    } catch (error) {
      this.setState({ error: new Error(error) });
      return;
    }

    this.setState(
      produce((draft: State) => {
        const foundIndex = this.findMultiLingualContentVersionIndex(multiLingualContentVersion, draft.multiLingualContentVersions);

        if (foundIndex > -1) {
          draft.multiLingualContentVersions.splice(foundIndex, 1);
        }

        draft.deleteDialogOpen = false;
        draft.selectedMultiLingualContentVersion = undefined;
      })
    );
  }

  /**
   * Edit multilingual content version
   * 
   * @param multiLingualContentVersion multilingual content version to edit
   */
  private editMultiLingualContentVersion = (multiLingualContentVersion: MultiLingualContentVersion) => {
    this.setState({
      dialogOpen: true,
      selectedMultiLingualContentVersion: multiLingualContentVersion,
      addNewContentVersion: false
    });
  }

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
  }

  /**
   * Event handler for card click
   *
   * @param contentVersionId content version id
   */
  private onCardClick = (contentVersionId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/contentVersions/${contentVersionId}`);
  }

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
    const updatedLanguageVersions: ContentVersion[] = languageVersions.map(languageVersion => ({
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

    const selectedVersionIndex = this.findMultiLingualContentVersionIndex(updatedMultiLingualContentVersion, multiLingualContentVersions);
    const otherVersions = multiLingualContentVersions.filter((version, index) => index !== selectedVersionIndex);
    const existingName = this.isExistingName(value, otherVersions);
    if (existingName) {
      this.setState({ formError: strings.contentVersion.nameAlreadyTaken });
      return;
    }

    this.setState({ formError: undefined });
  }

  /**
   * On dialog save click handler
   */
  private onDialogSaveClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedMultiLingualContentVersion, addNewContentVersion } = this.state;

    if (!selectedMultiLingualContentVersion) {
      return;
    }

    const newState = await produce(this.state, async draft => {
      const contentVersionApi = Api.getContentVersionsApi(accessToken);

      if (addNewContentVersion) {
        const newContentVersion = await contentVersionApi.createContentVersion({
          exhibitionId: exhibitionId,
          contentVersion: selectedMultiLingualContentVersion.languageVersions[0]
        });

        const newMultiLingualContentVersion = {
          languageVersions: [ newContentVersion ]
        };

        draft.selectedMultiLingualContentVersion = newMultiLingualContentVersion;
        draft.multiLingualContentVersions.push(newMultiLingualContentVersion);
      } else {
        const { languageVersions } = selectedMultiLingualContentVersion;
        const updatedLanguageVersions = await Promise.all(
          languageVersions.map(languageVersion =>
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
          draft.multiLingualContentVersions.splice(versionIndex, 1, updatedMultiLingualContentVersion);
        }
      }

      draft.dialogOpen = false;
    });

    this.setState(newState);
  }

  /**
   * On add multilingual content version click
   */
  private onAddMultiLingualContentVersionClick = () => {
    const { roomId } = this.props;
    const selectedMultiLingualContentVersion: MultiLingualContentVersion = {
      languageVersions: [{
        name: "",
        language: LanguageOptions.FI,
        rooms: [ roomId ]
      }]
    };

    this.setState({
      dialogOpen: true,
      selectedMultiLingualContentVersion: selectedMultiLingualContentVersion,
      addNewContentVersion: true
    });
  }

  /**
   * On dialog close or cancel click handler
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      dialogOpen: false,
      deleteDialogOpen: false,
      selectedMultiLingualContentVersion: undefined
    });
  }

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
    return multiLingualContentVersionList.findIndex(versionInList =>
      versionInList.languageVersions.every((languageVersion, index) =>
        languageVersion.id === multiLingualContentVersion.languageVersions[index].id
      )
    );
  }

  /**
   * Sorts language versions
   * 
   * @param languageVersions language versions
   */
  private sortLanguageVersions = (languageVersions: ContentVersion[]) => {
    const sortedList: ContentVersion[] = [];

    [ LanguageOptions.FI, LanguageOptions.EN, LanguageOptions.SV, LanguageOptions.RU]
      .forEach(languageOption => {
        const foundLanguage = languageVersions.find(version => version.language === languageOption);
        foundLanguage && sortedList.push(foundLanguage);
      });

    return sortedList;
  }

  /**
   * Returns whether given name already exists in other content versions
   * 
   * @param name name as string
   * @param multiLingualContentVersions list of multilingual content versions
   */
  private isExistingName = (name: string, multiLingualContentVersions: MultiLingualContentVersion[]) => {
    return multiLingualContentVersions.some(multiLingualContentVersion =>
      multiLingualContentVersion.languageVersions[0].name === name
    );
  }
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
  return {
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ContentVersionsScreen));
