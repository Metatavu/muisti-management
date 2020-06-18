import * as React from "react";
import { Map as LeafletMap, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent, Layer, FeatureGroup, MarkerOptions, DrawMap } from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import Api from "../../api/api";
import { AccessToken } from "../../types";
import { ExhibitionRoom, Polygon as ApiPolygon, ExhibitionFloor, ExhibitionDeviceGroup, ExhibitionDevice, DeviceModel, ScreenOrientation } from "../../generated/client";
import { FeatureCollection, Polygon } from "geojson";
import PolygonDialog from "./polygon-dialog";
import strings from "../../localization/strings";
import { loadRooms, loadDevices, createDevice, deleteDevice, deleteDeviceGroup, deleteRoom } from "../floor-plan/map-api-calls";
import deviceIcon from "../../resources/gfx/svg/deviceIcon.svg";
import antennaIcon from "../../resources/gfx/muisti-logo.png";

/**
 * Component props
 */
interface Props {
  url: string;
  minZoom?: number;
  maxZoom?: number;
  imageWidth: number;
  imageHeight: number;
  bounds: LatLngBounds;
  accessToken: AccessToken;
  readOnly: boolean;
  deviceModels?: DeviceModel[];
  exhibitionId?: string;
  selectedFloor? : ExhibitionFloor;
  selectedRoom?: ExhibitionRoom;
  selectedDeviceGroup?: ExhibitionDeviceGroup;
  selectedDevice?: ExhibitionDevice;
  selectedItemHasNodes?: boolean;

  /**
   * Event handler for room click
   *
   * @param floor selected floor
   * @param room selected room
   * @param hasNodes has child nodes
   */
  onRoomClick?: (floor: ExhibitionFloor, room: ExhibitionRoom, hasNodes: boolean) => void;

  /**
   * Event handler for device group click
   *
   * @param floor selected floor
   * @param room selected room
   * @param deviceGroup selected device group
   * @param hasNodes has child nodes
   */
  onDeviceGroupClick?: (floor: ExhibitionFloor, room: ExhibitionRoom, deviceGroup: ExhibitionDeviceGroup, hasNodes: boolean) => void;

  /**
   * Event handler for device click
   *
   * @param floor selected floor
   * @param room selected room
   * @param deviceGroup selected device group
   * @param device selected device
   * @param hasNodes has child nodes
   */
  onDeviceClick?: (floor: ExhibitionFloor, room: ExhibitionRoom, deviceGroup: ExhibitionDeviceGroup, device: ExhibitionDevice, hasNodes: boolean) => void;
}

/**
 * Component state
 */
interface State {
  zoom: number;
  cursorPosition?: LatLng;
  polygonCreated: boolean;
  roomName?: string;
  layer?: any;
  leafletIdToRoomMap: Map<number, ExhibitionRoom>;
  leafletIdToDeviceMap: Map<number, ExhibitionDevice>;
  roomsToDelete: number[];
}

/**
 * Component for floor plan map
 */
export default class FloorPlanMap extends React.Component<Props, State> {

  // tslint:disable-next-line
  private mapInstance?: MapInstance;

  /**
   * This feature group contains all room layers that are displayed
   */
  private roomLayers = new L.FeatureGroup();

  /**
   * This feature group contains all devices that are displayed
   */
  private deviceMarkers = new L.FeatureGroup();

  /**
   * Custom device icon
   */
  private deviceIcon = new L.Icon({
    iconUrl: deviceIcon,
    iconAnchor: undefined,
    popupAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    iconSize: new L.Point(50, 50),
    className: "device-icon"
  });

  /**
   * This feature group is used only for storing new geometries because
   * individual feature group objects can be cast to polygon objects
   */
  private addedLayers = new L.FeatureGroup();


  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      zoom: 2,
      polygonCreated: false,
      leafletIdToRoomMap: new Map(),
      leafletIdToDeviceMap: new Map(),
      roomsToDelete: [],
    };
  }

  /**
   * Component did mount handler
   */
  public componentDidMount = () => {
    this.initializeMapData();
  }

  /**
   * Component did update handler
   */
  public componentDidUpdate = (prevProps: Props) => {

    if (prevProps.selectedFloor !== this.props.selectedFloor ||
      prevProps.selectedRoom !== this.props.selectedRoom ||
      prevProps.selectedDevice !== this.props.selectedDevice ||
      prevProps.selectedDeviceGroup !== this.props.selectedDeviceGroup
    ) {
      this.initializeMapData();
    }
  }

  /**
   * Component render method
   */
  public render = () => {

    return (<>
      <LeafletMap
        ref={ this.setMapRef }
        key="leafletMap"
        crs={ CRS.Simple }
        center={ [0, 0] }
        bounds={ this.props.bounds }
        minZoom={ this.props.minZoom }
        maxZoom={ this.props.maxZoom }
        zoom={ this.state.zoom }
        style={{ width: "100%", height: "100%" }}
        onmousemove={ this.onMapMouseMove }
      >
        { this.renderMapChildren() }
      </LeafletMap>

      <PolygonDialog
        cancelButtonText={ strings.editorDialog.cancel }
        positiveButtonText={ strings.editorDialog.save }
        onCancel={ this.onCancel }
        onClose={ this.onCancel }
        onConfirm={ this.onPolygonSave }
        onNameChange={ this.onRoomNameChange }
        open={ this.state.polygonCreated }
        text={ strings.map.properties.roomName }
        roomName={ this.state.roomName }
        title={ strings.map.properties.dialogTitle }
      />
    </>);
  }

  /**
   * Renders map child components
   */
  private renderMapChildren = () => {
    return (
      <>
        <ImageOverlay url={ this.props.url } bounds={ this.props.bounds }/>
        <ScaleControl imperial={ false }/>
      </>
    );
  }

  /**
   * Updates Leaflet instance and adds handlers
   *
   * @param mapRef map refs
   */
  private setMapRef = (mapRef: any) => {
    const { selectedDeviceGroup } = this.props;
    this.mapInstance = mapRef ? mapRef.leafletElement : undefined;

    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.addLayer(this.roomLayers);

    if (selectedDeviceGroup) {
      this.mapInstance.addLayer(this.deviceMarkers);
    }

    this.addDrawHandler();

    this.mapInstance.on(L.Draw.Event.EDITED, event => {
      this.onEditPolygons(event);
    });

    this.roomLayers.on('click', event => {
      this.setSelectedRoom(event);
    });

    this.deviceMarkers.on('click', event => {
      this.setSelectedDevice(event);
    });
  }

  /**
   * Event handler for mouse moving over the map
   *
   * @param event leaflet mouse event
   */
  private onMapMouseMove = (event: LeafletMouseEvent) => {
    this.setState({
      cursorPosition: event.latlng
    });
  }

  /**
   * Add draw handler
   */
  private addDrawHandler = () => {
    if (!this.mapInstance) {
      return;
    }

    this.mapInstance.on(L.Draw.Event.CREATED, event => {
      const leafletEvent = event as any;
      if (leafletEvent.layerType === "polygon" || leafletEvent.layerType === "rectangle") {
        const layer = event.layer;
        this.addedLayers.addLayer(layer);
        this.setState({
          polygonCreated: true,
          layer: layer
        });
      } else if (leafletEvent.layerType === "marker") {
        this.handleDeviceMarkerCreation(event);
      }

    });
  }

  /**
   * Device marker creation handler
   */
  private handleDeviceMarkerCreation = async (event: L.LeafletEvent) => {
    const { accessToken, exhibitionId, selectedDeviceGroup, deviceModels } = this.props;
    if (!exhibitionId || !selectedDeviceGroup || !selectedDeviceGroup.id || !deviceModels || !deviceModels[0].id) {
      return;
    }

    const marker = event.layer;
    if (marker && marker._latlng) {
      const markerOptions: MarkerOptions = {
        icon: this.deviceIcon,
        draggable: false
      };
      const customMarker = new L.Marker(marker._latlng, markerOptions);
      this.deviceMarkers.addLayer(customMarker);

      const exhibitionDevice: ExhibitionDevice = {
        name: strings.floorPlan.device.new,
        groupId: selectedDeviceGroup.id,
        modelId: deviceModels[0].id,
        screenOrientation: ScreenOrientation.Landscape,
        location: {
          x: marker._latlng.lat,
          y: marker._latlng.lng
        }
      };

      const createdDevice = await createDevice(accessToken, exhibitionId, exhibitionDevice) as ExhibitionDevice;
    }
  }

  /**
   * On polygon save handler
   */
  private onPolygonSave = () => {
    this.saveRoomPolygon();
    this.setState({
      polygonCreated : false,
      roomName: ""
    });
  }

  /**
   * On cancel handler
   */
  private onCancel = () => {
    this.setState({
      polygonCreated: false,
      roomName: ""
    });
    this.addedLayers = new L.FeatureGroup();
  }

  /**
   * Set selected room
   * @param event leaflet event
   */
  private setSelectedRoom = (event: L.LeafletEvent) => {
    const { onRoomClick, selectedFloor, selectedItemHasNodes } = this.props;
    const { leafletIdToRoomMap } = this.state;
    const foundRoom = leafletIdToRoomMap.get(event.layer._leaflet_id);

    if (!onRoomClick || !selectedFloor || !foundRoom || !selectedItemHasNodes) {
      return;
    }
    onRoomClick(selectedFloor, foundRoom, selectedItemHasNodes);
  }

  /**
   * Set selected device
   * @param event leaflet event
   */
  private setSelectedDevice = (event: L.LeafletEvent) => {
    const { onDeviceClick, selectedFloor, selectedRoom, selectedDeviceGroup, selectedItemHasNodes } = this.props;
    const { leafletIdToDeviceMap } = this.state;
    const foundDevice = leafletIdToDeviceMap.get(event.layer._leaflet_id);
    if (!onDeviceClick || !selectedFloor || !selectedRoom || !selectedDeviceGroup || !foundDevice || !selectedItemHasNodes) {
      return;
    }
    onDeviceClick(selectedFloor, selectedRoom, selectedDeviceGroup, foundDevice, selectedItemHasNodes);
  }

  /**
   * Save polygon to API handler
   */
  private saveRoomPolygon = async () => {
    const { accessToken, exhibitionId, selectedFloor } = this.props;
    const { roomName, layer } = this.state;
    if (!accessToken || !exhibitionId || !selectedFloor || !selectedFloor.id || !roomName || !layer) {
      return;
    }

    const geoShape = this.addedLayers;
    const geoJson = geoShape.toGeoJSON() as FeatureCollection;
    if (geoJson.features[0].geometry.type !== "Polygon") {
      this.addedLayers = new L.FeatureGroup();
      return;
    }
    const roomPolygon = geoJson.features[0].geometry as ApiPolygon;
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const exhibitionRoomToCreate: ExhibitionRoom = {
      floorId: selectedFloor.id,
      name: roomName,
      geoShape: roomPolygon
    };

    await roomsApi.createExhibitionRoom({
      exhibitionId: exhibitionId,
      exhibitionRoom: exhibitionRoomToCreate
    });
    this.addedLayers = new L.FeatureGroup();
    this.roomLayers.addLayer(layer);
  }


  /**
   * Edit room polygons
   * @param event leaflet event
   * TODO: Add confirmation dialog
   */
  private onEditPolygons = (event: L.LeafletEvent) => {
    const { exhibitionId, accessToken, selectedRoom, selectedDevice } = this.props;
    if ( !exhibitionId || !selectedRoom || !accessToken) {
      return;
    }


    /**
     * Must cast is it like this because L.LeafletEvent does not contain
     * layers object but that is used during runtime.
     */
    const leafletEvent = event as any;
    const leafletFeatureGroup = leafletEvent as FeatureGroup;

    if (selectedDevice) {
      const deviceToUpdate = { ...selectedDevice } as ExhibitionDevice;
      if (!deviceToUpdate.id) {
        return;
      }
      L.geoJSON(leafletFeatureGroup.toGeoJSON(), {
        onEachFeature(_feature, layer) {
          if (!deviceToUpdate || !deviceToUpdate.location) {
            return;
          }
          const marker = _feature.geometry as any;
          deviceToUpdate.location.x = marker.coordinates[1];
          deviceToUpdate.location.y = marker.coordinates[0];
        }
      });

      const devicesApi = Api.getExhibitionDevicesApi(accessToken);
      devicesApi.updateExhibitionDevice({
        deviceId: deviceToUpdate.id,
        exhibitionDevice: deviceToUpdate,
        exhibitionId: exhibitionId
      });
      return;
    }

    if (selectedRoom) {
      const roomToUpdate = { ...selectedRoom } as ExhibitionRoom;

      if (!roomToUpdate.id) {
        return;
      }

      L.geoJSON(leafletFeatureGroup.toGeoJSON(), {
        onEachFeature(_feature, layer) {
          const roomPolygon = _feature.geometry as ApiPolygon;
          roomToUpdate.geoShape = roomPolygon;
        }
      });

      const roomsApi = Api.getExhibitionRoomsApi(accessToken);
      roomsApi.updateExhibitionRoom({
        exhibitionId: exhibitionId,
        exhibitionRoom: roomToUpdate,
        roomId: roomToUpdate.id
      });
      return;
    }
  }

  /**
   * On polygon name change handler
   *
   * @param event react change event
   */
  private onRoomNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      roomName : event.target.value
    });
  }

  /**
   * Initialize map data
   */
  private initializeMapData = () => {
    const { mapInstance } = this;
    if (!mapInstance) {
      return;
    }

    this.loadRooms();
    this.loadDevices();
  }

  /**
   * Load room data from API
   */
  private loadRooms = async () => {
    const { accessToken, exhibitionId, selectedFloor, selectedRoom } = this.props;

    const foundRooms = await loadRooms(accessToken, exhibitionId, selectedFloor, selectedRoom);
    this.roomLayers.clearLayers();
    this.addRoomLayers(foundRooms);
  }

  /**
   * Load device data from API
   */
  private loadDevices = async () => {
    const { accessToken, exhibitionId, selectedDeviceGroup, selectedDevice } = this.props;

    const foundDevices = await loadDevices(accessToken, exhibitionId, selectedDeviceGroup, selectedDevice);
    this.deviceMarkers.clearLayers();
    this.addDeviceMarkers(foundDevices);
  }

  /**
   * Add layers to leaflet map
   *
   * @param rooms list of exhibition rooms
   */
  private addRoomLayers = (rooms: ExhibitionRoom[]) => {

    if (!rooms) {
      return;
    }
    const tempMap = new Map<number, ExhibitionRoom>();
    rooms.forEach(room => {
      const geoShape = room.geoShape;
      if (geoShape && this.mapInstance && this.roomLayers) {
        const geoJson = geoShape as Polygon;
        try {
          const roomLayersToAdd: any[] = [];
          L.geoJSON(geoJson, {
            onEachFeature(_feature, layer) {
              const customLayer = layer as any;
              customLayer.setStyle({
                fillOpacity: 0.5,
                // FIXME: Needs API support for layer properties
                // fillColor :'#' + (0x1000000 + (Math.random()) * 0xffffff).toString(16).substr(1,6),
              });
              roomLayersToAdd.push(layer);
            }
          });

          this.addRoomLayersToMap(roomLayersToAdd, room, tempMap);
        } catch (error) {
          console.log(error);
        }
      }
    });

    this.setState({
      leafletIdToRoomMap : tempMap
    });
  }

  /**
   * Add device markers to leaflet map
   *
   * @param devices list of exhibition devices
   */
  private addDeviceMarkers = (devices: ExhibitionDevice[]) => {

    if (!devices) {
      return;
    }

    const tempLeafletIdToDeviceMap = new Map<number, ExhibitionDevice>();

    devices.forEach(device => {

      if (device && device.location && device.location.x && device.location.y) {
        const markerOptions: MarkerOptions = {
          icon: this.deviceIcon,
          draggable: false
        };

        const latlng = new LatLng(device.location.x, device.location.y);
        const customMarker = new L.Marker(latlng, markerOptions);
        this.deviceMarkers.addLayer(customMarker);
        const markerId = this.deviceMarkers.getLayerId(customMarker);
        tempLeafletIdToDeviceMap.set(markerId, device);
      }
    });

    this.mapInstance?.addLayer(this.deviceMarkers);

    this.setState({
      leafletIdToDeviceMap: tempLeafletIdToDeviceMap
    });

  }

  /**
   * Adds all room geo shapes found from api to leaflet map
   *
   * @param roomLayersToAdd list of room layers
   * @param room room
   * @param tempMap temp maps
   */
  private addRoomLayersToMap(roomLayersToAdd: Layer[], room: ExhibitionRoom, tempMap: Map<number, ExhibitionRoom>) {
    roomLayersToAdd.forEach(roomLayer => {
      if (room.id) {
        this.roomLayers.addLayer(roomLayer);
        const layerId = this.roomLayers.getLayerId(roomLayer);
        tempMap.set(layerId, room);
      }
    });
    this.mapInstance?.fitBounds(this.roomLayers.getBounds());
  }

  /**
   * Trigger L.Draw.Rectangle event which allows user to draw rectangle on the map
   */
  public addRoom = () => {
    const drawMap = this.mapInstance! as DrawMap;
    const newRoomShape = new L.Draw.Rectangle(drawMap);
    newRoomShape.enable();
  }

  /**
   * Enable editing mode for currently selected room polygon
   */
  public editRoom = () => {
    const layers = this.roomLayers.getLayers();
    const layer = layers[0] as any;
    layer.editing.enable();
  }

  /**
   * Save current device marker
   */
  public saveRoom = () => {
    console.log(this.mapInstance)
    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.fire(L.Draw.Event.EDITED, this.roomLayers);
    const layers = this.roomLayers.getLayers();
    const layer = layers[0] as any;
    layer.editing.disable();
  }

  /**
   * Trigger L.Draw.Marker event which allows user to draw marker on the map
   */
  public addDeviceMarker = () => {
    const drawMap = this.mapInstance! as DrawMap;
    const newMarker = new L.Draw.Marker(drawMap);
    newMarker.enable();
  }

  /**
   * Enable editing mode for currently selected device marker
   */
  public editDeviceMarker = () => {
    const layers = this.deviceMarkers.getLayers();
    const layer = layers[0] as any;
    layer.editing.enable();
  }

  /**
   * Save current device marker
   */
  public saveDeviceMarker = () => {
    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.fire(L.Draw.Event.EDITED, this.deviceMarkers);
    const layers = this.deviceMarkers.getLayers();
    const layer = layers[0] as any;
    layer.editing.disable();
  }

  /**
   * Delete current device
   */
  public deleteDevice = () => {
    const { accessToken, exhibitionId, selectedDevice } = this.props;

    if (!exhibitionId || !selectedDevice) {
      return;
    }

    // FIXME: Add nicer confirm dialog
    if (window.confirm(strings.generic.confirmDelete)) {
      deleteDevice(accessToken, exhibitionId, selectedDevice);
      this.deviceMarkers.clearLayers();
    }
  }

  /**
   * Delete currently selected device group
   */
  public deleteDeviceGroup = () => {
    const { accessToken, exhibitionId, selectedDeviceGroup } = this.props;

    if (!exhibitionId || !selectedDeviceGroup) {
      return;
    }

    // FIXME: Add nicer confirm dialog
    if (window.confirm(strings.generic.confirmDelete)) {
      deleteDeviceGroup(accessToken, exhibitionId, selectedDeviceGroup);
    }
  }

  /**
   * Delete currently selected room
   */
  public deleteRoom = () => {
    const { accessToken, exhibitionId, selectedRoom } = this.props;

    if (!exhibitionId || !selectedRoom) {
      return;
    }

    // FIXME: Add nicer confirm dialog
    if (window.confirm(strings.generic.confirmDelete)) {
      deleteRoom(accessToken, exhibitionId, selectedRoom);
      this.roomLayers.clearLayers();
    }
  }
}
