import * as React from "react";
import { Map as LeafletMap, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent, Layer, FeatureGroup, MarkerOptions, Point } from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import Api from "../../api/api";
import { AccessToken } from "../../types";
import { ExhibitionRoom, Polygon as ApiPolygon, Point as ApiPoint, ExhibitionFloor, ExhibitionDeviceGroup, ExhibitionDevice, Exhibition } from "../../generated/client";
import { FeatureCollection, Polygon } from "geojson";
import PolygonDialog from "./polygon-dialog";
import strings from "../../localization/strings";
import { loadRooms, loadDevices, updateDevice } from "../floor-plan/map-api-calls";
import defaultExhibitionImage from "../../resources/gfx/muisti-logo.png";

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

  private deviceIcon = new L.Icon({
    iconUrl: defaultExhibitionImage,
    iconAnchor: undefined,
    popupAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    iconSize: new L.Point(60, 75),
    className: 'leaflet-div-icon'
  });

  /**
   * This feature group is used only for storing new geometries because
   * individual feature group objects can be cast to polygon objects
   */
  private addedLayers = new L.FeatureGroup();

  private currentControls = new L.Control();


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
    const { selectedDeviceGroup, selectedDevice } = this.props;
    this.mapInstance = mapRef ? mapRef.leafletElement : undefined;

    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.addLayer(this.roomLayers);

    if (selectedDeviceGroup) {
      this.mapInstance.addLayer(this.deviceMarkers);
    }

    this.currentControls = this.getControls();

    this.mapInstance.addControl(this.currentControls);
    this.addDrawHandler();

    this.addOnLayerRemovedHandler();
    this.mapInstance.on(L.Draw.Event.DELETED, event => {
      this.onDeletePolygons();
    });

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
    const { selectedDevice } = this.props;
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
      }

      if (leafletEvent.layerType === "marker" && selectedDevice) {
        this.handleMarkerCreation(event);
      }

    });
  }

  private handleMarkerCreation = async (event: L.LeafletEvent) => {
    const { accessToken, exhibitionId, selectedDevice } = this.props;
    const marker = event.layer;
    if (marker && marker._latlng) {
      const markerOptions: MarkerOptions = {
        icon: this.deviceIcon,
        draggable: false
      };
      const customMarker = new L.Marker(marker._latlng, markerOptions);
      this.deviceMarkers.addLayer(customMarker);
      const updatedDevice = await updateDevice(accessToken, exhibitionId, selectedDevice, marker._latlng) as ExhibitionDevice;
    }
  }

  /**
   * Get leaflet controls
   */
  private getControls() {
    const { readOnly, selectedRoom, selectedDeviceGroup, selectedDevice } = this.props;
    if (readOnly) {
      return new L.Control.Draw({
        draw: {
          polygon: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
          rectangle: false
        },
      });
    }

    if (selectedDevice) {
      return new L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: false,
          circle: false,
          circlemarker: false,
          polyline: false,
          rectangle: false
        },
        edit: {
          featureGroup: this.deviceMarkers,
          remove: false
        },
      });
    }

    if (selectedDeviceGroup) {
      return new L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
          rectangle: false
        }
      });
    }

    if (selectedRoom) {
      return new L.Control.Draw({
        position: 'topleft',
        draw: {
          circle: false,
          circlemarker: false,
          polyline: false,
        },
        edit: {
          featureGroup: this.roomLayers,
          remove: false
        },
      });
    }

    return new L.Control.Draw({
      position: 'topleft',
      draw: {
        circle: false,
        circlemarker: false,
        polyline: false,
      }
    });

  }

  /**
   * Add on layer remove handler
   */
  private addOnLayerRemovedHandler() {
    if (!this.mapInstance) {
      return;
    }

    this.mapInstance.on('layerremove', event => {
      const layerId = this.roomLayers.getLayerId(event.layer);
      this.setState({
        roomsToDelete: [...this.state.roomsToDelete, layerId]
      });
    });
  }

  /**
   * On polygon save handler
   */
  private onPolygonSave = () => {
    this.savePolygon();
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
    console.log(foundDevice);
    if (!onDeviceClick || !selectedFloor || !selectedRoom || !selectedDeviceGroup || !foundDevice || !selectedItemHasNodes) {
      return;
    }
    onDeviceClick(selectedFloor, selectedRoom, selectedDeviceGroup, foundDevice, selectedItemHasNodes);
  }

  /**
   * Save polygon to API handler
   */
  private savePolygon = async () => {
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
    const { leafletIdToRoomMap, leafletIdToDeviceMap } = this.state;
    if ( !exhibitionId || !selectedRoom || !accessToken) {
      return;
    }

    console.log(leafletIdToRoomMap)
    console.log(leafletIdToDeviceMap)

    /**
     * Must cast is it like this because L.LeafletEvent does not contain
     * layers object but that is used during runtime.
     */
    const leafletEvent = event as any;
    const leafletFeatureGroup = leafletEvent.layers as FeatureGroup;

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
   * Delete n amount of rooms from API
   * TODO: Add confirmation dialog
   */
  private onDeletePolygons = () => {
    const { accessToken, exhibitionId } = this.props;
    const { leafletIdToRoomMap, roomsToDelete } = this.state;
    if (!accessToken || !exhibitionId || !roomsToDelete) {
      return;
    }
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const tempMap = leafletIdToRoomMap;
    roomsToDelete.map(async room => {
      const roomToDelete = tempMap.get(room);
      if (roomToDelete && roomToDelete.id) {
        await roomsApi.deleteExhibitionRoom({
          exhibitionId: exhibitionId,
          roomId: roomToDelete.id
        });
        tempMap.delete(room);
      }
    });

    this.setState({
      roomsToDelete: [],
      leafletIdToRoomMap: tempMap
    });
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

  private initializeMapData = () => {
    const { mapInstance } = this;
    if (!mapInstance) {
      return;
    }

    this.loadRooms();
    // this.loadDeviceGroups();
    this.loadDevices();

    mapInstance.removeControl(this.currentControls);
    this.currentControls = this.getControls();
    mapInstance.addControl(this.currentControls);
  }

  /**
   * Load geo shape data from API
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
    console.log(selectedDevice);

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
          const geoShapesToAdd: Layer[] = [];
          L.geoJSON(geoJson, {
            onEachFeature(_feature, layer) {
              geoShapesToAdd.push(layer);
            }
          });

          this.addRoomLayersToMap(geoShapesToAdd, room, tempMap);
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
   * @param rooms list of exhibition devices
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

    console.log(this.deviceMarkers.getLayers());
    this.mapInstance?.addLayer(this.deviceMarkers);

    this.setState({
      leafletIdToDeviceMap: tempLeafletIdToDeviceMap
    });

  }

  private updateRoomPolygon = async (roomToUpdate: ExhibitionRoom) => {
    const { accessToken, exhibitionId } = this.props;

    if (!accessToken || !exhibitionId || !roomToUpdate.id) {
      return;
    }

    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const updatedRoom = await roomsApi.updateExhibitionRoom({
      exhibitionId: exhibitionId,
      exhibitionRoom: roomToUpdate,
      roomId: roomToUpdate.id
    });

    return updatedRoom;
  }

  /**
   * Adds all room geo shapes found from api to leaflet map
   *
   * @param geoShapesToAdd list of geo shapes
   * @param room room
   * @param tempMap temp maps
   */
  private addRoomLayersToMap(geoShapesToAdd: Layer[], room: ExhibitionRoom, tempMap: Map<number, ExhibitionRoom>) {
    geoShapesToAdd.forEach(shape => {
      if (room.id) {
        this.roomLayers.addLayer(shape);
        const layerId = this.roomLayers.getLayerId(shape);
        tempMap.set(layerId, room);
      }
    });
    this.mapInstance?.fitBounds(this.roomLayers.getBounds());
  }
}