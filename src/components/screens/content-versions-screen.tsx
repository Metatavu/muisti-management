import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, MenuItem, Grid, Typography, TextField, Divider, Select, FormControlLabel, Switch } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import { AccessToken, ActionButton, BreadcrumbData, LanguageOptions } from '../../types';
import Api from "../../api/api";
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import { ContentVersion } from "../../generated/client/models/ContentVersion";
import GenericDialog from "../generic/generic-dialog";
import theme from "../../styles/theme";
import ConfirmDialog from "../generic/confirm-dialog";

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
  exhibition?: Exhibition;
  room?: ExhibitionRoom;
  rooms: ExhibitionRoom[];
  contentVersions: ContentVersion[];
  selectedContentVersion?: ContentVersion;
  dialogOpen: boolean;
  deleteDialogOpen: boolean;
  addNewContentVersion: boolean;
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
      contentVersions: [],
      rooms: [],
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
    const { room } = this.state;
    const actionBarButtons = this.getActionButtons();
    const breadcrumbs = this.getBreadcrumbsData();

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={ keycloak }
          history={ history }
          title={ room?.name || "" }
          breadcrumbs={ breadcrumbs }
          actionBarButtons={ actionBarButtons }
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
    const { contentVersions, exhibition, room } = this.state;
    const cards = contentVersions.map(contentVersion => {
      const contentVersionId = contentVersion.id;
      if (!contentVersionId || !exhibition) {
        return null;
      }

      return (
        <CardItem
          key={ contentVersionId }
          title={ contentVersion.name }
          subtitle={ room?.name }
          onClick={ () => this.onCardClick(contentVersionId) }
          menuOptions={ this.getCardMenuOptions(contentVersion) }
          status={ strings.exhibitions.status.ready }
        />
      );
    });

    return (
      <CardList title={ strings.exhibitions.inProduction }>
        { cards }
      </CardList>
    );
  }

  /**
   * Render add dialog
   */
  private renderAddDialog = () => {
    return(
      <GenericDialog
        cancelButtonText={ strings.genericDialog.cancel }
        positiveButtonText={ strings.genericDialog.save }
        title={ strings.contentVersion.addDialogTitle }
        error={ false }
        onConfirm={ this.onDialogSaveClick }
        onCancel={ this.onCloseOrCancelClick }
        open={ this.state.dialogOpen }
        onClose={ this.onCloseOrCancelClick }
      >
        { this.renderDialogContent() }
      </GenericDialog>
    );
  }

  /**
   * Render content version confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedContentVersion } = this.state;
    if (selectedContentVersion) {
      return (
        <ConfirmDialog
          open={ this.state.deleteDialogOpen }
          title={ strings.contentVersion.deleteTitle }
          text={ strings.contentVersion.deleteText }
          onClose={ this.onCloseOrCancelClick }
          onCancel={ this.onCloseOrCancelClick }
          onConfirm={ () => this.deleteContentVersion(selectedContentVersion) }
          positiveButtonText={ strings.confirmDialog.delete }
          cancelButtonText={ strings.confirmDialog.cancel }
        />
      );
    }
  }

  /**
   * Render add dialog content
   */
  private renderDialogContent = () => {
    const { selectedContentVersion } = this.state;

    const languageSelectItems = Object.keys(LanguageOptions).map(language =>
      <MenuItem key={ language } value={ language }>{ language }</MenuItem>
    );

    return (
      <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
        <Grid item xs={ 12 }>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.contentVersion.name }</Typography>
          <TextField
            fullWidth
            type="text"
            name="name"
            variant="filled"
            value={ selectedContentVersion ? selectedContentVersion.name : "" }
            onChange={ this.onValueChange }
          />
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </Grid>
        <Grid item xs={ 12 }>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.contentVersion.language }</Typography>
          <Select
            fullWidth
            variant="filled"
            labelId={ strings.contentVersion.language }
            name="language"
            value={ selectedContentVersion ? selectedContentVersion.language : "" }
            onChange={ this.onValueChange }
          >
            { languageSelectItems }
          </Select>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.contentVersion.rooms }</Typography>
          { this.renderRoomOptions() }
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </Grid>
      </Grid>
    );
  }

  /**
   * Render available rooms
   */
  private renderRoomOptions = () => {
    const { rooms, selectedContentVersion } = this.state;

    return rooms.map(room => {
      if (!room.id) {
        return <div/>;
      }
      return (
        <FormControlLabel
          style={{ marginTop: theme.spacing(2) }}
          control={
            <Switch
              checked={ selectedContentVersion ? selectedContentVersion.rooms.includes(room.id) : false }
              onChange={ this.onCheckBoxChange }
              color="secondary"
              name="rooms"
              inputProps={{ 'aria-label': 'primary checkbox' }}
              value={ room.id }
            />
          }
          label={ room.name }
        />
      );
    });
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.contentVersion.add, action: this.onAddContentVersionClick }
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
    const [ exhibition, rooms, room, contentVersions ] = await Promise.all<Exhibition, ExhibitionRoom[], ExhibitionRoom, ContentVersion[]>([
      exhibitionsApi.findExhibition({ exhibitionId }),
      exhibitionRoomsApi.listExhibitionRooms({ exhibitionId: exhibitionId }),
      exhibitionRoomsApi.findExhibitionRoom({ exhibitionId: exhibitionId, roomId: roomId }),
      contentVersionsApi.listContentVersions({ exhibitionId, roomId })
    ]);

    this.setState({ exhibition, rooms, room, contentVersions });
  }

  /**
   * Get card menu options
   *
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (contentVersion: ContentVersion): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.delete,
      action: () => this.setState({ deleteDialogOpen: true, selectedContentVersion: contentVersion })
    },
    {
      name: strings.exhibitions.cardMenu.edit,
      action: () => this.editContentVersion(contentVersion)
    }];
  }

  /**
   * Set status handler
   */
  private deleteContentVersion = (contentVersion: ContentVersion) => {
    const { accessToken, exhibitionId } = this.props;
    const contentVersionApi = Api.getContentVersionsApi(accessToken);

    if (!contentVersion.id) {
      return;
    }

    contentVersionApi.deleteContentVersion({
      exhibitionId: exhibitionId,
      contentVersionId: contentVersion.id,
    });

    this.setState({
      deleteDialogOpen: false,
      selectedContentVersion: undefined
    });
  }

  /**
   * Edit content version handler
   * 
   * @param contentVersion content version
   */
  private editContentVersion = (contentVersion: ContentVersion) => {
    this.setState({
      dialogOpen: true,
      selectedContentVersion: contentVersion,
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
      { name: strings.exhibitions.listTitle, url: "/v4/exhibitions" },
      { name: exhibition?.name, url: `/v4/exhibitions/${exhibitionId}/content` },
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
    this.props.history.push(`${pathname}/version/${contentVersionId}`);
  }

  /**
   * Handler when linked value changed is disabled (single filed is updated)
   * @param event react change event
   */
  private onValueChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string | undefined; value: any }>) => {
    const { selectedContentVersion } = this.state;
    const key = event.target.name;
    const value = event.target.value;
    if (!key || value === undefined || !selectedContentVersion) {
      return;
    }

    this.setState({
      selectedContentVersion : { ...selectedContentVersion, [key] : value }
    });
  }

  /**
   * Handler when linked value changed is disabled (single filed is updated)
   * @param event react change event
   */
  private onCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedContentVersion } = this.state;
    const key = event.target.name;
    const value = event.target.value;
    if (!key || !value || !selectedContentVersion) {
      return;
    }
    const index = selectedContentVersion.rooms.findIndex(roomId => roomId === value);
    const tempRooms = selectedContentVersion.rooms;

    if (index > -1) {
      tempRooms.splice(index, 1);
    } else {
      tempRooms.push(value);
    }

    this.setState({
      selectedContentVersion : { ...selectedContentVersion, rooms: tempRooms }
    });

  }

  /**
   * On dialog save click handler
   */
  private onDialogSaveClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedContentVersion, addNewContentVersion } = this.state;

    if (!selectedContentVersion) {
      return;
    }
    const contentVersionApi = Api.getContentVersionsApi(accessToken);
    let tempContentVersion;
    if (addNewContentVersion) {
      tempContentVersion = await contentVersionApi.createContentVersion({
        exhibitionId: exhibitionId,
        contentVersion: selectedContentVersion
      });
    } else {
      tempContentVersion = await contentVersionApi.updateContentVersion({
        contentVersionId: selectedContentVersion.id!,
        exhibitionId: exhibitionId,
        contentVersion: selectedContentVersion
      });
    }

    this.setState({
      dialogOpen: false,
      selectedContentVersion: { ...tempContentVersion } as ContentVersion
    });

  }

  /**
   * On add content version click
   */
  private onAddContentVersionClick = () => {
    const { roomId } = this.props;
    const selectedContentVersion: ContentVersion = {
      name: "",
      language: LanguageOptions.FI,
      rooms: [roomId]
    };

    this.setState({
      dialogOpen: true,
      selectedContentVersion: selectedContentVersion,
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
      selectedContentVersion: undefined
    });
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
