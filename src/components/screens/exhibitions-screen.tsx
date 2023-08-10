import { setExhibitions } from "../../actions/exhibitions";
import Api from "../../api/api";
import {
  ContentVersion,
  Exhibition,
  ExhibitionDevice,
  ExhibitionDeviceGroup,
  ExhibitionFloor,
  ExhibitionPage,
  ExhibitionRoom,
  RfidAntenna,
  Visitor,
  VisitorSession
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";
import { AccessToken, ActionButton, ConfirmDialogData, DeleteDataHolder } from "../../types";
import DeleteUtils from "../../utils/delete-utils";
import CardItem from "../generic/card/card-item";
import CardList from "../generic/card/card-list";
import ConfirmDialog from "../generic/confirm-dialog";
import GenericDialog from "../generic/generic-dialog";
import BasicLayout from "../layouts/basic-layout";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  TextField,
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
  exhibitions: Exhibition[];
  setExhibitions: typeof setExhibitions;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  addDialogOpen: boolean;
  deleteDialogOpen: boolean;
  copyDialogOpen: boolean;
  renameDialogOpen: boolean;
  copying: boolean;
  selectedExhibition?: Exhibition;
  confirmDialogData: ConfirmDialogData;
}

/**
 * Component for exhibitions screen
 */
export class ExhibitionsScreen extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      error: undefined,
      loading: false,
      addDialogOpen: false,
      deleteDialogOpen: false,
      copyDialogOpen: false,
      renameDialogOpen: false,
      copying: false,
      confirmDialogData: {
        title: strings.exhibitions.delete.deleteTitle,
        text: strings.exhibitions.delete.deleteText,
        cancelButtonText: strings.confirmDialog.cancel,
        positiveButtonText: strings.confirmDialog.delete,
        deletePossible: true,
        onCancel: this.onCloseOrCancelClick,
        onClose: this.onCloseOrCancelClick
      }
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { error } = this.state;
    if (this.state.loading) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary" />
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={strings.exhibitions.listTitle}
        breadcrumbs={[]}
        actionBarButtons={actionBarButtons}
        noBackButton
        error={error}
        clearError={() => this.setState({ error: undefined })}
      >
        {this.renderProductionCardsList()}
        {this.renderAddDialog()}
        {this.renderConfirmDeleteDialog()}
        {this.renderConfirmCopyDialog()}
        {this.renderRenameDialog()}
      </BasicLayout>
    );
  };

  /**
   * Renders exhibitions in production as card list
   */
  private renderProductionCardsList = () => {
    const { exhibitions } = this.props;
    const cards = exhibitions.map((exhibition) => {
      const cardMenuOptions = this.getCardMenuOptions(exhibition);
      const exhibitionId = exhibition.id;
      if (!exhibitionId) {
        return null;
      }

      return (
        <CardItem
          size="large"
          key={exhibition.id}
          title={exhibition.name}
          onClick={() => this.onCardClick(exhibitionId)}
          menuOptions={cardMenuOptions}
        />
      );
    });

    return <CardList>{cards}</CardList>;
  };

  /**
   * Renders add exhibition dialog
   */
  private renderAddDialog = () => {
    const { selectedExhibition } = this.state;
    if (selectedExhibition) {
      return (
        <GenericDialog
          cancelButtonText={strings.genericDialog.cancel}
          positiveButtonText={strings.genericDialog.save}
          title={strings.exhibitions.createExhibitionDialog.title}
          error={false}
          onConfirm={this.onDialogSaveClick}
          onCancel={this.onCloseOrCancelClick}
          open={this.state.addDialogOpen}
          onClose={this.onCloseOrCancelClick}
        >
          <TextField
            fullWidth
            variant="outlined"
            label={strings.generic.name}
            name="name"
            value={selectedExhibition.name}
            onChange={this.onExhibitionDataChange}
          />
        </GenericDialog>
      );
    }
  };

  /**
   * Renders delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { deleteDialogOpen, confirmDialogData } = this.state;

    return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
  };

  /**
   * Renders copy exhibition confirmation dialog
   */
  private renderConfirmCopyDialog = () => {
    const { copyDialogOpen, copying, selectedExhibition } = this.state;

    if (!selectedExhibition) {
      return;
    }

    return (
      <Dialog fullWidth maxWidth="sm" open={copyDialogOpen} onClose={this.onCloseOrCancelClick}>
        <DialogTitle>{strings.exhibitions.copy.title}</DialogTitle>
        <DialogContent>
          {copying ? (
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: theme.spacing(2)
              }}
            >
              <Typography>{strings.exhibitions.copy.copyingText}</Typography>
              <LinearProgress
                style={{
                  marginTop: theme.spacing(2),
                  width: "90%"
                }}
                variant="indeterminate"
              />
            </Box>
          ) : (
            <Typography>
              {strings.formatString(strings.exhibitions.copy.text, selectedExhibition.name)}
            </Typography>
          )}
        </DialogContent>
        {!copying && (
          <DialogActions>
            <Button onClick={this.onCloseOrCancelClick} color="primary">
              {strings.genericDialog.cancel}
            </Button>
            <Button
              disableElevation
              variant="contained"
              onClick={() => this.copyExhibition(selectedExhibition)}
              color="secondary"
              autoFocus
            >
              {strings.exhibitions.cardMenu.copyExhibition}
            </Button>
          </DialogActions>
        )}
      </Dialog>
    );
  };

  /**
   * Renders copy exhibition confirmation dialog
   */
  private renderRenameDialog = () => {
    const { renameDialogOpen, selectedExhibition } = this.state;

    if (!selectedExhibition) {
      return;
    }

    return (
      <Dialog fullWidth maxWidth="sm" open={renameDialogOpen} onClose={this.onCloseOrCancelClick}>
        <DialogTitle>{strings.exhibitions.rename.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            label={strings.generic.name}
            name="name"
            value={selectedExhibition.name}
            onChange={this.onExhibitionDataChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.onCloseOrCancelClick} color="primary">
            {strings.genericDialog.cancel}
          </Button>
          <Button
            disableElevation
            variant="contained"
            onClick={() => this.renameExhibition(selectedExhibition)}
            color="secondary"
            autoFocus
          >
            {strings.generic.save}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  /**
   * Gets card menu options for exhibition card
   *
   * @param exhibition exhibition
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (exhibition: Exhibition): ActionButton[] => {
    return [
      {
        name: strings.exhibitions.cardMenu.rename,
        action: () => this.onRenameExhibitionClick(exhibition)
      },
      {
        name: strings.exhibitions.cardMenu.copyExhibition,
        action: () => this.onCopyExhibitionClick(exhibition)
      },
      {
        name: strings.exhibitions.cardMenu.delete,
        action: () => this.onDeleteExhibitionClick(exhibition)
      }
    ];
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    return [{ name: strings.dashboard.newExhibitionButton, action: this.onNewExhibitionClick }];
  };

  /**
   * Event handler for card click
   */
  private onCardClick = (exhibitionId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/${exhibitionId}/content`);
  };

  /**
   * Event handler for new exhibition click
   */
  private onNewExhibitionClick = () => {
    const newExhibition: Exhibition = { name: "" };

    this.setState({
      addDialogOpen: true,
      selectedExhibition: newExhibition
    });
  };

  /**
   * Event handler for exhibition data change
   *
   * @param event event
   */
  private onExhibitionDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedExhibition } = this.state;
    const { name, value } = event.target;
    if (!selectedExhibition || !name) {
      return;
    }

    this.setState(
      produce((draft: State) => {
        draft.selectedExhibition = { ...draft.selectedExhibition!, [name]: value };
      })
    );
  };

  /**
   * Event handler for copy exhibition click
   *
   * @param selectedExhibition exhibition to be copied
   */
  private onCopyExhibitionClick = (selectedExhibition: Exhibition) => {
    if (!selectedExhibition.id) {
      return;
    }

    this.setState({
      selectedExhibition,
      copyDialogOpen: true
    });
  };

  /**
   * Event handler for rename exhibition click
   *
   * @param selectedExhibition exhibition to be copied
   */
  private onRenameExhibitionClick = (selectedExhibition: Exhibition) => {
    if (!selectedExhibition.id) {
      return;
    }

    this.setState({
      selectedExhibition,
      renameDialogOpen: true
    });
  };

  /**
   * Event handler for exhibition delete click
   *
   * @param selectedExhibition exhibition
   */
  private onDeleteExhibitionClick = async (selectedExhibition: Exhibition) => {
    const { accessToken } = this.props;

    if (!selectedExhibition.id) {
      return;
    }

    this.setState({ loading: true });

    const tempDeleteData = { ...this.state.confirmDialogData } as ConfirmDialogData;
    tempDeleteData.onConfirm = () => this.deleteExhibition(selectedExhibition);
    tempDeleteData.text = strings.formatString(
      strings.exhibitions.delete.deleteText,
      selectedExhibition.name
    );

    const pagesApi = Api.getExhibitionPagesApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const floorsApi = Api.getExhibitionFloorsApi(accessToken);
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const antennasApi = Api.getRfidAntennasApi(accessToken);
    const visitorsApi = Api.getVisitorsApi(accessToken);
    const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);

    const [
      pages,
      contentVersions,
      devices,
      deviceGroups,
      floors,
      rooms,
      antennas,
      visitors,
      visitorSessions
    ] = await Promise.all([
      pagesApi.listExhibitionPages({ exhibitionId: selectedExhibition.id }),
      contentVersionsApi.listContentVersions({ exhibitionId: selectedExhibition.id }),
      devicesApi.listExhibitionDevices({ exhibitionId: selectedExhibition.id }),
      deviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId: selectedExhibition.id }),
      floorsApi.listExhibitionFloors({ exhibitionId: selectedExhibition.id }),
      roomsApi.listExhibitionRooms({ exhibitionId: selectedExhibition.id }),
      antennasApi.listRfidAntennas({ exhibitionId: selectedExhibition.id }),
      visitorsApi.listVisitors({ exhibitionId: selectedExhibition.id }),
      visitorSessionsApi.listVisitorSessions({ exhibitionId: selectedExhibition.id })
    ]);

    /** Promise.all allows only 10 variables at once */
    const visitorVariables = await visitorVariablesApi.listVisitorVariables({
      exhibitionId: selectedExhibition.id
    });

    if (
      pages.length > 0 ||
      contentVersions.length > 0 ||
      devices.length > 0 ||
      deviceGroups.length > 0 ||
      floors.length > 0 ||
      rooms.length > 0 ||
      antennas.length > 0 ||
      visitors.length > 0 ||
      visitorSessions.length > 0 ||
      visitorVariables.length > 0
    ) {
      tempDeleteData.deletePossible = false;
      tempDeleteData.contentTitle = strings.exhibitions.delete.contentTitle;

      const holder: DeleteDataHolder[] = [];
      holder.push({ objects: pages, localizedMessage: strings.deleteContent.pages });
      holder.push({
        objects: contentVersions,
        localizedMessage: strings.deleteContent.contentVersions
      });
      holder.push({ objects: devices, localizedMessage: strings.deleteContent.devices });
      holder.push({ objects: deviceGroups, localizedMessage: strings.deleteContent.deviceGroups });
      holder.push({ objects: floors, localizedMessage: strings.deleteContent.floors });
      holder.push({ objects: rooms, localizedMessage: strings.deleteContent.rooms });
      holder.push({ objects: antennas, localizedMessage: strings.deleteContent.antennas });
      holder.push({ objects: visitors, localizedMessage: strings.deleteContent.visitors });
      holder.push({
        objects: visitorSessions,
        localizedMessage: strings.deleteContent.visitorSessions
      });
      holder.push({
        objects: visitorVariables,
        localizedMessage: strings.deleteContent.visitorVariables
      });
      tempDeleteData.contentSpecificMessages = DeleteUtils.constructContentDeleteMessages(holder);
    }

    this.setState({
      selectedExhibition,
      deleteDialogOpen: true,
      confirmDialogData: tempDeleteData,
      loading: false
    });
  };

  /**
   * Event handler for dialog save click
   */
  private onDialogSaveClick = async () => {
    const { accessToken, exhibitions } = this.props;
    const { selectedExhibition } = this.state;

    if (!accessToken || !selectedExhibition) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const newExhibition = await exhibitionsApi.createExhibition({
      exhibition: selectedExhibition
    });

    this.props.setExhibitions(
      produce(exhibitions, (draft) => {
        draft.push(newExhibition);
      })
    );

    this.setState({
      addDialogOpen: false,
      selectedExhibition: undefined
    });
  };

  /**
   * Event handler for close or cancel click
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addDialogOpen: false,
      deleteDialogOpen: false,
      copyDialogOpen: false,
      selectedExhibition: undefined
    });
  };

  /**
   * Copy exhibition
   *
   * @param selectedExhibition exhibition
   */
  private copyExhibition = async (selectedExhibition: Exhibition) => {
    const { accessToken, exhibitions } = this.props;
    const exhibitionId = selectedExhibition.id;

    if (!accessToken || !exhibitionId) {
      return;
    }

    this.setState({
      copying: true
    });

    try {
      const copiedExhibition = await Api.getExhibitionsApi(accessToken).createExhibition({
        sourceExhibitionId: exhibitionId
      });

      this.props.setExhibitions([...exhibitions, copiedExhibition]);
    } catch (error) {
      this.setState({
        copying: false,
        error: new Error((error as any).message || "Unknown error")
      });
    }
    this.setState({
      copying: false,
      copyDialogOpen: false,
      selectedExhibition: undefined
    });
  };

  /**
   * Rename exhibition
   *
   * @param selectedExhibition exhibition
   */
  private renameExhibition = async (selectedExhibition: Exhibition) => {
    const { accessToken, exhibitions } = this.props;
    const exhibitionId = selectedExhibition.id;

    if (!accessToken || !exhibitionId) {
      return;
    }

    this.setState({
      loading: true
    });

    const updatedExhibition = await Api.getExhibitionsApi(accessToken).updateExhibition({
      exhibition: selectedExhibition,
      exhibitionId: exhibitionId
    });

    const otherExihibitions = exhibitions.filter(
      (exhibition) => exhibition.id !== updatedExhibition.id
    );

    this.props.setExhibitions([...otherExihibitions, updatedExhibition]);

    this.setState({
      renameDialogOpen: false,
      selectedExhibition: undefined,
      loading: false
    });
  };

  /**
   * Deletes exhibition
   *
   * @param selectedExhibition exhibition
   */
  private deleteExhibition = async (selectedExhibition: Exhibition) => {
    const { accessToken, exhibitions } = this.props;
    const exhibitionId = selectedExhibition.id;

    if (!accessToken || !exhibitionId) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    await exhibitionsApi.deleteExhibition({ exhibitionId });

    this.props.setExhibitions(
      produce(exhibitions, (draft) => {
        const exhibitionIndex = exhibitions.findIndex(
          (exhibition) => exhibition.id === selectedExhibition.id
        );
        if (exhibitionIndex > -1) {
          draft.splice(exhibitionIndex, 1);
        }
      })
    );

    this.setState({
      deleteDialogOpen: false,
      selectedExhibition: undefined
    });
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
    accessToken: state.auth.accessToken as AccessToken,
    exhibitions: state.exhibitions.exhibitions
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setExhibitions: (exhibitions: Exhibition[]) => dispatch(setExhibitions(exhibitions))
  };
}

// TODO: withStyles type issue might be resolved with using compose?
// export default compose(connect(mapStateToProps, mapDispatchToProps),withStyles(styles))(ExhibitionsScreen);
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionsScreen));
