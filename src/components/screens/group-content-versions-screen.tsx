import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, Grid, Typography, TextField, Divider, MenuItem, Select } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionRoom, GroupContentVersion, ExhibitionDeviceGroup, GroupContentVersionStatus } from "../../generated/client";
import { AccessToken, ActionButton, BreadcrumbData } from '../../types';
import Api from "../../api/api";
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import { ContentVersion } from "../../generated/client/models/ContentVersion";
import GenericDialog from "../generic/generic-dialog";
import theme from "../../styles/theme";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  roomId: string;
  contentVersionId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  exhibition?: Exhibition;
  room?: ExhibitionRoom;
  contentVersion?: ContentVersion;
  groupContentVersions: GroupContentVersion[];
  deviceGroups: ExhibitionDeviceGroup[];
  addDialogOpen: boolean;
  newGroupContentVersion?: GroupContentVersion;

  selectedGroupContentVersion?: GroupContentVersion;
}

/**
 * Component for exhibition content rooms view
 */
class GroupContentVersionsScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      groupContentVersions: [],
      deviceGroups: [],
      addDialogOpen: false
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
    const { contentVersion } = this.state;
    const breadcrumbs = this.getBreadcrumbsData();
    const actionBarButtons = this.getActionButtons();

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={ keycloak }
          history={ history }
          title={ contentVersion?.name || "" }
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
        title={ contentVersion?.name || "" }
        breadcrumbs={ breadcrumbs }
        actionBarButtons={ actionBarButtons }
      >
        { this.renderRoomCardsList() }
        { this.renderAddDialog() }
      </BasicLayout>
    );
  }

  /**
   * Renders rooms as card list
   */
  private renderRoomCardsList = () => {
    const { groupContentVersions, exhibition, room, contentVersion, selectedGroupContentVersion } = this.state;
    const cardMenuOptions = this.getCardMenuOptions();
    const cards = groupContentVersions.map(groupContentVersion => {
      const groupContentVersionId = groupContentVersion.id;
      if (!groupContentVersionId || !exhibition || !room || !contentVersion) {
        return null;
      }

      return (
        <CardItem
          key={ groupContentVersionId }
          title={ groupContentVersion.name }
          subtitle={ contentVersion?.name }
          onClick={ () => this.onCardClick(groupContentVersion) }
          cardMenuOptions={ cardMenuOptions }
          status={ strings.exhibitions.status.ready }
          selected={ selectedGroupContentVersion?.id === groupContentVersion.id }
        />
      );
    });

    return (
      <CardList title={ strings.exhibitions.inProduction }>
        { cards }
      </CardList>
    );
  }

  private renderAddDialog = () => {
    return(
      <GenericDialog
        cancelButtonText={ strings.genericDialog.cancel }
        positiveButtonText={ strings.genericDialog.add }
        title={ strings.groupContentVersion.addDialogTitle }
        error={ false }
        onConfirm={ this.onSaveClick }
        onCancel={ this.onCloseOrCancelClick }
        open={ this.state.addDialogOpen }
        onClose={ this.onCloseOrCancelClick }
      >
        { this.renderDialogContent() }
      </GenericDialog>
    );
  }

  private renderDialogContent = () => {
    const { newGroupContentVersion, deviceGroups } = this.state;

    const deviceGroupSelectItems = deviceGroups.map(group =>
      <MenuItem key={ group.id } value={ group.id }>{ group.name }</MenuItem>
    );

    return (
      <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
        <Grid item xs={ 12 }>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.groupContentVersion.name }</Typography>
          <TextField
            fullWidth
            type="text"
            name="name"
            value={ newGroupContentVersion ? newGroupContentVersion.name : "" }
            onChange={ this.onValueChange }
          />
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </Grid>
        <Grid item xs={ 12 }>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.groupContentVersion.deviceGroup }</Typography>
          <Select
            fullWidth
            variant="filled"
            labelId={ strings.groupContentVersion.deviceGroup }
            name="deviceGroupId"
            value={ newGroupContentVersion ? newGroupContentVersion.deviceGroupId : "" }
            onChange={ this.onValueChange }
          >
            { deviceGroupSelectItems }
          </Select>
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </Grid>
      </Grid>
    );
  }

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId, roomId, contentVersionId } = this.props;

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);
    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const [ exhibition, room, contentVersion, groupContentVersions, deviceGroups ] = await
    Promise.all<Exhibition, ExhibitionRoom, ContentVersion, GroupContentVersion[], ExhibitionDeviceGroup[]>([
      exhibitionsApi.findExhibition({ exhibitionId }),
      exhibitionRoomsApi.findExhibitionRoom({ exhibitionId: exhibitionId, roomId: roomId }),
      contentVersionsApi.findContentVersion({ exhibitionId: exhibitionId, contentVersionId: contentVersionId }),
      groupContentVersionApi.listGroupContentVersions({ exhibitionId: exhibitionId }),
      deviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId: exhibitionId, roomId: roomId })
    ]);

    this.setState({ exhibition, room, contentVersion, groupContentVersions, deviceGroups });
  }

  /**
   * Get card menu options
   *
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.setStatus,
      action: this.setStatus
    }];
  }

  /**
   * Set status handler
   */
  private setStatus = () => {
    alert(strings.comingSoon);
    return;
  }

  /**
   * Get breadcrumbs data
   *
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { exhibitionId, roomId } = this.props;
    const { exhibition, room, contentVersion } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/v4/exhibitions" },
      { name: exhibition?.name, url: `/v4/exhibitions/${exhibitionId}/content` },
      { name: room?.name, url: `/v4/exhibitions/${exhibitionId}/content/rooms/${roomId}` },
      { name: contentVersion?.name || "" }
    ] as BreadcrumbData[];
  }

  /**
   * Gets action buttons
   * 
   * @returns action buttons as array
   */
  // FIXME: create new exhibition
  private getActionButtons = () => {
    return [
      { name: strings.groupContentVersion.add, action: this.onAddGroupContentVersionClick }
    ] as ActionButton[];
  }

  /**
   * Event handler for card click
   *
   * @param contentVersionId content version id
   */
  private onCardClick = (groupContentVersion: GroupContentVersion) => {
    this.setState({
      selectedGroupContentVersion: groupContentVersion
    });
  }

  private onSaveClick = () => {
    const { accessToken, exhibitionId } = this.props;
    const { newGroupContentVersion } = this.state;

    if (!newGroupContentVersion) {
      return;
    }

    const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);
    const createdGroupContenVersion = groupContentVersionApi.createGroupContentVersion({
      exhibitionId: exhibitionId,
      groupContentVersion: newGroupContentVersion
    });

    this.setState({
      addDialogOpen: false,
      newGroupContentVersion: undefined
    });
  }

  /**
   * On dialog close or cancel click handler
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addDialogOpen: false,
      newGroupContentVersion: undefined
    });
  }

  private onAddGroupContentVersionClick = () => {
    const { contentVersionId } = this.props;
    const newGroupContentVersion: GroupContentVersion = {
      name: "",
      contentVersionId: contentVersionId,
      deviceGroupId: "",
      status: GroupContentVersionStatus.Notstarted
    };

    this.setState({
      addDialogOpen: true,
      newGroupContentVersion: newGroupContentVersion
    });
  }

  /**
   * Handler when linked value changed is disabled (single filed is updated)
   * @param event react change event
   */
  private onValueChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ name?: string | undefined; value: any }>) => {
    const { newGroupContentVersion } = this.state;
    const key = event.target.name;
    const value = event.target.value;
    if (!key || !value || !newGroupContentVersion) {
      return;
    }

    this.setState({
      newGroupContentVersion : { ...newGroupContentVersion, [key] : value }
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GroupContentVersionsScreen));
