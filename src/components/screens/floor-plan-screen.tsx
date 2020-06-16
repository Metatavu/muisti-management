import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { produce, Draft } from "immer";
import Api from "../../api/api";
import { History } from "history";
import styles from "../../styles/floor-plan-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, TextField, OutlinedTextFieldProps, Select, SelectProps, MenuItem, InputLabel, Switch, FormControlLabel } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionFloor, Coordinates, Bounds, ExhibitionRoom, ExhibitionDevice, ExhibitionDeviceGroup, ScreenOrientation, DeviceModel } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import FileUploader from "../generic/file-uploader";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, BreadcrumbData, ActionButton } from '../../types';
import strings from "../../localization/strings";
import 'cropperjs/dist/cropper.css';
import FloorPlanCrop from "../floor-plan/floor-plan-crop";
import FloorPlanCropProperties from "../floor-plan/floor-plan-crop-properties";
import * as cropperjs from 'cropperjs';
import FileUpload from "../../utils/file-upload";
import { LatLngExpression, LatLngBounds } from "leaflet";
import FloorPlanMap from "../generic/floor-plan-map";
import { TreeNodeInArray } from "react-simple-tree-menu";
import FloorPlanTreeMenu from "../floor-plan/floor-plan-tree-menu";
import theme from "../../styles/theme";

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
  selectedFloor?: ExhibitionFloor;
  selectedRoom?: ExhibitionRoom;
  selectedDeviceGroup?: ExhibitionDeviceGroup;
  selectedDevice?: ExhibitionDevice;
  treeData: TreeNodeInArray[];
  cropping: boolean;
  cropImageDataUrl?: string;
  cropImageData?: Blob;
  cropImageDetails?: cropperjs.default.ImageData;
  addImageDialogOpen: boolean;
}

/**
 * Component for exhibition floor plan editor
 */
export class FloorPlanScreen extends React.Component<Props, State> {

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
      treeData: [],
      addImageDialogOpen: false
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
    const { exhibition, floors, rooms, deviceGroups, devices, addImageDialogOpen } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const treeNodes = this.constructTreeData(floors, rooms, deviceGroups, devices);
    const firstSelected = this.state.selectedFloor?.id || "";
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
          <ElementNavigationPane title={ strings.floorPlan.title }>
            <div className={ classes.toolbarContent }>
              <FloorPlanTreeMenu treeNodes={ treeNodes } firstSelected={ firstSelected } />
            </div>
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditor() }
          </EditorView>

          <ElementSettingsPane width={ 320 } title={ strings.floorPlan.properties.title }>
            { this.renderProperties() }
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
    const { selectedFloor, cropping, cropImageDataUrl } = this.state;
    const { exhibitionId, accessToken } = this.props;
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
      return <FloorPlanMap
        accessToken={ accessToken }
        exhibitionFloorId={ selectedFloor.id }
        exhibitionId={ exhibitionId }
        bounds={ bounds }
        url={ selectedFloor.floorPlanUrl }
        imageHeight={ 965 }
        imageWidth={ 1314 }
        readOnly={ false }
      />
    }
    return null;
  }

  /**
   * Renders properties
   */
  private renderProperties = () => {
    const { deviceModels } = this.props;
    const { cropping, cropImageDataUrl, selectedFloor, selectedRoom, selectedDeviceGroup, selectedDevice } = this.state;
    if (cropping && cropImageDataUrl) {
      return <FloorPlanCropProperties 
        imageHeight={ this.state.cropImageDetails?.height }
        imageWidth={ this.state.cropImageDetails?.width }
        naturalWidth={ this.state.cropImageDetails?.naturalWidth } 
        naturalHeight={ this.state.cropImageDetails?.naturalHeight }
        onCropPropertyChange={ this.onCropPropertyChange }
      />;
    }

    const textFieldGenericProps = {
      fullWidth: true,
      type: "text",
      variant: "filled" as OutlinedTextFieldProps["variant"],
      style: { marginTop: theme.spacing(2) }
    };

    const selectFieldGenericProps = {
      fullWidth: true,
      variant: "filled" as SelectProps["variant"],
      style: { marginTop: theme.spacing(2) }
    };

    if (selectedFloor) {
      return (
        <TextField
          { ...textFieldGenericProps }
          name="name"
          label={ strings.generic.name }
          value={ selectedFloor.name }
          onChange={ this.onChangeFloorProperties }
        />
      );
    }

    if (selectedRoom) {
      return (
        <TextField
          { ...textFieldGenericProps }
          label={ strings.generic.name }
          name="name"
          value={ selectedRoom.name }
          onChange={ this.onChangeRoomProperties }
        />
      );
    }

    if (selectedDeviceGroup) {
      return (
        <>
          <TextField
            { ...textFieldGenericProps }
            label={ strings.generic.name }
            name="name"
            value={ selectedDeviceGroup.name }
            onChange={ this.onChangeDeviceGroupProperties }
          />
          <FormControlLabel
            label={ strings.floorPlan.properties.allowVisitorSessionCreation }
            style={{ marginTop: theme.spacing(2) }}
            control={
              <Switch
                checked={ selectedDeviceGroup.allowVisitorSessionCreation }
                onChange={ this.onChangeDeviceGroupProperties }
                color="primary"
                name="allowVisitorSessionCreation"
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
          />
        </>
      );
    }

    if (selectedDevice) {
      return (
        <>
          <TextField
            { ...textFieldGenericProps }
            label={ strings.generic.name }
            name="name"
            value={ selectedDevice.name }
            onChange={ this.onChangeDeviceProperties }
          />
          <InputLabel id="modelId-label" style={{ marginTop: theme.spacing(2) }}>
            { strings.floorPlan.properties.model }
          </InputLabel>
          <Select
            { ...selectFieldGenericProps }
            label={ strings.dashboard.devices.dialog.model }
            name="modelId"
            value={ selectedDevice.modelId || "" }
            onChange={ this.onChangeDeviceProperties }
          >
            { deviceModels.map(model => 
              <MenuItem key={ model.id } value={ model.id }>
                { `${model.manufacturer} ${model.model}` }
              </MenuItem>
            )}
          </Select>
          <InputLabel id="screenOrientation-label" style={{ marginTop: theme.spacing(2) }}>
            { strings.floorPlan.properties.screenOrientation }
          </InputLabel>
          <Select
            { ...selectFieldGenericProps }
            labelId="screenOrientation-label"
            name="screenOrientation"
            value={ selectedDevice.screenOrientation || "" }
            onChange={ this.onChangeDeviceProperties }
          >
            <MenuItem key={ "landscape" } value={ ScreenOrientation.Landscape }>{ strings.floorPlan.properties.landscape }</MenuItem>
            <MenuItem key={ "portrait" } value={ ScreenOrientation.Portrait }>{ strings.floorPlan.properties.portrait }</MenuItem>
          </Select>
        </>
      );
    }

    return null;
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
    const [ floors, rooms, deviceGroups, devices ] =
      await Promise.all<ExhibitionFloor[], ExhibitionRoom[], ExhibitionDeviceGroup[], ExhibitionDevice[]>(
        [
          exhibitionFloorsApi.listExhibitionFloors({ exhibitionId }),
          exhibitionRoomsApi.listExhibitionRooms({ exhibitionId }),
          exhibitionDeviceGroupsApi.listExhibitionDeviceGroups({ exhibitionId }),
          exhibitionDevicesApi.listExhibitionDevices({ exhibitionId })
        ]
      );
    const selectedFloor = floors[0];

    this.setState({
      exhibition,
      floors,
      rooms,
      deviceGroups,
      devices,
      selectedFloor
    });
  }

  /**
   * Constructs tree data
   * 
   * @param floors exhibition floors
   * @param rooms exhibition rooms
   * @param deviceGroups exhibition device groups
   * @param devices exhibition devices
   * @return array of tree nodes
   */
  private constructTreeData = (floors: ExhibitionFloor[], rooms: ExhibitionRoom[], deviceGroups: ExhibitionDeviceGroup[], devices: ExhibitionDevice[]) => {
    const treeData: TreeNodeInArray[] = floors.map(floor => {
      return {
        key: floor.id!,
        label: floor.name,
        onClick: () => this.onFloorClick(floor),
        nodes: rooms.filter(room => room.floorId === floor.id).map(room => {
          return {
            key: room.id!,
            label: room.name,
            onClick: () => this.onRoomClick(room),
            nodes: deviceGroups.filter(group => group.roomId === room.id).map(group => {
              return {
                key: group.id!,
                label: group.name,
                onClick: () => this.onDeviceGroupClick(group),
                nodes: devices.filter(device => device.groupId === group.id).map(device => {
                  return {
                    key: device.id!,
                    label: device.name,
                    onClick: () => this.onDeviceClick(device),
                    nodes: []
                  };
                })
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
    const { selectedFloor, selectedRoom, selectedDeviceGroup, selectedDevice } = this.state;
    if (selectedFloor) {
      return [
        { name: strings.generic.save, action: this.onSaveFloorClick },
        { name: strings.floorPlan.toolbar.upload, action: this.toggleUploadNewImageDialog },
        { name: strings.floorPlan.addFloor, action: this.onAddFloorClick }
      ];
    } else if (selectedRoom) {
      return [
        { name: strings.generic.save, action: this.onSaveRoomClick },
        { name: strings.floorPlan.addDeviceGroup, action: this.onAddDeviceGroupClick }
      ];
    } else if (selectedDeviceGroup) {
      return [
        { name: strings.generic.save, action: this.onSaveDeviceGroupClick },
        { name: strings.floorPlan.addDevice, action: this.onAddDeviceClick }
      ];
    } else if (selectedDevice) {
      return [ 
        { name: strings.generic.save, action: this.onSaveDeviceClick }
      ];
    } else {
      return [];
    }
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
    }

    const neCorner: Coordinates = {
      latitude: cropImageDetails.naturalWidth,
      longitude: cropImageDetails.naturalHeight
    }

    const floorBounds: Bounds = { 
      northEastCorner : neCorner,
      southWestCorner : swCorner
    }

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
    const updatedDetails = { ...this.state.cropImageDetails!, [key] : value }
    this.setState({
      cropImageDetails : updatedDetails
    })
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
    }
  }

  /**
   * Event handler for add floor click
   */
  private onAddFloorClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    if (!exhibitionId) {
      return;
    }

    const floorsApi = Api.getExhibitionFloorsApi(accessToken);
    const newFloor = await floorsApi.createExhibitionFloor({
      exhibitionId: exhibitionId,
      exhibitionFloor: { name: strings.floorPlan.newFloor }
    });
    
    this.setState(
      produce((draft: Draft<State>) => {
        draft.floors.push(newFloor);
      })
    );
  }

  /**
   * Event handler for add device group click
   */
  private onAddDeviceGroupClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedRoom } = this.state;
    if (!exhibitionId || !selectedRoom || !selectedRoom.id) {
      return;
    }

    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const newDeviceGroup = await deviceGroupsApi.createExhibitionDeviceGroup({
      exhibitionId: exhibitionId,
      exhibitionDeviceGroup: {
        name: strings.floorPlan.newDeviceGroup,
        allowVisitorSessionCreation: false,
        roomId: selectedRoom.id
      }
    });
    
    this.setState(
      produce((draft: Draft<State>) => {
        draft.deviceGroups.push(newDeviceGroup);
      })
    );
  }

  /**
   * Event handler for add device click
   */
  private onAddDeviceClick = async () => {
    const { accessToken, exhibitionId, deviceModels } = this.props;
    const { selectedDeviceGroup } = this.state;
    if (!exhibitionId || !selectedDeviceGroup || !selectedDeviceGroup.id || deviceModels.length < 1 || !deviceModels[0].id) {
      return;
    }

    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    const newDevice = await devicesApi.createExhibitionDevice({
      exhibitionId: exhibitionId,
      exhibitionDevice: {
        name: strings.floorPlan.newDevice,
        groupId: selectedDeviceGroup.id,
        modelId: deviceModels[0].id,
        screenOrientation: ScreenOrientation.Landscape
      }
    });
    
    this.setState(
      produce((draft: Draft<State>) => {
        draft.devices.push(newDevice);
      })
    );
  }

  /**
   * Event handler for save floor click
   */
  private onSaveFloorClick = async () => {
    const { cropping, cropImageData, selectedFloor } = this.state;
    if (cropping && cropImageData) {
      await this.updateFloorPlanImage(cropImageData);

      this.setState({
        cropping: false
      });
    } else {
      const { accessToken } = this.props;
      if (!selectedFloor || !selectedFloor.id || !selectedFloor.exhibitionId || !accessToken) {
        return;
      }

      const floorsApi = Api.getExhibitionFloorsApi(accessToken);
      const updatedFloor = await floorsApi.updateExhibitionFloor({
        exhibitionFloor: selectedFloor,
        exhibitionId: selectedFloor.exhibitionId,
        floorId: selectedFloor.id
      });

      this.setState(
        produce((draft: Draft<State>) => {
          const { floors } = draft;
          const floorIndex = floors.findIndex(floor => floor.id === selectedFloor.id);
          if (floorIndex > -1) {
            floors.splice(floorIndex, 1, updatedFloor);
          }
        })
      );
    }
  }

  /**
   * Event handler for on save room click
   */
  private onSaveRoomClick = async () => {
    const { accessToken } = this.props;
    const { selectedRoom } = this.state;
    if (!selectedRoom || !selectedRoom.id || !selectedRoom.exhibitionId) {
      return;
    }

    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const updatedRoom = await roomsApi.updateExhibitionRoom({
      exhibitionId: selectedRoom.exhibitionId,
      roomId: selectedRoom.id,
      exhibitionRoom: selectedRoom
    });

    this.setState(
      produce((draft: Draft<State>) => {
        const { rooms } = draft;
        const roomIndex = rooms.findIndex(room => room.id === selectedRoom.id);
        if (roomIndex > -1) {
          rooms.splice(roomIndex, 1, updatedRoom);
        }
      })
    );
  }

  /**
   * Event handler for on save device group click
   */
  private onSaveDeviceGroupClick = async () => {
    const { accessToken } = this.props;
    const { selectedDeviceGroup } = this.state;
    if (!selectedDeviceGroup || !selectedDeviceGroup.id || !selectedDeviceGroup.exhibitionId) {
      return;
    }

    const deviceGroupsApi = Api.getExhibitionDeviceGroupsApi(accessToken);
    const updatedDeviceGroup = await deviceGroupsApi.updateExhibitionDeviceGroup({
      exhibitionId: selectedDeviceGroup.exhibitionId,
      deviceGroupId: selectedDeviceGroup.id,
      exhibitionDeviceGroup: selectedDeviceGroup
    });

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
   * Event handler for on save device click
   */
  private onSaveDeviceClick = async () => {
    const { accessToken } = this.props;
    const { selectedDevice } = this.state;
    if (!selectedDevice || !selectedDevice.id || !selectedDevice.exhibitionId) {
      return;
    }

    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    const updatedDevice = await devicesApi.updateExhibitionDevice({
      exhibitionId: selectedDevice.exhibitionId,
      deviceId: selectedDevice.id,
      exhibitionDevice: selectedDevice
    });

    this.setState(
      produce((draft: Draft<State>) => {
        const { devices } = draft;
        const deviceIndex = devices.findIndex(device => device.id === selectedDevice.id);
        if (deviceIndex > -1) {
          devices.splice(deviceIndex, 1, updatedDevice);
        }
      })
    );
  }

  /**
   * Event handler for floor click
   * 
   * @param floor selected floor
   */
  private onFloorClick = (floor: ExhibitionFloor) => {
    this.setState({
      selectedFloor: floor,
      selectedRoom: undefined,
      selectedDeviceGroup: undefined,
      selectedDevice: undefined
    });
  }

  /**
   * Event handler for room click
   * 
   * @param room selected room
   */
  private onRoomClick = (room: ExhibitionRoom) => {
    this.setState({
      selectedFloor: undefined,
      selectedRoom: room,
      selectedDeviceGroup: undefined,
      selectedDevice: undefined
    });
  }

  /**
   * Event handler for device group click
   * 
   * @param deviceGroup selected device group
   */
  private onDeviceGroupClick = (deviceGroup: ExhibitionDeviceGroup) => {
    this.setState({
      selectedFloor: undefined,
      selectedRoom: undefined,
      selectedDeviceGroup: deviceGroup,
      selectedDevice: undefined
    });
  }

  /**
   * Event handler for device click
   * 
   * @param device selected device
   */
  private onDeviceClick = (device: ExhibitionDevice) => {
    this.setState({
      selectedFloor: undefined,
      selectedRoom: undefined,
      selectedDeviceGroup: undefined,
      selectedDevice: device
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
