import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import Api from "../../api/api";
import { History } from "history";
import styles from "../../styles/floor-plan-editor-view";
// eslint-disable-next-line max-len
import { CircularProgress } from "@mui/material";
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionFloor, ExhibitionRoom, ContentVersion, ExhibitionDeviceGroup, ExhibitionDevice, RfidAntenna, GroupContentVersion } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, BreadcrumbData } from "../../types";
import strings from "../../localization/strings";
import "cropperjs/dist/cropper.css";
import { LatLngExpression, LatLngBounds } from "leaflet";
import ContentMap from "../generic/content-map";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId?: string;
  exhibitionFloorId?: string;
  roomId?: string;
  groupContentVersion?: GroupContentVersion;
  contentVersionId?: string;
  exhibitions: Exhibition[];
  readOnly: boolean;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  name: string;
  toolbarOpen: boolean;

  exhibition?: Exhibition;
  selectedFloor?: ExhibitionFloor;
  rooms?: ExhibitionRoom[];
  selectedRoom?: ExhibitionRoom;
  deviceGroups?: ExhibitionDeviceGroup[];
  selectedDeviceGroup?: ExhibitionDeviceGroup;
  devices?: ExhibitionDevice[];
  antennas?: RfidAntenna[];
  contentVersion?: ContentVersion;
  groupContentVersions?: GroupContentVersion[];
  breadCrumbs: BreadcrumbData[];
}

/**
 * Component for exhibition floor plan editor
 *
 * TODO: Functionalities and structure of content/floor plan needs to be re-designed -->
 * This component will NOT at the moment contain logic for selecting things from the map.
 */
export class FloorPlanEditorView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      name: "",
      toolbarOpen: true,
      breadCrumbs: []
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.loadViewData();
    await this.loadDevices();
    this.setState({ loading: false });
  }

  /**
   * Component did update life cycle handler
   */
  public componentDidUpdate = async (prevProps: Props) => {
    if (prevProps.exhibitions !== this.props.exhibitions) {
      this.setState({ loading: true });
      await this.loadViewData();
      this.setState({ loading: false });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history, keycloak } = this.props;
    const { exhibition, breadCrumbs } = this.state;
    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ exhibition.name }
        breadcrumbs={ breadCrumbs }
        actionBarButtons={ actionBarButtons }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }
      >

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.floorPlan.title }>
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditor() }
          </EditorView>
          <ElementSettingsPane open={ true } width={ 320 } title={ strings.floorPlan.properties.title }>
          </ElementSettingsPane>
        </div>

      </BasicLayout>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditor = () => {
    const { selectedFloor, selectedRoom, selectedDeviceGroup } = this.state;
    const { exhibitionId, readOnly } = this.props;

    if (selectedFloor && selectedFloor.floorPlanUrl && selectedFloor.floorPlanBounds) {
      const floorBounds = selectedFloor.floorPlanBounds;
      const swCorner = floorBounds.southWestCorner;
      const neCorner = floorBounds.northEastCorner;
      const sw: LatLngExpression = [ swCorner.longitude, swCorner.latitude ];
      const ne: LatLngExpression = [ neCorner.longitude, neCorner.latitude ];
      const bounds = new LatLngBounds(sw, ne);

      const floorPlanInfo = {
        bounds: bounds,
        url: selectedFloor.floorPlanUrl,
        imageHeight: 965,
        imageWidth: 1314,
        readOnly: readOnly
      };

      const selectedItems = {
        floor: selectedFloor,
        room: selectedRoom,
        deviceGroup: selectedDeviceGroup
      };

      const mapData = this.filterMapData();

      return (
        <ContentMap
          mapData={ mapData }
          floorPlanInfo={ floorPlanInfo }
          selectedItems={ selectedItems }
          exhibitionId={ exhibitionId }
        />
      );
    }
    return null;
  }

  /**
   * Filter map data for leaflet
   */
  private filterMapData = () => {
    const { selectedFloor, rooms, selectedRoom, deviceGroups, devices, antennas } = this.state;
    const data: any = { };

    if (selectedRoom || selectedFloor) {
      const floorId = selectedFloor ? selectedFloor.id : "";
      const roomId = selectedRoom ? selectedRoom.id : "";
      const foundDeviceGroups = deviceGroups ? deviceGroups.filter(deviceGroup => deviceGroup.roomId === roomId) : [];

      data.rooms = rooms ? rooms.filter(room => room.floorId === floorId) : [];
      data.deviceGroups = foundDeviceGroups;
      data.devices = devices;
      data.antennas = antennas;
      return data;
    }

    return data;
  }

  /**
   * Loads view data
   */
  private loadViewData = async () => {
    const { exhibitionId, exhibitionFloorId, roomId, contentVersionId, accessToken } = this.props;

    const breadCrumbs: BreadcrumbData[] = [];
    breadCrumbs.push({ name: strings.exhibitions.listTitle, url: "/exhibitions" });

    if (!exhibitionId) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const [ exhibition ] = await Promise.all<Exhibition>([
      exhibitionsApi.findExhibition({ exhibitionId }),
    ]);

    breadCrumbs.push({ name: exhibition?.name, url: "" });
    this.setState({ exhibition, breadCrumbs });

    if (!exhibitionFloorId) {
      return;
    }

    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(accessToken);
    const [ floor ] = await Promise.all<ExhibitionFloor>([
      exhibitionFloorsApi.findExhibitionFloor({ exhibitionId: exhibitionId, floorId: exhibitionFloorId }),
    ]);

    breadCrumbs.push({ name: floor.name, url: `/exhibitions/${exhibitionId}/floorplan/floors/${exhibitionFloorId}` });
    this.setState({ selectedFloor: floor, breadCrumbs });

    if (!roomId) {
      return;
    }

    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const [ selectedRoom, rooms ] = await Promise.all<ExhibitionRoom, ExhibitionRoom[]>([
      exhibitionRoomsApi.findExhibitionRoom({ exhibitionId: exhibitionId, roomId: roomId }),
      exhibitionRoomsApi.listExhibitionRooms({ exhibitionId: exhibitionId})
    ]);

    if (!selectedRoom) {
      return;
    }

    breadCrumbs.push({ name: selectedRoom?.name, url: `/exhibitions/${exhibitionId}/floorplan/floors/${exhibitionFloorId}/rooms/${roomId}` });
    this.setState({ selectedRoom: selectedRoom, rooms: rooms, breadCrumbs });

    if (!contentVersionId) {
      return;
    }

    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const groupContentVersionsApi = Api.getGroupContentVersionsApi(accessToken);
    const [ contentVersion, deviceGroups, groupContentVersions ] = await Promise.all<ContentVersion, ExhibitionDeviceGroup[], GroupContentVersion[]>([
      contentVersionsApi.findContentVersion({ exhibitionId: exhibitionId, contentVersionId: contentVersionId }),
      deviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId: exhibitionId, roomId: selectedRoom.id }),
      groupContentVersionsApi.listGroupContentVersions({ exhibitionId: exhibitionId })
    ]);

    breadCrumbs.push({ name: contentVersion?.name || "" });
    this.setState({ contentVersion, breadCrumbs, deviceGroups, groupContentVersions });

  }

  /**
   * Load device data
   */
  private loadDevices = async () => {
    const { exhibitionId, groupContentVersion, accessToken } = this.props;
    const { deviceGroups } = this.state;
    if (!exhibitionId || !deviceGroups) {
      return;
    }

    let tempDeviceGroups = [ ...deviceGroups ] as ExhibitionDeviceGroup[];

    if (groupContentVersion) {
      tempDeviceGroups = tempDeviceGroups.filter(group => group.id === groupContentVersion.deviceGroupId);
    }

    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    const antennasApi = Api.getRfidAntennasApi(accessToken);
    const [ allDevices, allAntennas ] = await Promise.all<ExhibitionDevice[], RfidAntenna[]>([
      devicesApi.listExhibitionDevices({ exhibitionId: exhibitionId }),
      antennasApi.listRfidAntennas({ exhibitionId: exhibitionId })
    ]);

    const filteredDevices: ExhibitionDevice[] = [];
    const filteredAntennas: RfidAntenna[] = [];
    tempDeviceGroups.forEach(group => {
      filteredDevices.push.apply(filteredDevices, allDevices.filter(device => device.groupId === group.id));
      filteredAntennas.push.apply(filteredAntennas, allAntennas.filter(antenna => antenna.groupId === group.id))
    });

    this.setState({
      devices: filteredDevices,
      antennas: filteredAntennas,
      selectedDeviceGroup: groupContentVersion ? tempDeviceGroups[0] : undefined
    });
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
    ] as ActionButton[];
  }

  /**
   * Handle dashboard click
   */
  private onDashboardButtonClick = () => {
    this.props.history.push(`/dashboard/overview`);
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
    accessToken: state.auth.accessToken as AccessToken,
    exhibitions: state.exhibitions.exhibitions,
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FloorPlanEditorView));