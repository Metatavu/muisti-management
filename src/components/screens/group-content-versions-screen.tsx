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
import ElementSettingsPane from "../layouts/element-settings-pane";
import { ContentVersion } from "../../generated/client/models/ContentVersion";
import GenericDialog from "../generic/generic-dialog";
import theme from "../../styles/theme";
import GroupContentVersionsInfo from "../group-content-version/group-content-versions-info";
import ConfirmDialog from "../generic/confirm-dialog";
import produce from "immer";
import { setSelectedGroupContentVersion } from "../../actions/groupContentVersions";

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
  setSelectedGroupContentVersion: typeof setSelectedGroupContentVersion;
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
  selectedGroupContentVersion?: GroupContentVersion;
  deleteDialogOpen: boolean;
  addNewGroupContentVersion: boolean;
}

/**
 * Component for group content versions screen
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
      addDialogOpen: false,
      deleteDialogOpen: false,
      addNewGroupContentVersion: false
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
    const { contentVersion, selectedGroupContentVersion } = this.state;
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
        { this.renderGroupContentVersionCardsList() }
        { this.renderAddDialog() }
        { this.renderConfirmDeleteDialog() }
        <ElementSettingsPane open={ true } title="Properties" width={ selectedGroupContentVersion && contentVersion ? 320 : 0 }>
          { selectedGroupContentVersion && contentVersion &&
            <GroupContentVersionsInfo
              contentVersion={ contentVersion }
              groupContentVersion={ selectedGroupContentVersion }
              onValueChange={ this.onGroupContentValueChange }
            />
          }
        </ElementSettingsPane>
      </BasicLayout>
    );
  }

  /**
   * Renders group content versions as card list
   */
  private renderGroupContentVersionCardsList = () => {
    const { groupContentVersions, exhibition, room, contentVersion, selectedGroupContentVersion, deviceGroups } = this.state;
    const cards = groupContentVersions.map(groupContentVersion => {
      const groupContentVersionId = groupContentVersion.id;
      if (!groupContentVersionId || !exhibition || !room || !contentVersion) {
        return null;
      }

      const deviceGroupName = deviceGroups.find(group => group.id === groupContentVersion.deviceGroupId)?.name || "";

      return (
        <CardItem
          key={ groupContentVersionId }
          title={ groupContentVersion.name }
          subtitle={ contentVersion?.name }
          context={
            <div>
              <Typography variant="body1">
                <div>{ `${room.name} /`}</div>
                <div>{ deviceGroupName }</div>
              </Typography>
            </div>
          }
          onClick={ () => this.onCardClick(groupContentVersion) }
          menuOptions={ this.getCardMenuOptions(groupContentVersion) }
          status={ groupContentVersion.status }
          selected={ selectedGroupContentVersion?.id === groupContentVersion.id }
          onActionClick={ () => this.openTimeline(groupContentVersion) }
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
   * Renders add dialog
   */
  private renderAddDialog = () => {
    return(
      <GenericDialog
        cancelButtonText={ strings.genericDialog.cancel }
        positiveButtonText={ strings.genericDialog.add }
        title={ strings.groupContentVersion.addDialogTitle }
        error={ false }
        onConfirm={ this.onDialogSaveClick }
        onCancel={ this.onCloseOrCancelClick }
        open={ this.state.addDialogOpen }
        onClose={ this.onCloseOrCancelClick }
      >
        { this.renderDialogContent() }
      </GenericDialog>
    );
  }

  /**
   * Renders delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedGroupContentVersion } = this.state;
    if (selectedGroupContentVersion) {
      return (
        <ConfirmDialog
          open={ this.state.deleteDialogOpen }
          title={ strings.groupContentVersion.deleteTitle }
          text={ strings.groupContentVersion.deleteText }
          onClose={ this.onCloseOrCancelClick }
          onCancel={ this.onCloseOrCancelClick }
          onConfirm={ () => this.deleteGroupContentVersion(selectedGroupContentVersion) }
          positiveButtonText={ strings.confirmDialog.delete }
          cancelButtonText={ strings.confirmDialog.cancel }
        />
      );
    }
  }

  /**
   * Render dialog content
   */
  private renderDialogContent = () => {
    const { selectedGroupContentVersion, deviceGroups, room } = this.state;
    if (!room) {
      return;
    }

    const deviceGroupSelectItems = deviceGroups.filter(group => group.roomId === room.id).map(group =>
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
            value={ selectedGroupContentVersion ? selectedGroupContentVersion.name : "" }
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
            value={ selectedGroupContentVersion ? selectedGroupContentVersion.deviceGroupId : "" }
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
    const [ exhibition, room, contentVersion, groupContentVersions, deviceGroups ] = 
      await Promise.all<Exhibition, ExhibitionRoom, ContentVersion, GroupContentVersion[], ExhibitionDeviceGroup[]>([
        exhibitionsApi.findExhibition({ exhibitionId }),
        exhibitionRoomsApi.findExhibitionRoom({ exhibitionId, roomId }),
        contentVersionsApi.findContentVersion({ exhibitionId, contentVersionId }),
        groupContentVersionApi.listGroupContentVersions({ exhibitionId, contentVersionId }),
        deviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId })
      ]);

    this.setState({ exhibition, room, contentVersion, groupContentVersions, deviceGroups });
  }

  /**
   * Gets card menu options
   *
   * @param groupContentVersion selected group content version
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (groupContentVersion: GroupContentVersion): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.delete,
      action: () => this.setState({ deleteDialogOpen: true, selectedGroupContentVersion: groupContentVersion })
    }];
  }

  /**
   * Gets breadcrumbs data
   *
   * @returns array of breadcrumb data objects
   */
  private getBreadcrumbsData = (): BreadcrumbData[] => {
    const { exhibitionId, roomId } = this.props;
    const { exhibition, room, contentVersion } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/v4/exhibitions" },
      { name: exhibition?.name || "", url: `/v4/exhibitions/${exhibitionId}/content` },
      { name: room?.name || "", url: `/v4/exhibitions/${exhibitionId}/content/floors/${room?.floorId}/rooms/${roomId}` },
      { name: contentVersion?.name || "" }
    ];
  }

  /**
   * Gets action buttons
   *
   * @returns array of action button objects
   */
  private getActionButtons = (): ActionButton[] => {
    return [
      { name: strings.generic.save, action: this.onSaveClick },
      { name: strings.groupContentVersion.add, action: this.onAddGroupContentVersionClick }
    ];
  }

  /**
   * Deletes group content version
   *
   * @param groupContentVersion selected group content version
   */
  private deleteGroupContentVersion = (groupContentVersion: GroupContentVersion) => {
    const { accessToken, exhibitionId } = this.props;
    const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);

    if (!groupContentVersion.id) {
      return;
    }

    groupContentVersionApi.deleteGroupContentVersion({
      exhibitionId: exhibitionId,
      groupContentVersionId: groupContentVersion.id,
    });

    this.setState({
      deleteDialogOpen: false,
      selectedGroupContentVersion: undefined
    });
  }

  /**
   * Event handler for value change
   *
   * @param event react change event
   */
  private onValueChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string | undefined; value: any }>) => {
    const { selectedGroupContentVersion } = this.state;
    const key = event.target.name;
    const value = event.target.value;
    if (!key || value === undefined || !selectedGroupContentVersion) {
      return;
    }

    this.setState({
      selectedGroupContentVersion : { ...selectedGroupContentVersion, [key] : value }
    });

  }

  /**
   * Event handler for card click
   *
   * @param contentVersionId content version id
   */
  private onCardClick = (groupContentVersion: GroupContentVersion) => {
    this.props.setSelectedGroupContentVersion(groupContentVersion);
    this.setState({
      selectedGroupContentVersion: groupContentVersion
    });
  }

  /**
   * Opens timeline screen
   *
   * @param groupContentVersion selected group content version
   */
  private openTimeline = (groupContentVersion: GroupContentVersion) => {
    const { history } = this.props;
    history.push(`${history.location.pathname}/groupContentVersions/${groupContentVersion.id}/timeline`);
  }

  /**
   * Event handler for group content value change
   *
   * @param groupContentVersion group content version
   */
  private onGroupContentValueChange = (groupContentVersion: GroupContentVersion) => {
    const { groupContentVersions } = this.state;
    const temp = [ ...groupContentVersions ];

    const index = groupContentVersions.findIndex(version => version.id === groupContentVersion.id);
    if (index > -1) {
      temp.splice(index, 1, groupContentVersion);
    }
    this.setState({
      groupContentVersions: temp,
      selectedGroupContentVersion: groupContentVersion
    });
  }

  /**
   * Event handler for dialog save click
   */
  private onDialogSaveClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedGroupContentVersion } = this.state;

    if (!selectedGroupContentVersion) {
      return;
    }

    const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);
    const createdContentVersion = await groupContentVersionApi.createGroupContentVersion({
      exhibitionId: exhibitionId,
      groupContentVersion: selectedGroupContentVersion
    });

    const groupContentVersions = produce(this.state.groupContentVersions, draft => {
      draft.push(createdContentVersion);
    });

    this.setState({
      groupContentVersions,
      addDialogOpen: false,
      selectedGroupContentVersion: undefined
    });
  }

  /**
   * Event handler for close of cancel click
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addDialogOpen: false,
      deleteDialogOpen: false,
      selectedGroupContentVersion: undefined
    });
  }

  /**
   * Event handler for add group content version click
   */
  private onAddGroupContentVersionClick = () => {
    const { contentVersionId } = this.props;
    const selectedGroupContentVersion: GroupContentVersion = {
      name: "",
      contentVersionId: contentVersionId,
      deviceGroupId: "",
      status: GroupContentVersionStatus.Notstarted
    };

    this.setState({
      addDialogOpen: true,
      selectedGroupContentVersion: selectedGroupContentVersion
    });
  }

  /**
   * Event handler for save click
   */
  private onSaveClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedGroupContentVersion } = this.state;
    if (!selectedGroupContentVersion) {
      return;
    }

    const groupContentVersionApi = Api.getGroupContentVersionsApi(accessToken);
    const updatedGroupContentVersion = await groupContentVersionApi.updateGroupContentVersion({
      exhibitionId: exhibitionId,
      groupContentVersion: selectedGroupContentVersion,
      groupContentVersionId: selectedGroupContentVersion.id!
    });

    this.setState({
      addDialogOpen: false,
      selectedGroupContentVersion: updatedGroupContentVersion
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
    setSelectedGroupContentVersion: (groupContentVersion?: GroupContentVersion) => dispatch(setSelectedGroupContentVersion(groupContentVersion))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GroupContentVersionsScreen));
