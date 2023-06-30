import Api from "../../api/api";
import {
  DeviceModel,
  Exhibition,
  ExhibitionDevice,
  ExhibitionDeviceGroup,
  ExhibitionFloor,
  ExhibitionRoom,
  RfidAntenna
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxState } from "../../store";
import styles from "../../styles/floor-plan-editor-view";
import { AccessToken, ActionButton } from "../../types";
import DiagnosticsProperties from "../diagnostics/diagnostics-properties";
import TagMonitoringView from "../diagnostics/tag-monitoring-view";
import EditorView from "../editor/editor-view";
import FloorPlanTreeMenu from "../floor-plan/floor-plan-tree-menu";
import { MqttListener } from "../generic/mqtt-listener";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import ElementSettingsPane from "../layouts/element-settings-pane";
import { CircularProgress } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { createRef } from "react";
import { connect } from "react-redux";
import TreeMenu, { TreeNodeInArray } from "react-simple-tree-menu";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId?: string;
  exhibitions: Exhibition[];
  deviceModels: DeviceModel[];
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  name: string;
  toolbarOpen: boolean;
  settingsOpen: boolean;
  exhibition?: Exhibition;
  floors: ExhibitionFloor[];
  rooms: ExhibitionRoom[];
  deviceGroups: ExhibitionDeviceGroup[];
  devices: ExhibitionDevice[];
  antennas: RfidAntenna[];
  selectedFloor?: ExhibitionFloor;
  selectedRoom?: ExhibitionRoom;
  selectedDeviceGroup?: ExhibitionDeviceGroup;
  selectedDevice?: ExhibitionDevice;
  selectedAntenna?: RfidAntenna;
  treeData: TreeNodeInArray[];
}

/**
 * Component for exhibition diagnostics screen
 */
export class DiagnosticsScreen extends React.Component<Props, State> {
  private treeRef = createRef<TreeMenu>();

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
      settingsOpen: false,
      floors: [],
      rooms: [],
      deviceGroups: [],
      devices: [],
      antennas: [],
      treeData: []
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
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = async (prevProps: Props) => {
    if (prevProps.exhibitions.length !== this.props.exhibitions.length) {
      this.setState({ loading: true });
      await this.fetchData();
      this.setState({ loading: false });
    }
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const {
      settingsOpen,
      exhibition,
      selectedFloor,
      selectedRoom,
      selectedDeviceGroup,
      selectedDevice,
      selectedAntenna,
      error
    } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary" />
        </div>
      );
    }

    const treeNodes = this.constructTreeData();
    const firstSelected = selectedFloor?.id || "";

    const devicePropertiesTitle = selectedAntenna
      ? strings.floorPlan.antenna.properties
      : selectedDevice
      ? strings.floorPlan.device.properties
      : selectedDeviceGroup
      ? strings.floorPlan.deviceGroup.properties
      : selectedRoom
      ? strings.floorPlan.room.properties
      : selectedFloor
      ? strings.floorPlan.floor.properties
      : "";

    return (
      <BasicLayout
        history={history}
        title={exhibition.name}
        breadcrumbs={[]}
        actionBarButtons={this.getActionButtons()}
        keycloak={keycloak}
        error={error}
        clearError={() => this.setState({ error: undefined })}
      >
        <div className={classes.editorLayout}>
          <ElementNavigationPane title={strings.floorPlan.structure} width={300}>
            <FloorPlanTreeMenu
              treeRef={this.treeRef}
              treeNodes={treeNodes}
              firstSelected={firstSelected}
            />
          </ElementNavigationPane>
          <EditorView>{this.renderMonitoring()}</EditorView>
          <ElementSettingsPane open={settingsOpen} width={420} title={devicePropertiesTitle}>
            {this.renderRightPanel()}
          </ElementSettingsPane>
        </div>
      </BasicLayout>
    );
  };

  /**
   * Renders monitoring
   */
  private renderMonitoring = () => {
    const { exhibitionId } = this.props;
    const { selectedAntenna } = this.state;

    if (selectedAntenna && exhibitionId) {
      return (
        <MqttListener key={selectedAntenna.id} onError={(error) => this.setState({ error })}>
          {(mqtt) => (
            <TagMonitoringView mqtt={mqtt} exhibitionId={exhibitionId} antenna={selectedAntenna} />
          )}
        </MqttListener>
      );
    }
  };

  /**
   * Renders right panel
   */
  private renderRightPanel = () => {
    const { deviceModels } = this.props;
    const { selectedRoom, deviceGroups, selectedDevice, selectedAntenna } = this.state;

    return (
      <DiagnosticsProperties
        selectedDevice={selectedDevice}
        selectedAntenna={selectedAntenna}
        deviceModels={deviceModels}
        deviceGroups={
          selectedRoom ? deviceGroups.filter((group) => group.roomId === selectedRoom.id) : []
        }
      />
    );
  };

  /**
   * Get action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    return [
      {
        name: this.state.settingsOpen
          ? strings.diagnostics.closeSettings
          : strings.diagnostics.openSettings,
        action: () => this.setState({ settingsOpen: !this.state.settingsOpen })
      }
    ];
  };

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitions, exhibitionId } = this.props;

    if (!accessToken || !exhibitionId) {
      return;
    }

    const exhibition = exhibitions.find((x) => x.id === exhibitionId);
    if (!exhibition) {
      return;
    }

    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const exhibitionDeviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const rfidAntennasApi = Api.getRfidAntennasApi(accessToken);

    const [floors, rooms, deviceGroups, devices, antennas] = await Promise.all([
      exhibitionFloorsApi.listExhibitionFloors({ exhibitionId }),
      exhibitionRoomsApi.listExhibitionRooms({ exhibitionId }),
      exhibitionDeviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId }),
      exhibitionDevicesApi.listExhibitionDevices({ exhibitionId }),
      rfidAntennasApi.listRfidAntennas({ exhibitionId })
    ]);

    const selectedFloor = floors[0];

    this.setState({
      exhibition,
      floors,
      rooms,
      deviceGroups,
      devices,
      antennas,
      selectedFloor
    });
  };

  /**
   * Constructs tree data
   *
   * @return array of tree nodes
   */
  private constructTreeData = (): TreeNodeInArray[] => {
    const { floors, rooms, deviceGroups, devices, antennas } = this.state;

    return floors.map((floor) => ({
      key: floor.id!,
      label: floor.name,
      pathInTree: `${floor.id}`,
      onClick: () => this.onFloorClick(floor.id!),
      nodes: rooms
        .filter((room) => room.floorId === floor.id)
        .map((room) => ({
          key: room.id!,
          label: room.name,
          pathInTree: `${floor.id}/${room.id}`,
          onClick: () => this.onRoomClick(floor.id!, room.id!),
          nodes: deviceGroups
            .filter((group) => group.roomId === room.id)
            .map((group) => ({
              key: group.id!,
              label: group.name,
              pathInTree: `${floor.id}/${room.id}/${group.id}`,
              onClick: () => this.onDeviceGroupClick(floor.id!, room.id!, group.id!),
              nodes: [
                ...devices
                  .filter((device) => device.groupId === group.id)
                  .map((device) => ({
                    key: device.id!,
                    label: device.name,
                    pathInTree: `${floor.id}/${room.id}/${group.id}/${device.id}`,
                    onClick: () => this.onDeviceClick(floor.id!, room.id!, group.id!, device.id!),
                    nodes: []
                  })),
                ...antennas
                  .filter((antenna) => antenna.groupId === group.id)
                  .map((antenna) => ({
                    key: antenna.id!,
                    label: antenna.name,
                    pathInTree: `${floor.id}/${room.id}/${group.id}/${antenna.id}`,
                    onClick: () => this.onAntennaClick(floor.id!, room.id!, group.id!, antenna.id!),
                    nodes: []
                  }))
              ]
            }))
        }))
    }));
  };

  /**
   * Event handler for floor click
   *
   * @param floorId selected floor id
   */
  private onFloorClick = (floorId: string) => {
    const { floors } = this.state;

    const itemPathInTree = `${floorId}`;
    this.updateOpenNodes(itemPathInTree);

    this.setState({
      selectedFloor: floors.find((floor) => floor.id === floorId),
      selectedRoom: undefined,
      selectedDeviceGroup: undefined,
      selectedDevice: undefined,
      selectedAntenna: undefined
    });
  };

  /**
   * Event handler for room click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   */
  private onRoomClick = (floorId: string, roomId: string) => {
    const { floors, rooms } = this.state;

    const itemPathInTree = `${floorId}/${roomId}`;
    this.updateOpenNodes(itemPathInTree);

    this.setState({
      selectedFloor: floors.find((floor) => floor.id === floorId),
      selectedRoom: rooms.find((room) => room.id === roomId),
      selectedDeviceGroup: undefined,
      selectedDevice: undefined,
      selectedAntenna: undefined
    });
  };

  /**
   * Event handler for device group click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   * @param deviceGroupId selected device group id
   */
  private onDeviceGroupClick = (floorId: string, roomId: string, deviceGroupId: string) => {
    const { floors, rooms, deviceGroups } = this.state;

    const itemPathInTree = `${floorId}/${roomId}/${deviceGroupId}`;
    this.updateOpenNodes(itemPathInTree);

    this.setState({
      selectedFloor: floors.find((floor) => floor.id === floorId),
      selectedRoom: rooms.find((room) => room.id === roomId),
      selectedDeviceGroup: deviceGroups.find((group) => group.id === deviceGroupId),
      selectedDevice: undefined,
      selectedAntenna: undefined
    });
  };

  /**
   * Event handler for device click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   * @param deviceGroupId selected device group id
   * @param deviceId selected device id
   */
  private onDeviceClick = (
    floorId: string,
    roomId: string,
    deviceGroupId: string,
    deviceId: string
  ) => {
    const { floors, rooms, deviceGroups, devices } = this.state;

    const itemPathInTree = `${floorId}/${roomId}/${deviceGroupId}/${deviceId}`;
    this.updateOpenNodes(itemPathInTree);

    this.setState({
      selectedFloor: floors.find((floor) => floor.id === floorId),
      selectedRoom: rooms.find((room) => room.id === roomId),
      selectedDeviceGroup: deviceGroups.find((group) => group.id === deviceGroupId),
      selectedDevice: devices.find((device) => device.id === deviceId),
      selectedAntenna: undefined
    });
  };

  /**
   * Event handler for antenna click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   * @param deviceGroupId selected device group id
   * @param antennaId selected antenna id
   */
  private onAntennaClick = (
    floorId: string,
    roomId: string,
    deviceGroupId: string,
    antennaId: string
  ) => {
    const { floors, rooms, deviceGroups, antennas } = this.state;

    const itemPathInTree = `${floorId}/${roomId}/${deviceGroupId}/${antennaId}`;
    this.updateOpenNodes(itemPathInTree);

    this.setState({
      selectedFloor: floors.find((floor) => floor.id === floorId),
      selectedRoom: rooms.find((room) => room.id === roomId),
      selectedDeviceGroup: deviceGroups.find((group) => group.id === deviceGroupId),
      selectedDevice: undefined,
      selectedAntenna: antennas.find((antenna) => antenna.id === antennaId)
    });
  };

  /**
   * Updates open nodes to tree menu
   *
   * @param itemPathInTree item path in tree as string
   */
  private updateOpenNodes = (itemPathInTree: string) => {
    const treeRef = this.treeRef.current;

    if (!treeRef) {
      return;
    }

    const { openNodes } = treeRef.state;
    const previousOpenNodes = openNodes.filter((node) => !node.includes(itemPathInTree));
    const newOpenNodes = this.constructOpenNodesList(itemPathInTree);

    treeRef.resetOpenNodes([...previousOpenNodes, ...newOpenNodes], itemPathInTree);
  };

  /**
   * Constructs a list of new open nodes for tree menu
   *
   * @param itemPathInTree path of selected item in tree
   * @returns list of open node key strings
   */
  private constructOpenNodesList = (itemPathInTree: string) => {
    return itemPathInTree.split("/").map((_, index, array) => array.slice(0, index + 1).join("/"));
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state Redux store state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak as KeycloakInstance,
  accessToken: state.auth.accessToken as AccessToken,
  exhibitions: state.exhibitions.exhibitions,
  deviceModels: state.devices.deviceModels
});

export default connect(mapStateToProps)(withStyles(styles)(DiagnosticsScreen));
