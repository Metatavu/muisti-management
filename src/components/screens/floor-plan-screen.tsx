import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { produce, Draft } from "immer";
import Api from "../../api/api";
import { History } from "history";
import styles from "../../styles/floor-plan-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionFloor, Coordinates, Bounds, ExhibitionRoom, ExhibitionDevice, ExhibitionDeviceGroup, DeviceModel, RfidAntenna } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import FileUploader from "../generic/file-uploader";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, BreadcrumbData, ActionButton } from "../../types";
import strings from "../../localization/strings";
import "cropperjs/dist/cropper.css";
import FloorPlanCrop from "../floor-plan/floor-plan-crop";
import FloorPlanCropProperties from "../floor-plan/floor-plan-crop-properties";
import * as cropperjs from "cropperjs";
import FileUpload from "../../utils/file-upload";
import { LatLngExpression, LatLngBounds } from "leaflet";
import FloorPlanMap from "../generic/floor-plan-map";
import { TreeNodeInArray } from "react-simple-tree-menu";
import FloorPlanTreeMenu from "../floor-plan/floor-plan-tree-menu";
import FloorPlanInfo from "../floor-plan/floor-plan-info";
import { createRef } from "react";

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
  cropping: boolean;
  cropImageDataUrl?: string;
  cropImageData?: Blob;
  cropImageDetails?: cropperjs.default.ImageData;
  addImageDialogOpen: boolean;
  selectedItemHasNodes: boolean;
}

/**
 * Component for exhibition floor plan editor
 */
export class FloorPlanScreen extends React.Component<Props, State> {

  private mapRef = createRef<FloorPlanMap>();

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
      cropping: false,
      floors: [],
      rooms: [],
      deviceGroups: [],
      devices: [],
      antennas: [],
      treeData: [],
      addImageDialogOpen: false,
      selectedItemHasNodes: false
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
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history } = this.props;
    const {
      exhibition,
      addImageDialogOpen,
      selectedFloor,
      selectedRoom,
      selectedDeviceGroup,
      selectedDevice,
      selectedAntenna } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const treeNodes = this.constructTreeData();
    const firstSelected = selectedFloor?.id || "";
    
    const devicePropertiesTitle =
      selectedAntenna ?
      strings.floorPlan.antenna.properties :
      selectedDevice ?
      strings.floorPlan.device.properties :
      selectedDeviceGroup ?
      strings.floorPlan.deviceGroup.properties :
      selectedRoom ?
      strings.floorPlan.room.properties :
      selectedFloor ?
      strings.floorPlan.floor.properties :
      "";
    
    return (
      <BasicLayout
        history={ history }
        title={ exhibition.name }
        breadcrumbs={ this.getBreadcrumbsData() }
        actionBarButtons={ this.getActionButtons() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.floorPlan.structure }>
            <FloorPlanTreeMenu treeNodes={ treeNodes } firstSelected={ firstSelected } />
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditor() }
          </EditorView>

          <ElementSettingsPane
            open={ true }
            width={ 420 }
            title={ devicePropertiesTitle }
          >
            { this.renderRightPanel() }
          </ElementSettingsPane>
        </div>
        <FileUploader
          controlled
          open={ addImageDialogOpen }
          onClose={ this.toggleUploadNewImageDialog }
          uploadKey="new"
          buttonText={ strings.floorPlan.toolbar.upload }
          allowedFileTypes={ [ "image/png" ] }
          onSave={ this.onUploadSave }
        />
      </BasicLayout>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditor = () => {
    const { cropping, cropImageDataUrl, selectedFloor, selectedRoom, selectedDeviceGroup, selectedDevice, selectedAntenna, selectedItemHasNodes } = this.state;
    const { exhibitionId, accessToken, deviceModels } = this.props;

    if (cropping && cropImageDataUrl ) {
      return (
        <FloorPlanCrop
          imageDataUrl={ cropImageDataUrl }
          onDetailsUpdate={ this.onCropDetailsUpdate }
          onDataUpdate={ this.onCropDataUpdate }
        />
      );
    }

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
        readOnly: false
      };

      const mapData = this.filterMapData();

      const selectedItems = {
        floor: selectedFloor,
        room: selectedRoom,
        deviceGroup: selectedDeviceGroup,
        device: selectedDevice,
        antenna: selectedAntenna,
        selectedItemHasNodes: selectedItemHasNodes
      };

      return <FloorPlanMap
        ref={ this.mapRef }
        key={ "floorPlanMap" }
        accessToken={ accessToken }
        deviceModels={ deviceModels }
        exhibitionId={ exhibitionId }
        mapData={ mapData }
        floorPlanInfo={ floorPlanInfo }
        selectedItems={ selectedItems }
        onRoomAdd={ this.onRoomAddClick }
        onRoomSave={ this.onRoomSaveClick }
        onRoomClick={ this.onRoomClick }
        onDeviceAdd={ this.onDeviceAddClick }
        onDeviceSave={ this.onDeviceSaveClick }
        onDeviceClick={ this.onDeviceClick }
        onAntennaAdd={ this.onAntennaAddClick }
        onAntennaSave={ this.onAntennaSaveClick }
        onAntennaClick={ this.onAntennaClick }
      />;
    }
    return null;
  }

  /**
   * Renders right panel
   */
  private renderRightPanel = () => {
    const { deviceModels } = this.props;
    const { cropping, cropImageDataUrl, selectedFloor, rooms, selectedRoom, selectedDeviceGroup, deviceGroups, selectedDevice, selectedAntenna } = this.state;
    if (cropping && cropImageDataUrl) {
      return <FloorPlanCropProperties
        imageHeight={ this.state.cropImageDetails?.height }
        imageWidth={ this.state.cropImageDetails?.width }
        naturalWidth={ this.state.cropImageDetails?.naturalWidth }
        naturalHeight={ this.state.cropImageDetails?.naturalHeight }
        onCropPropertyChange={ this.onCropPropertyChange }
      />;
    } else {
      return (
        <FloorPlanInfo
          selectedFloor={ selectedFloor }
          selectedRoom={ selectedRoom }
          selectedDeviceGroup={ selectedDeviceGroup }
          selectedDevice={ selectedDevice }
          selectedAntenna={ selectedAntenna }
          deviceModels={ deviceModels }
          rooms={ selectedRoom ? rooms.filter(room => room.id === selectedRoom.id) : [] }
          deviceGroups={ selectedRoom ? deviceGroups.filter(group => group.roomId === selectedRoom.id) : [] }
          onChangeFloorProperties={ this.onChangeFloorProperties }
          onChangeRoomProperties={ this.onChangeRoomProperties }
          onChangeDeviceGroupProperties={ this.onChangeDeviceGroupProperties }
          onChangeDeviceProperties={ this.onChangeDeviceProperties }
          onChangeAntennaProperties={ this.onChangeAntennaProperties }
        />
      );
    }
  }

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitions, exhibitionId } = this.props;
    if (!accessToken || !exhibitionId) {
      return;
    }

    const exhibition = exhibitions.find(x => x.id === exhibitionId);
    if (!exhibition) {
      return;
    }

    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const exhibitionDeviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const rfidAntennasApi = Api.getRfidAntennasApi(accessToken);
    const [ floors, rooms, deviceGroups, devices, antennas ] =
      await Promise.all<ExhibitionFloor[], ExhibitionRoom[], ExhibitionDeviceGroup[], ExhibitionDevice[], RfidAntenna[]>(
        [
          exhibitionFloorsApi.listExhibitionFloors({ exhibitionId }),
          exhibitionRoomsApi.listExhibitionRooms({ exhibitionId }),
          exhibitionDeviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId }),
          exhibitionDevicesApi.listExhibitionDevices({ exhibitionId }),
          rfidAntennasApi.listRfidAntennas({ exhibitionId })
        ]
      );
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
  }

  /**
   * Constructs tree data
   *
   * @return array of tree nodes
   */
  private constructTreeData = () => {
    const { floors, rooms, deviceGroups, devices, antennas } = this.state;

    const treeData: TreeNodeInArray[] = floors.map(floor => {
      return {
        key: floor.id!,
        label: floor.name,
        onClick: (hasNodes: boolean) => this.onFloorClick(floor.id!, hasNodes),
        nodes: rooms.filter(room => room.floorId === floor.id).map(room => {
          return {
            key: room.id!,
            label: room.name,
            onClick: (hasNodes: boolean) => this.onRoomClick(floor.id!, room.id!, hasNodes),
            nodes: deviceGroups.filter(group => group.roomId === room.id).map(group => {
              return {
                key: group.id!,
                label: group.name,
                onClick: (hasNodes: boolean) => this.onDeviceGroupClick(floor.id!, room.id!, group.id!, hasNodes),
                nodes:
                  [
                    ...devices.filter(device => device.groupId === group.id).map(device => {
                      return {
                        key: device.id!,
                        label: device.name,
                        onClick: (hasNodes: boolean) => this.onDeviceClick(floor.id!, room.id!, group.id!, device.id!, hasNodes),
                        nodes: [],
                      };
                    }),
                    ...antennas.filter(antenna => antenna.groupId === group.id).map(antenna => {
                      return {
                        key: antenna.id!,
                        label: antenna.name,
                        onClick: (hasNodes: boolean) => this.onAntennaClick(floor.id!, room.id!, group.id!, antenna.id!, hasNodes),
                        nodes: [],
                      };
                    }),
                  ]
              };
            })
          };
        })
      };
    });

    return treeData;
  }

  /**
   * Get breadcrumbs data
   *
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { exhibition } = this.state;
    return [
      { name: strings.floorPlan.listTitle, url: "/v4/floorPlans" },
      { name: exhibition?.name || "" }
    ] as BreadcrumbData[];
  }

  /**
   * Gets action buttons
   *
   * @returns array of action button objects
   */
  private getActionButtons = (): ActionButton[] => {
    const { selectedFloor, selectedRoom, selectedDeviceGroup, selectedDevice, selectedAntenna, selectedItemHasNodes } = this.state;

    if (selectedAntenna) {
      return [
        { name: strings.floorPlan.antenna.move, action: () => this.mapRef.current!.editAntennaMarker() },
        { name: strings.generic.save, action: () => this.mapRef.current!.saveAntennaMarker() },
        { name: strings.floorPlan.antenna.delete, action: this.onAntennaDeleteClick }
      ] as ActionButton[];
    }

    if (selectedDevice) {
      return [
        { name: strings.floorPlan.device.move, action: () => this.mapRef.current!.editDeviceMarker() },
        { name: strings.generic.save, action: () => this.mapRef.current!.saveDeviceMarker() },
        { name: strings.floorPlan.device.delete, action: this.onDeviceDeleteClick },
      ] as ActionButton[];
    }

    if (selectedDeviceGroup) {
      return [
        { name: strings.floorPlan.device.add, action: () => this.mapRef.current!.addDeviceMarker() },
        { name: strings.floorPlan.antenna.add, action: () => this.mapRef.current!.addAntennaMarker() },
        { name: strings.generic.save, action: this.onDeviceGroupSaveClick },
        { name: strings.floorPlan.deviceGroup.delete,
          action: selectedItemHasNodes ? () => alert(strings.floorPlan.hasChildElements) : this.onDeviceGroupDeleteClick
        }
      ] as ActionButton[];
    }

    if (selectedRoom) {
      return [
        { name: strings.floorPlan.deviceGroup.add, action: this.onDeviceGroupAddClick },
        { name: strings.floorPlan.room.edit, action: () => this.mapRef.current!.editRoom() },
        { name: strings.generic.save, action: () => this.mapRef.current!.saveRoom() },
        { name: strings.floorPlan.room.delete,
          action: selectedItemHasNodes ? () => alert(strings.floorPlan.hasChildElements) : this.onRoomDeleteClick
        }
      ] as ActionButton[];
    }

    if (selectedFloor) {
      return [
        { name: strings.floorPlan.toolbar.upload, action: this.toggleUploadNewImageDialog },
        { name: strings.floorPlan.floor.add, action: this.onFloorAddClick },
        { name: strings.floorPlan.room.add, action: () => this.mapRef.current!.addRoom() },
        { name: strings.generic.save, action: this.onFloorSaveClick },
        { name: strings.floorPlan.floor.delete,
          action: selectedItemHasNodes ? () => alert(strings.floorPlan.hasChildElements) : this.onFloorDeleteClick
        }
      ] as ActionButton[];
    }

    return [];
  }

  /**
   * Filter map data for leaflet
   */
  private filterMapData = () => {
    const { selectedFloor, rooms, selectedRoom, deviceGroups, selectedDeviceGroup, devices, antennas } = this.state;
    const data: any = { };

    if (selectedDeviceGroup) {
      data.rooms = [ selectedRoom ];
      data.deviceGroups = [ selectedDeviceGroup ];
      data.devices = devices.filter(device => device.groupId === selectedDeviceGroup.id);
      data.antennas = antennas.filter(antenna => antenna.groupId === selectedDeviceGroup.id);
      return data;
    }

    if (selectedRoom) {
      data.rooms = [ selectedRoom ];
      data.deviceGroups = deviceGroups.filter(deviceGroup => deviceGroup.roomId === selectedRoom.id);
      return data;
    }

    if (selectedFloor) {
      data.rooms = rooms.filter(room => room.floorId === selectedFloor.id);
      return data;
    }

    return data;
  }

  /**
   * Get bounds from cropImageDetails
   *
   * @returns bounds object if crop image details are found, otherwise returns undefined
   */
  private getBounds = (): Bounds | undefined => {
    const { cropImageDetails } = this.state;

    if (!cropImageDetails) {
      return;
    }

    const swCorner: Coordinates = {
      latitude: 0.0,
      longitude: 0.0
    };

    const neCorner: Coordinates = {
      latitude: cropImageDetails.naturalWidth,
      longitude: cropImageDetails.naturalHeight
    };

    const floorBounds: Bounds = {
      northEastCorner : neCorner,
      southWestCorner : swCorner
    };

    return floorBounds;
  }

  /**
   * Updates floor's floor plan image
   *
   * @param data image data
   */
  private updateFloorPlanImage = async (data: Blob) => {
    const { selectedFloor } = this.state;
    if (!selectedFloor || !selectedFloor.id || !selectedFloor.exhibitionId) {
      return;
    }

    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(this.props.accessToken);
    const uploadedFile = await FileUpload.uploadFile(data, `/floorplans/${selectedFloor.exhibitionId}`);
    const updatedFloor = await exhibitionFloorsApi.updateExhibitionFloor({
      floorId: selectedFloor.id,
      exhibitionId: selectedFloor.exhibitionId,
      exhibitionFloor: {
        ...selectedFloor,
        floorPlanUrl: uploadedFile.uri,
        floorPlanBounds : this.getBounds()
      }
    });

    this.setState(
      produce((draft: Draft<State>) => {
        const { floors } = draft;
        const floorIndex = floors.findIndex(floor => floor.id === selectedFloor.id);
        if (floorIndex > -1) {
          draft.floors.splice(floorIndex, 1, updatedFloor);
          draft.selectedFloor = updatedFloor;
        }
      })
    );
  }

  /**
   * Toggle upload new image dialog
   */
  private toggleUploadNewImageDialog = () => {
    this.setState({ addImageDialogOpen: !this.state.addImageDialogOpen });
  }

  /**
   * Event handler for crop details update
   *
   * @param details details
   */
  private onCropDetailsUpdate = (details: cropperjs.default.ImageData) => {
    this.setState({
      cropImageDetails: details
    });
  }

  /**
   * Event handler for crop data update
   *
   * @param data data as Blob
   */
  private onCropDataUpdate = (data: Blob) => {
    this.setState({
      cropImageData: data,
    });
  }

  /**
   * Event handler for crop property data change
   *
   * @param key crop property key
   * @param value crop property value
   */
  private onCropPropertyChange = (key: string, value: number) => {
    const updatedDetails = { ...this.state.cropImageDetails!, [key] : value };
    this.setState({
      cropImageDetails : updatedDetails
    });
  }

  /**
   * Event handler for upload save click
   *
   * @param files files
   * @param key  upload key
   */
  private onUploadSave = (files: File[], _key?: string) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = event => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          this.setState({
            cropImageDataUrl: dataUrl as string,
            cropping: true
          });
        }
      };

      reader.readAsDataURL(file);
      this.setState({
        addImageDialogOpen: false
      });
    }
  }

  /**
   * Event handler for add floor click
   */
  private onFloorAddClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    if (!exhibitionId) {
      return;
    }

    const newFloor = await this.createFloor(accessToken, exhibitionId, { name: strings.floorPlan.floor.new });

    this.setState(
      produce((draft: Draft<State>) => {
        draft.floors.push(newFloor);
      })
    );
  }

  /**
   * Event handler for floor delete click
   */
  private onFloorDeleteClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedFloor } = this.state;
    if (!exhibitionId || !selectedFloor || !selectedFloor.id) {
      return;
    }

    // TODO: Add nicer dialog
    if (!window.confirm(strings.generic.confirmDelete)) {
      return;
    }

    this.deleteFloor(accessToken, exhibitionId, selectedFloor.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { floors } = draft;
        const floorIndex = floors.findIndex(floor => floor.id === selectedFloor.id);
        if (floorIndex > -1) {
          floors.splice(floorIndex, 1);
          draft.selectedFloor = undefined;
        }
      })
    );
  }

  /**
   * Event handler for save floor click
   */
  private onFloorSaveClick = async () => {
    const { exhibitionId } = this.props;
    const { cropping, cropImageData, selectedFloor } = this.state;

    if (cropping && cropImageData) {
      await this.updateFloorPlanImage(cropImageData);

      this.setState({
        cropping: false
      });
    } else {
      const { accessToken } = this.props;
      if (!selectedFloor || !selectedFloor.id || !exhibitionId) {
        return;
      }

      const updatedFloor = await this.updateFloor(accessToken, exhibitionId, selectedFloor, selectedFloor.id);

      this.setState(
        produce((draft: Draft<State>) => {
          const { floors } = draft;
          const floorIndex = floors.findIndex(floor => floor.id === selectedFloor.id);
          if (floorIndex > -1) {
            floors.splice(floorIndex, 1, updatedFloor);
            draft.selectedFloor = undefined;
          }
        })
      );
    }
  }

  /**
   * Event handler for add room click
   * @param roomToCreate exhibition room to create
   */
  private onRoomAddClick = async (roomToCreate: ExhibitionRoom) => {
    const { accessToken, exhibitionId } = this.props;
    if (!exhibitionId) {
      return;
    }

    const newRoom = await this.createRoom(accessToken, exhibitionId, roomToCreate);

    this.setState(
      produce((draft: Draft<State>) => {
        draft.rooms.push(newRoom);
        draft.selectedRoom = newRoom;
      })
    );
  }

  /**
   * Event handler for delete room click
   */
  private onRoomDeleteClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedRoom } = this.state;
    if (!exhibitionId || !selectedRoom || !selectedRoom.id) {
      return;
    }

    // TODO: Add nicer dialog
    if (!window.confirm(strings.generic.confirmDelete)) {
      return;
    }

    this.deleteRoom(accessToken, exhibitionId, selectedRoom.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { rooms } = draft;
        const roomIndex = rooms.findIndex(room => room.id === selectedRoom.id);
        if (roomIndex > -1) {
          rooms.splice(roomIndex, 1);
          draft.selectedRoom = undefined;
        }
      })
    );

    this.mapRef.current!.deleteRoom();
  }

  /**
   * Event handler for on save room click
   * @param roomToUpdate room to update
   */
  private onRoomSaveClick = async (roomToUpdate: ExhibitionRoom) => {
    const { accessToken, exhibitionId } = this.props;
    if (!exhibitionId || !roomToUpdate || !roomToUpdate.id) {
      return;
    }

    const updatedRoom = await this.updateRoom(accessToken, exhibitionId, roomToUpdate, roomToUpdate.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { rooms } = draft;
        const roomIndex = rooms.findIndex(room => room.id === roomToUpdate.id);
        if (roomIndex > -1) {
          rooms.splice(roomIndex, 1, updatedRoom);
        }
      })
    );
  }

  /**
   * Event handler for add device group click
   */
  private onDeviceGroupAddClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedRoom } = this.state;
    if (!exhibitionId || !selectedRoom || !selectedRoom.id) {
      return;
    }

    const groupToCreate: ExhibitionDeviceGroup = {
      name: strings.floorPlan.deviceGroup.new,
      allowVisitorSessionCreation: false,
      roomId: selectedRoom.id
    };

    const newDeviceGroup = await this.createDeviceGroup(accessToken, exhibitionId, groupToCreate);

    this.setState(
      produce((draft: Draft<State>) => {
        draft.deviceGroups.push(newDeviceGroup);
      })
    );
  }

  /**
   * Event handler for on save device group click
   */
  private onDeviceGroupSaveClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedDeviceGroup } = this.state;
    if (!exhibitionId || !selectedDeviceGroup || !selectedDeviceGroup.id) {
      return;
    }

    const updatedDeviceGroup = await this.updateDeviceGroup(accessToken, exhibitionId, selectedDeviceGroup, selectedDeviceGroup.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { deviceGroups } = draft;
        const groupIndex = deviceGroups.findIndex(group => group.id === selectedDeviceGroup.id);
        if (groupIndex > -1) {
          deviceGroups.splice(groupIndex, 1, updatedDeviceGroup);
        }
      })
    );
  }

  /**
   * Event handler for device group delete click
   */
  private onDeviceGroupDeleteClick = async () => {

    const { accessToken, exhibitionId } = this.props;
    const { selectedDeviceGroup } = this.state;
    if (!exhibitionId || !selectedDeviceGroup || !selectedDeviceGroup.id) {
      return;
    }

    // TODO: Add nicer dialog
    if (!window.confirm(strings.generic.confirmDelete)) {
      return;
    }

    this.deleteDeviceGroup(accessToken, exhibitionId, selectedDeviceGroup.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { deviceGroups } = draft;
        const deviceGroupIndex = deviceGroups.findIndex(deviceGroup => deviceGroup.id === selectedDeviceGroup.id);
        if (deviceGroupIndex > -1) {
          deviceGroups.splice(deviceGroupIndex, 1);
          draft.selectedDeviceGroup = undefined;
        }
      })
    );
  }

  /**
   * Event handler for add device click
   * @param deviceToCreate exhibition device to create
   */
  private onDeviceAddClick = async (deviceToCreate: ExhibitionDevice) => {
    const { accessToken, exhibitionId } = this.props;
    if (!exhibitionId) {
      return;
    }

    const newDevice = await this.createDevice(accessToken, exhibitionId, deviceToCreate);
    this.setState(
      produce((draft: Draft<State>) => {
        draft.devices.push(newDevice);
      })
    );
  }

  /**
   * Event handler for delete device click
   */
  private onDeviceDeleteClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedDevice } = this.state;
    if (!exhibitionId || !selectedDevice || !selectedDevice.id) {
      return;
    }

    // TODO: Add nicer dialog
    if (!window.confirm(strings.generic.confirmDelete)) {
      return;
    }

    this.deleteDevice(accessToken, exhibitionId, selectedDevice.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { devices } = draft;
        const deviceIndex = devices.findIndex(device => device.id === selectedDevice.id);
        if (deviceIndex > -1) {
          devices.splice(deviceIndex, 1);
          draft.selectedDevice = undefined;
        }
      })
    );

    this.mapRef.current!.deleteDevice();
  }

  /**
   * Event handler for on save device click
   * @param deviceToUpdate exhibition device to update
   */
  private onDeviceSaveClick = async (deviceToUpdate: ExhibitionDevice) => {
    const { accessToken, exhibitionId } = this.props;
    if (!exhibitionId || !deviceToUpdate.id || !deviceToUpdate.exhibitionId) {
      return;
    }
    const updatedDevice = await this.updateDevice(accessToken, exhibitionId, deviceToUpdate, deviceToUpdate.id);
    this.setState(
      produce((draft: Draft<State>) => {
        const { devices } = draft;
        const deviceIndex = devices.findIndex(device => device.id === deviceToUpdate.id);
        if (deviceIndex > -1) {
          devices.splice(deviceIndex, 1, updatedDevice);
          draft.selectedDevice = updatedDevice;
        }
      })
    );
  }

  /**
   * Event handler for add antenna click
   *
   * @param antennaToCreate exhibition antenna to create
   */
  private onAntennaAddClick = async (antennaToCreate: RfidAntenna) => {
    const { accessToken, exhibitionId } = this.props;
    if (!exhibitionId) {
      return;
    }

    const newAntenna = await this.createAntenna(accessToken, exhibitionId, antennaToCreate);
    this.setState(
      produce((draft: Draft<State>) => {
        draft.antennas.push(newAntenna);
      })
    );
  }

  /**
   * Event handler for delete antenna click
   */
  private onAntennaDeleteClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedAntenna } = this.state;
    if (!exhibitionId || !selectedAntenna || !selectedAntenna.id) {
      return;
    }

    // TODO: Add nicer dialog
    if (!window.confirm(strings.generic.confirmDelete)) {
      return;
    }

    this.deleteAntenna(accessToken, exhibitionId, selectedAntenna.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { antennas } = draft;
        const antennaIndex = antennas.findIndex(antenna => antenna.id === selectedAntenna.id);
        if (antennaIndex > -1) {
          antennas.splice(antennaIndex, 1);
          draft.selectedAntenna = undefined;
        }
      })
    );

    this.mapRef.current!.deleteAntenna();
  }

  /**
   * Event handler for on save antenna click
   *
   * @param antennaToUpdate antenna to update
   */
  private onAntennaSaveClick = async (antennaToUpdate: RfidAntenna) => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedDeviceGroup } = this.state;
    if (!exhibitionId || !antennaToUpdate.id || !antennaToUpdate.exhibitionId) {
      return;
    }

    const updatedAntenna = await this.updateAntenna(accessToken, exhibitionId, antennaToUpdate, antennaToUpdate.id);

    this.setState(
      produce((draft: Draft<State>) => {
        const { antennas } = draft;
        const antennaIndex = antennas.findIndex(antenna => antenna.id === antennaToUpdate.id);
        if (antennaIndex > -1) {
          antennas.splice(antennaIndex, 1, updatedAntenna);
          if (selectedDeviceGroup && selectedDeviceGroup.id !== antennaToUpdate.groupId ) {
            this.mapRef.current!.deleteAntenna();
            draft.selectedAntenna = undefined;
          } else {
            draft.selectedAntenna = updatedAntenna;
          }
        }
      })
    );
  }

  /**
   * Event handler for floor click
   *
   * @param floorId selected floor id
   * @param hasNodes has child nodes
   */
  private onFloorClick = (floorId: string, hasNodes: boolean) => {
    const { floors } = this.state;

    this.setState({
      selectedFloor: floors.find(floor => floor.id === floorId),
      selectedRoom: undefined,
      selectedDeviceGroup: undefined,
      selectedDevice: undefined,
      selectedAntenna: undefined,
      selectedItemHasNodes: hasNodes
    });
  }

  /**
   * Event handler for room click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   * @param hasNodes has child nodes
   */
  private onRoomClick = (floorId: string, roomId: string, hasNodes: boolean) => {
    const { floors, rooms } = this.state;

    this.setState({
      selectedFloor: floors.find(floor => floor.id === floorId),
      selectedRoom: rooms.find(room => room.id === roomId),
      selectedDeviceGroup: undefined,
      selectedDevice: undefined,
      selectedAntenna: undefined,
      selectedItemHasNodes: hasNodes
    });
  }

  /**
   * Event handler for device group click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   * @param deviceGroupId selected device group id
   * @param hasNodes has child nodes
   */
  private onDeviceGroupClick = (floorId: string, roomId: string, deviceGroupId: string, hasNodes: boolean) => {
    const { floors, rooms, deviceGroups } = this.state;

    this.setState({
      selectedFloor: floors.find(floor => floor.id === floorId),
      selectedRoom: rooms.find(room => room.id === roomId),
      selectedDeviceGroup: deviceGroups.find(group => group.id === deviceGroupId),
      selectedDevice: undefined,
      selectedAntenna: undefined,
      selectedItemHasNodes: hasNodes
    });
  }

  /**
   * Event handler for device click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   * @param deviceGroupId selected device group id
   * @param deviceId selected device id
   * @param hasNodes has child nodes
   */
  private onDeviceClick = (floorId: string, roomId: string, deviceGroupId: string, deviceId: string, hasNodes: boolean) => {
    const { floors, rooms, deviceGroups, devices } = this.state;

    this.setState({
      selectedFloor: floors.find(floor => floor.id === floorId),
      selectedRoom: rooms.find(room => room.id === roomId),
      selectedDeviceGroup: deviceGroups.find(group => group.id === deviceGroupId),
      selectedDevice: devices.find(device => device.id === deviceId),
      selectedAntenna: undefined,
      selectedItemHasNodes: hasNodes
    });
  }

  /**
   * Event handler for antenna click
   *
   * @param floorId selected floor id
   * @param roomId selected room id
   * @param deviceGroupId selected device group id
   * @param antennaId selected antenna id
   * @param hasNodes has child nodes
   */
  private onAntennaClick = (floorId: string, roomId: string, deviceGroupId: string, antennaId: string, hasNodes: boolean) => {
    const { floors, rooms, deviceGroups, antennas } = this.state;

    this.setState({
      selectedFloor: floors.find(floor => floor.id === floorId),
      selectedRoom: rooms.find(room => room.id === roomId),
      selectedDeviceGroup: deviceGroups.find(group => group.id === deviceGroupId),
      selectedDevice: undefined,
      selectedAntenna: antennas.find(antenna => antenna.id === antennaId),
      selectedItemHasNodes: hasNodes
    });
  }

  /**
   * Event handler for change floor properties
   *
   * @param event event
   */
  private onChangeFloorProperties = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedFloor } = this.state;
    const { name, value } = event.target;
    if (!selectedFloor) {
      return;
    }

    const updatedFloor: ExhibitionFloor = { ...selectedFloor, [name as keyof ExhibitionFloor]: value };
    this.setState({
      selectedFloor: updatedFloor
    });
  }

  /**
   * Event handler for change room properties
   *
   * @param event event
   */
  private onChangeRoomProperties = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedRoom } = this.state;
    const { name, value } = event.target;
    if (!selectedRoom) {
      return;
    }

    const updatedRoom: ExhibitionRoom = { ...selectedRoom, [name as keyof ExhibitionRoom]: value };
    this.setState({
      selectedRoom: updatedRoom
    });
  }

  /**
   * Event handler for change device group properties
   *
   * @param event event
   */
  private onChangeDeviceGroupProperties = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedDeviceGroup } = this.state;
    const { name, value, checked } = event.target;
    if (!selectedDeviceGroup) {
      return;
    }

    const updatedDeviceGroup: ExhibitionDeviceGroup = { ...selectedDeviceGroup,
      [name as keyof ExhibitionDeviceGroup]: name === "allowVisitorSessionCreation" ? checked : value
    };
    this.setState({
      selectedDeviceGroup: updatedDeviceGroup
    });
  }

  /**
   * Event handler for change device properties
   *
   * @param event event
   */
  private onChangeDeviceProperties = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { selectedDevice } = this.state;
    const { name, value } = event.target;
    if (!selectedDevice) {
      return;
    }

    const updatedDevice: ExhibitionDevice = { ...selectedDevice, [name as keyof ExhibitionDevice]: value };

    this.setState({
      selectedDevice: updatedDevice
    });
  }

  /**
   * Event handler for change antenna properties
   *
   * @param event event
   */
  private onChangeAntennaProperties = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { selectedAntenna } = this.state;
    const { name, value } = event.target;
    if (!selectedAntenna) {
      return;
    }

    const updatedAntenna: RfidAntenna = { ...selectedAntenna, [name as keyof RfidAntenna]: value };

    this.setState({
      selectedAntenna: updatedAntenna
    });
  }

  /**
   * Create floor handler
   *
   * @param accessToken keycloak access token access token
   * @param exhibitionId exhibition id exhibition id
   * @param exhibitionFloor
   */
  private createFloor = async (accessToken: AccessToken, exhibitionId: string, exhibitionFloor: ExhibitionFloor): Promise<ExhibitionFloor> => {
    const floorsApi = Api.getExhibitionFloorsApi(accessToken);
    const createdFloor = await floorsApi.createExhibitionFloor({
      exhibitionId: exhibitionId,
      exhibitionFloor: exhibitionFloor
    });

    return createdFloor;
  };

  /**
   * Delete floor handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param floorId floor id
   */
  private deleteFloor = async (accessToken: AccessToken, exhibitionId: string, floorId: string) => {
    const floorsApi = Api.getExhibitionFloorsApi(accessToken);
    floorsApi.deleteExhibitionFloor({
      exhibitionId: exhibitionId,
      floorId: floorId
    });
  };

  /**
   * Update floor handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param floorToUpdate floor to update
   * @param floorId floor id
   */
  // tslint:disable-next-line: max-line-length
  private updateFloor = async (accessToken: AccessToken, exhibitionId: string, floorToUpdate: ExhibitionFloor, floorId: string): Promise<ExhibitionFloor> => {
    const floorsApi = Api.getExhibitionFloorsApi(accessToken);
    const updatedFloor = floorsApi.updateExhibitionFloor({
      exhibitionId: exhibitionId,
      exhibitionFloor: floorToUpdate,
      floorId: floorId
    });

    return updatedFloor;
  };

  /**
   * Create room handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param roomToCreate room to create
   */
  private createRoom = async (accessToken: AccessToken, exhibitionId: string, roomToCreate: ExhibitionRoom): Promise<ExhibitionRoom> => {
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const newRoom = roomsApi.createExhibitionRoom({
      exhibitionId: exhibitionId,
      exhibitionRoom: roomToCreate
    });

    return newRoom;
  };

  /**
   * Delete room handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param roomId room id
   */
  private deleteRoom = async (accessToken: AccessToken, exhibitionId: string, roomId: string) => {
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    roomsApi.deleteExhibitionRoom({
      exhibitionId: exhibitionId,
      roomId: roomId
    });
  };

  /**
   * Update room handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param roomToUpdate room to update
   * @param roomId room id
   */
  private updateRoom = async (accessToken: AccessToken, exhibitionId: string, roomToUpdate: ExhibitionRoom, roomId: string): Promise<ExhibitionRoom> => {
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const updatedRoom = roomsApi.updateExhibitionRoom({
      exhibitionId: exhibitionId,
      exhibitionRoom: roomToUpdate,
      roomId: roomId
    });

    return updatedRoom;
  };

  /**
   * Create device group handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param deviceGroupToCreate device group to create
   */
  // tslint:disable-next-line: max-line-length
  private createDeviceGroup = async (accessToken: AccessToken, exhibitionId: string, deviceGroupToCreate: ExhibitionDeviceGroup): Promise<ExhibitionDeviceGroup> => {
    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const newGroup = deviceGroupsApi.createExhibitionDeviceGroup({
      exhibitionId: exhibitionId,
      exhibitionDeviceGroup: deviceGroupToCreate
    });

    return newGroup;
  };

  /**
   * Update device group handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param deviceGroupToUpdate device group to update
   * @param deviceGroupId group id
   */
  // tslint:disable-next-line: max-line-length
  private updateDeviceGroup = async (accessToken: AccessToken, exhibitionId: string, deviceGroupToUpdate: ExhibitionDeviceGroup, deviceGroupId: string): Promise<ExhibitionDeviceGroup> => {
    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const updatedGroup = deviceGroupsApi.updateExhibitionDeviceGroup({
      exhibitionId: exhibitionId,
      exhibitionDeviceGroup: deviceGroupToUpdate,
      deviceGroupId: deviceGroupId
    });

    return updatedGroup;
  };

  /**
   * Delete device group handler
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param deviceGroupId device group id
   */
  private deleteDeviceGroup = async (accessToken: AccessToken, exhibitionId: string, deviceGroupId: string) => {
    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    deviceGroupsApi.deleteExhibitionDeviceGroup({
      exhibitionId: exhibitionId,
      deviceGroupId: deviceGroupId
    });
  };

  /**
   * Create device handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param deviceToCreate device to create
   */
  // tslint:disable-next-line: max-line-length
  private createDevice = async (accessToken: AccessToken, exhibitionId: string, deviceToCreate: ExhibitionDevice): Promise<ExhibitionDevice> => {
    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    const createdDevice = devicesApi.createExhibitionDevice({
      exhibitionId: exhibitionId,
      exhibitionDevice: deviceToCreate
    });

    return createdDevice;
  };

  /**
   * Update device handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param deviceToUpdate device to update
   * @param deviceId device id
   */
  // tslint:disable-next-line: max-line-length
  private updateDevice = async (accessToken: AccessToken, exhibitionId: string, deviceToUpdate: ExhibitionDevice, deviceId: string): Promise<ExhibitionDevice> => {
    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    const updatedDevice = devicesApi.updateExhibitionDevice({
      deviceId: deviceId,
      exhibitionDevice: deviceToUpdate,
      exhibitionId: exhibitionId
    });

    return updatedDevice;
  };

  /**
   * Delete device handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param deviceId device id
   */
  private deleteDevice = async (accessToken: AccessToken, exhibitionId: string, deviceId: string) => {
    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    devicesApi.deleteExhibitionDevice({
      exhibitionId: exhibitionId,
      deviceId: deviceId
    });
  };

  /**
   * Create antenna handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param antennaToCreate antenna to create
   */
  private createAntenna = async (accessToken: AccessToken, exhibitionId: string, antennaToCreate: RfidAntenna): Promise<RfidAntenna> => {
    const rfidAntennasApi = Api.getRfidAntennasApi(accessToken);
    const createRfidAntenna = rfidAntennasApi.createRfidAntenna({
      exhibitionId: exhibitionId,
      rfidAntenna: antennaToCreate
    });

    return createRfidAntenna;
  };

  /**
   * Delete antenna handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param antennaId antenna id
   */
  private deleteAntenna = async (accessToken: AccessToken, exhibitionId: string, antennaId: string) => {
    const rfidAntennasApi = Api.getRfidAntennasApi(accessToken);
    rfidAntennasApi.deleteRfidAntenna({
      exhibitionId: exhibitionId,
      rfidAntennaId: antennaId
    });
  };

  /**
   * Update device handler
   *
   * @param accessToken keycloak access token
   * @param exhibitionId exhibition id
   * @param deviceToUpdate device to update
   * @param deviceId device id
   */
  private updateAntenna = async (accessToken: AccessToken, exhibitionId: string, antennaToUpdate: RfidAntenna, antennaId: string): Promise<RfidAntenna> => {
    const rfidAntennasApi = Api.getRfidAntennasApi(accessToken);
    const updatedRfidAntenna = rfidAntennasApi.updateRfidAntenna({
      rfidAntennaId: antennaId,
      rfidAntenna: antennaToUpdate,
      exhibitionId: exhibitionId
    });

    return updatedRfidAntenna;
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
    exhibitions: state.exhibitions.exhibitions,
    deviceModels: state.devices.deviceModels
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FloorPlanScreen));
