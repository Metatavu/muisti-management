import * as React from "react";
import { Map as LeafletMap, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent, Layer, FeatureGroup, MarkerOptions, DrawMap } from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { AccessToken } from "../../types";
import { ExhibitionRoom, Polygon as ApiPolygon, ExhibitionFloor, ExhibitionDeviceGroup, ExhibitionDevice, DeviceModel, ScreenOrientation, Point } from "../../generated/client";
import { FeatureCollection, Polygon } from "geojson";
import strings from "../../localization/strings";
import { loadRooms, loadDevices } from "../floor-plan/map-api-calls";
import deviceIcon from "../../resources/gfx/svg/deviceIcon.svg";
// FIXME: Add support for antennas
// import antennaIcon from "../../resources/gfx/muisti-logo.png";

/**
 * Component props
 */
interface Props {
  accessToken: AccessToken;
  deviceModels?: DeviceModel[];
  exhibitionId?: string;

  floorPlanInfo: FloorPlanInfo;
  selectedItems: SelectedItems;

  onRoomAdd?: (roomToCreate: ExhibitionRoom) => void;
  onRoomSave?: (updatedRoom: ExhibitionRoom) => void;
  onRoomClick?: (floor: ExhibitionFloor, room: ExhibitionRoom, hasNodes: boolean) => void;

  onDeviceGroupAdd?: (deviceGroupToCreate: ExhibitionDeviceGroup) => void;
  onDeviceGroupSave?: (deviceGroupToUpdate: ExhibitionDeviceGroup) => void;
  onDeviceGroupClick?: (floor: ExhibitionFloor, room: ExhibitionRoom, deviceGroup: ExhibitionDeviceGroup, hasNodes: boolean) => void;

  onDeviceAdd?: (deviceToCreate: ExhibitionDevice) => void;
  onDeviceSave?: (deviceToUpdate: ExhibitionDevice) => void;
  onDeviceClick?: (floor: ExhibitionFloor, room: ExhibitionRoom, deviceGroup: ExhibitionDeviceGroup, device: ExhibitionDevice, hasNodes: boolean) => void;

}

/**
 * Component state
 */
interface State {
  zoom: number;
  cursorPosition?: LatLng;
  leafletIdToRoomMap: Map<number, ExhibitionRoom>;
  leafletIdToDeviceMap: Map<number, ExhibitionDevice>;
}

interface FloorPlanInfo {
  readOnly: boolean;
  url: string;
  minZoom?: number;
  maxZoom?: number;
  imageWidth: number;
  imageHeight: number;
  bounds: LatLngBounds;
}

interface SelectedItems {
  floor? : ExhibitionFloor;
  room?: ExhibitionRoom;
  deviceGroup?: ExhibitionDeviceGroup;
  device?: ExhibitionDevice;
  selectedItemHasNodes?: boolean;
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
      leafletIdToRoomMap: new Map(),
      leafletIdToDeviceMap: new Map(),
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

    if (prevProps.selectedItems.floor !== this.props.selectedItems.floor ||
      prevProps.selectedItems.room !== this.props.selectedItems.room ||
      prevProps.selectedItems.device !== this.props.selectedItems.device ||
      prevProps.selectedItems.deviceGroup !== this.props.selectedItems.deviceGroup
    ) {
      this.initializeMapData();
    }
  }

  /**
   * Component render method
   */
  public render = () => {

    const { floorPlanInfo } = this.props;

    return (<>
      <LeafletMap
        ref={ this.setMapRef }
        key="leafletMap"
        crs={ CRS.Simple }
        center={ [0, 0] }
        bounds={ floorPlanInfo.bounds }
        minZoom={ floorPlanInfo.minZoom }
        maxZoom={ floorPlanInfo.maxZoom }
        zoom={ this.state.zoom }
        style={{ width: "100%", height: "100%" }}
        onmousemove={ this.onMapMouseMove }
      >
        { this.renderMapChildren() }
      </LeafletMap>
    </>);
  }

  /**
   * Renders map child components
   */
  private renderMapChildren = () => {
    const { floorPlanInfo } = this.props;

    return (
      <>
        <ImageOverlay url={ floorPlanInfo.url } bounds={ floorPlanInfo.bounds }/>
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
    const { selectedItems } = this.props;
    this.mapInstance = mapRef ? mapRef.leafletElement : undefined;

    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.addLayer(this.roomLayers);

    if (selectedItems.deviceGroup) {
      this.mapInstance.addLayer(this.deviceMarkers);
    }

    this.addDrawHandler();

    this.mapInstance.on(L.Draw.Event.EDITED, event => {
      this.onEditLayers(event);
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
        this.handleRoomCreation(event);
      } else if (leafletEvent.layerType === "marker") {
        this.handleDeviceMarkerCreation(event);
      }

    });
  }

  /**
   * Device marker creation handler
   * @param event leaflet event
   */
  private handleDeviceMarkerCreation = async (event: L.LeafletEvent) => {
    const { exhibitionId, selectedItems, deviceModels, onDeviceAdd } = this.props;
    if (!exhibitionId || !selectedItems.deviceGroup || !selectedItems.deviceGroup.id || !deviceModels || !deviceModels[0].id || !onDeviceAdd) {
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
        groupId: selectedItems.deviceGroup.id,
        modelId: deviceModels[0].id,
        screenOrientation: ScreenOrientation.Landscape,
        location: {
          x: marker._latlng.lat,
          y: marker._latlng.lng
        }
      };
      onDeviceAdd(exhibitionDevice);
    }
  }

  /**
   * Device marker creation handler
   * @param event leaflet event
   */
  private handleRoomCreation = async (event: L.LeafletEvent) => {
    const { exhibitionId, selectedItems, onRoomAdd } = this.props;
    if (!exhibitionId || !selectedItems.floor || !selectedItems.floor.id || !onRoomAdd) {
      return;
    }

    const room = event.layer;
    if (room && room._latlngs) {
      const newRoom = new L.Rectangle(room._latlngs);
      this.addedLayers.addLayer(newRoom);

      const geoJson =  this.addedLayers.toGeoJSON() as FeatureCollection;
      if (geoJson.features[0].geometry.type !== "Polygon") {
        this.addedLayers = new L.FeatureGroup();
        return;
      }
      const roomPolygon = geoJson.features[0].geometry as ApiPolygon;

      const roomToCreate: ExhibitionRoom = {
        floorId: selectedItems.floor.id,
        name: strings.floorPlan.floor.new,
        geoShape: roomPolygon
      };
      onRoomAdd(roomToCreate);
      this.addedLayers = new L.FeatureGroup();
    }

  }

  /**
   * Set selected room
   * @param event leaflet event
   */
  private setSelectedRoom = (event: L.LeafletEvent) => {
    const { onRoomClick, selectedItems } = this.props;
    const { leafletIdToRoomMap } = this.state;
    const foundRoom = leafletIdToRoomMap.get(event.layer._leaflet_id);

    if (!onRoomClick || !selectedItems.floor || !foundRoom || !selectedItems.selectedItemHasNodes) {
      return;
    }
    onRoomClick(selectedItems.floor, foundRoom, selectedItems.selectedItemHasNodes);
  }

  /**
   * Set selected device
   * @param event leaflet event
   */
  private setSelectedDevice = (event: L.LeafletEvent) => {
    const { onDeviceClick, selectedItems } = this.props;
    const { leafletIdToDeviceMap } = this.state;
    const foundDevice = leafletIdToDeviceMap.get(event.layer._leaflet_id);
    if (!onDeviceClick ||
      !selectedItems.floor || !selectedItems.room || !selectedItems.deviceGroup || !foundDevice || !selectedItems.selectedItemHasNodes) {
      return;
    }
    onDeviceClick(selectedItems.floor, selectedItems.room, selectedItems.deviceGroup, foundDevice, selectedItems.selectedItemHasNodes);
  }

  /**
   * Edit map layers
   * @param event leaflet event
   */
  private onEditLayers = (event: L.LeafletEvent) => {
    const { selectedItems } = this.props;

    /**
     * Must cast is it like this because L.LeafletEvent does not contain
     * layers object but that is used during runtime.
     */
    const leafletEvent = event as any;
    const leafletFeatureGroup = leafletEvent as FeatureGroup;

    if (selectedItems.device) {
      this.handleDeviceUpdate(leafletFeatureGroup);
      return;
    }

    if (selectedItems.room) {
      this.handleRoomUpdate(leafletFeatureGroup);
      return;
    }
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
    const { accessToken, exhibitionId, selectedItems } = this.props;

    const foundRooms = await loadRooms(accessToken, exhibitionId, selectedItems.floor, selectedItems.room);
    this.roomLayers.clearLayers();
    this.addRoomLayers(foundRooms);
  }

  /**
   * Load device data from API
   */
  private loadDevices = async () => {
    const { accessToken, exhibitionId, selectedItems } = this.props;

    const foundDevices = await loadDevices(accessToken, exhibitionId, selectedItems.deviceGroup, selectedItems.device);
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
   * Handle device update
   *
   * @param leafletFeatureGroup leaflet feature group
   */
  private handleDeviceUpdate = (leafletFeatureGroup: FeatureGroup) => {
    const { selectedItems, onDeviceSave } = this.props;
    if (!selectedItems.device || !onDeviceSave) {
      return;
    }

    const deviceToUpdate = { ...selectedItems.device } as ExhibitionDevice;
    if (!deviceToUpdate.id) {
      return;
    }
    L.geoJSON(leafletFeatureGroup.toGeoJSON(), {
      onEachFeature(_feature, layer) {
        if (!deviceToUpdate || !deviceToUpdate.location) {
          return;
        }

        const marker = _feature.geometry as any;
        const newPoint: Point = {
          x: marker.coordinates[1],
          y: marker.coordinates[0]
        };
        deviceToUpdate.location = newPoint;
      }
    });

    onDeviceSave(deviceToUpdate);
  }

  /**
   * Handle room update
   *
   * @param leafletFeatureGroup leaflet feature group
   */
  private handleRoomUpdate = (leafletFeatureGroup: FeatureGroup) => {
    const { selectedItems, onRoomSave } = this.props;
    if (!selectedItems.room || !onRoomSave) {
      return;
    }

    const roomToUpdate = { ...selectedItems.room } as ExhibitionRoom;

    if (!roomToUpdate.id) {
      return;
    }

    L.geoJSON(leafletFeatureGroup.toGeoJSON(), {
      onEachFeature(_feature, layer) {
        const roomPolygon = _feature.geometry as ApiPolygon;
        roomToUpdate.geoShape = roomPolygon;
      }
    });

    onRoomSave(roomToUpdate);
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
    this.deviceMarkers.clearLayers();
  }

  /**
   * Delete currently selected device group
   */
  public deleteDeviceGroup = () => {
    // FIXME: Add map support for device groups
  }

  /**
   * Delete currently selected room
   */
  public deleteRoom = () => {
    this.roomLayers.clearLayers();
  }
}