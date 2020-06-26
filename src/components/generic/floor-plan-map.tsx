import * as React from "react";
import { Map as LeafletMap, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent, Layer, FeatureGroup, MarkerOptions, DrawMap, LatLngExpression, LatLngTuple } from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import { AccessToken } from "../../types";
// tslint:disable-next-line: max-line-length
import { ExhibitionRoom, Polygon as ApiPolygon, ExhibitionFloor, ExhibitionDeviceGroup, ExhibitionDevice, DeviceModel, ScreenOrientation, Point, RfidAntenna } from "../../generated/client";
import { FeatureCollection, Polygon } from "geojson";
import strings from "../../localization/strings";
import deviceIcon from "../../resources/gfx/svg/deviceIcon.svg";
import antennaIcon from "../../resources/gfx/svg/antennaIcon.svg";

/**
 * Component props
 */
interface Props {
  accessToken: AccessToken;
  deviceModels?: DeviceModel[];
  exhibitionId?: string;

  mapData: MapData;
  floorPlanInfo: FloorPlanInfo;
  selectedItems: SelectedItems;

  onRoomAdd?: (roomToCreate: ExhibitionRoom) => void;
  onRoomSave?: (updatedRoom: ExhibitionRoom) => void;
  onRoomClick?: (floorId: string, roomId: string, hasNodes: boolean) => void;

  onDeviceAdd?: (deviceToCreate: ExhibitionDevice) => void;
  onDeviceSave?: (deviceToUpdate: ExhibitionDevice) => void;
  onDeviceClick?: (floorId: string, roomId: string, deviceGroupId: string, deviceId: string, hasNodes: boolean) => void;

  onAntennaAdd?: (antennaToCreate: RfidAntenna) => void;
  onAntennaSave?: (antennaToUpdate: RfidAntenna) => void;
  onAntennaClick?: (floorId: string, roomId: string, deviceGroupId: string, antennaId: string, hasNodes: boolean) => void;

}

/**
 * Component state
 */
interface State {
  zoom: number;
  cursorPosition?: LatLng;
  leafletIdToRoomMap: Map<number, ExhibitionRoom>;
  leafletIdToDeviceMap: Map<number, ExhibitionDevice>;
  leafletIdToAntennaMap: Map<number, RfidAntenna>;
  addingAntenna: boolean;
}

/**
 * Contains all floor plan data
 */
interface FloorPlanInfo {
  readOnly: boolean;
  url: string;
  minZoom?: number;
  maxZoom?: number;
  imageWidth: number;
  imageHeight: number;
  bounds: LatLngBounds;
}

/**
 * Contains all map data
 */
interface MapData {
  rooms?: ExhibitionRoom[];
  deviceGroups?: ExhibitionDeviceGroup[];
  devices?: ExhibitionDevice[];
  antennas?: RfidAntenna[];
}

/**
 * Contains all selected items
 */
interface SelectedItems {
  floor? : ExhibitionFloor;
  room?: ExhibitionRoom;
  deviceGroup?: ExhibitionDeviceGroup;
  device?: ExhibitionDevice;
  antenna?: RfidAntenna;
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
   * This feature group contains all generated device group layers that are displayed
   */
  private deviceGroupLayers = new L.FeatureGroup();

  /**
   * This feature group contains all devices that are displayed
   */
  private deviceMarkers = new L.FeatureGroup();

  /**
   * This feature group contains all antennas that are displayed
   */
  private antennaMarkers = new L.FeatureGroup();

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
   * Custom antenna icon
   */
  private antennaIcon = new L.Icon({
    iconUrl: antennaIcon,
    iconAnchor: undefined,
    popupAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    iconSize: new L.Point(50, 50),
    className: "device-icon"
  });

  /**
   * Contains all style values for layers
   *
   * TODO: Needs API support for layer properties
   */
  private layerStyleOptions = {
    roomLayerOpacity: 0.5,
    roomLayerColor: "#3388ff",
    deviceGroupPadding: 0.3,
    deviceGroupOpacity: 0.5,
    deviceGroupLayerColor: "#b52016"
  };

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
      leafletIdToAntennaMap: new Map(),
      addingAntenna: false
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
      prevProps.selectedItems.deviceGroup !== this.props.selectedItems.deviceGroup ||
      prevProps.selectedItems.antenna !== this.props.selectedItems.antenna ||
      prevProps.mapData !== this.props.mapData
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
    this.mapInstance = mapRef ? mapRef.leafletElement : undefined;

    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.addLayer(this.roomLayers);
    this.mapInstance.addLayer(this.deviceGroupLayers);

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

    this.antennaMarkers.on('click', event => {
      this.setSelectedAntenna(event);
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
      const { addingAntenna } = this.state;
      const leafletEvent = event as any;
      if (leafletEvent.layerType === "polygon" || leafletEvent.layerType === "rectangle") {
        this.handleRoomCreation(event);
      } else if (leafletEvent.layerType === "marker") {
        if (addingAntenna) {
          this.handleAntennaMarkerCreation(event);
        } else {
          this.handleDeviceMarkerCreation(event);
        }
      }

    });
  }

  /**
   * Device marker creation handler
   *
   * @param event leaflet event
   */
  private handleDeviceMarkerCreation = (event: L.LeafletEvent) => {
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
   * Antenna marker creation handler
   *
   * @param event leaflet event
   */
  private handleAntennaMarkerCreation = (event: L.LeafletEvent) => {
    const { exhibitionId, selectedItems, mapData, onAntennaAdd } = this.props;
    // tslint:disable-next-line: max-line-length
    if (!exhibitionId || !selectedItems.room || !selectedItems.room.id || !selectedItems.deviceGroup || !selectedItems.deviceGroup.id || mapData.antennas === undefined || !onAntennaAdd) {
      return;
    }

    const marker = event.layer;
    if (marker && marker._latlng) {
      const markerOptions: MarkerOptions = {
        icon: this.antennaIcon,
        draggable: false
      };
      const customMarker = new L.Marker(marker._latlng, markerOptions);
      this.antennaMarkers.addLayer(customMarker);

      const rfidAntenna: RfidAntenna = {
        name: strings.floorPlan.antenna.new,
        groupId: selectedItems.deviceGroup.id,
        readerId: strings.floorPlan.antenna.newReaderId,
        roomId: selectedItems.room.id,
        antennaNumber: mapData.antennas.length + 1,
        location: {
          x: marker._latlng.lat,
          y: marker._latlng.lng
        }
      };
      onAntennaAdd(rfidAntenna);
    }
  }

  /**
   * Room creation handler
   *
   * @param event leaflet event
   */
  private handleRoomCreation = (event: L.LeafletEvent) => {
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
   *
   * @param event leaflet event
   */
  private setSelectedRoom = (event: L.LeafletEvent) => {
    const { onRoomClick, selectedItems } = this.props;
    const { leafletIdToRoomMap } = this.state;
    const foundRoom = leafletIdToRoomMap.get(event.layer._leaflet_id);

    if (!onRoomClick || !selectedItems.floor || !foundRoom || !selectedItems.selectedItemHasNodes) {
      return;
    }
    onRoomClick(selectedItems.floor.id!, foundRoom.id!, selectedItems.selectedItemHasNodes);
  }

  /**
   * Set selected device
   *
   * @param event leaflet event
   */
  private setSelectedDevice = (event: L.LeafletEvent) => {
    const { onDeviceClick, selectedItems } = this.props;
    const { leafletIdToDeviceMap } = this.state;
    const foundDevice = leafletIdToDeviceMap.get(event.layer._leaflet_id);
    if (!onDeviceClick ||
      !selectedItems.floor || !selectedItems.room || !selectedItems.deviceGroup || !foundDevice || selectedItems.selectedItemHasNodes === undefined) {
      return;
    }
    onDeviceClick(selectedItems.floor.id!, selectedItems.room.id!, selectedItems.deviceGroup.id!, foundDevice.id!, selectedItems.selectedItemHasNodes);
  }

  /**
   * Set selected antenna
   *
   * @param event leaflet event
   */
  private setSelectedAntenna = (event: L.LeafletEvent) => {
    const { onAntennaClick, selectedItems } = this.props;
    const { leafletIdToAntennaMap } = this.state;
    const foundAntenna = leafletIdToAntennaMap.get(event.layer._leaflet_id);
    if (!onAntennaClick ||
      !selectedItems.floor || !selectedItems.room || !selectedItems.deviceGroup || !foundAntenna || selectedItems.selectedItemHasNodes === undefined) {
      return;
    }
    onAntennaClick(selectedItems.floor.id!, selectedItems.room.id!, selectedItems.deviceGroup.id!, foundAntenna.id!, selectedItems.selectedItemHasNodes);
  }

  /**
   * Edit map layers
   *
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

    if (selectedItems.antenna) {
      this.handleAntennaUpdate(leafletFeatureGroup);
      return;
    }

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
    this.loadDeviceGroup();
    this.loadDevices();
    this.loadAntennas();
  }

  /**
   * Add room layers to leaflet map
   */
  private loadRooms = () => {
    const { mapData } = this.props;
    const { layerStyleOptions } = this;
    this.roomLayers.clearLayers();
    if (!mapData.rooms) {
      return;
    }

    const tempMap = new Map<number, ExhibitionRoom>();
    mapData.rooms.forEach(room => {
      const geoShape = room.geoShape;
      if (geoShape && this.mapInstance && this.roomLayers) {
        const geoJson = geoShape as Polygon;
        try {
          const roomLayersToAdd: any[] = [];
          L.geoJSON(geoJson, {
            onEachFeature(_feature, layer) {
              const customLayer = layer as any;
              customLayer.setStyle({
                fillOpacity: layerStyleOptions.roomLayerOpacity,
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
  private loadDeviceGroup = () => {
    const { mapData } = this.props;
    const { layerStyleOptions } = this;
    this.deviceGroupLayers.clearLayers();
    const devices = mapData.devices;

    if (!mapData.deviceGroups || !devices || !this.mapInstance) {
      return;
    }

    const devicePoints: LatLngExpression[] = [];

    mapData.deviceGroups.forEach(deviceGroup => {
      devices.forEach(device => {
        if (device.groupId === deviceGroup.id && device.location && device.location.x && device.location.y) {
          const latLng: LatLngTuple = [device.location.x, device.location.y];
          devicePoints.push(latLng);
        }
      });
    });

    const deviceGroupBounds = this.getDeviceGroupBounds(devicePoints);
    const newDeviceGroupLayer = new L.Polygon(deviceGroupBounds) as any;
    newDeviceGroupLayer.setStyle({
      fillOpacity: layerStyleOptions.deviceGroupOpacity,
      // TODO: Needs API support for layer properties
      fillColor: layerStyleOptions.deviceGroupLayerColor,
    });
    this.deviceGroupLayers.addLayer(newDeviceGroupLayer);
    this.mapInstance.addLayer(this.deviceGroupLayers);
  }

  /**
   * Add device markers to leaflet map
   */
  private loadDevices = () => {
    this.deviceMarkers.clearLayers();
    const { mapData, selectedItems } = this.props;
    const tempMapData = { ...mapData };
    if (!tempMapData.devices || !this.mapInstance || selectedItems.antenna) {
      return;
    }

    if (selectedItems.device) {
      tempMapData.devices = [selectedItems.device];
    }

    const tempLeafletIdToDeviceMap = new Map<number, ExhibitionDevice>();

    tempMapData.devices.forEach(device => {

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

    this.mapInstance.addLayer(this.deviceMarkers);

    this.setState({
      leafletIdToDeviceMap: tempLeafletIdToDeviceMap
    });

  }

  /**
   * Add antenna markers to leaflet map
   */
  private loadAntennas = () => {
    this.antennaMarkers.clearLayers();
    const { mapData, selectedItems } = this.props;
    const tempMapData = { ...mapData };
    if (!tempMapData.antennas || !this.mapInstance || selectedItems.device) {
      return;
    }

    if (selectedItems.antenna) {
      tempMapData.antennas = [selectedItems.antenna];
    }

    const tempLeafletIdToAntennaMap = new Map<number, RfidAntenna>();

    tempMapData.antennas.forEach(antenna => {
      if (antenna && antenna.location && antenna.location.x && antenna.location.y) {
        const markerOptions: MarkerOptions = {
          icon: this.antennaIcon,
          draggable: false
        };

        const latlng = new LatLng(antenna.location.x, antenna.location.y);
        const customAntennaMarker = new L.Marker(latlng, markerOptions);
        this.antennaMarkers.addLayer(customAntennaMarker);
        const antennaMarkerId = this.antennaMarkers.getLayerId(customAntennaMarker);
        tempLeafletIdToAntennaMap.set(antennaMarkerId, antenna);
      }
    });

    this.mapInstance.addLayer(this.antennaMarkers);

    this.setState({
      leafletIdToAntennaMap: tempLeafletIdToAntennaMap
    });
  }

  /**
   * Get device group bounds
   *
   * @param devicePoints list of device points
   * @returns latLng expression which always contains four corner coordinates
   */
  private getDeviceGroupBounds = (devicePoints: LatLngExpression[]): LatLngExpression[] => {
    if (devicePoints.length === 0) {
      return [];
    }

    const { layerStyleOptions } = this;

    const sortX = devicePoints as LatLngTuple[];
    sortX.sort((point1, point2) => { return (point1[0] - point2[0]); });
    const leftX = sortX[0][0] - layerStyleOptions.deviceGroupPadding;
    const rightX = sortX[sortX.length - 1][0] + layerStyleOptions.deviceGroupPadding;

    const sortY = devicePoints as LatLngTuple[];
    sortY.sort((point1, point2) => { return (point1[1] - point2[1]); });
    const bottomY = sortX[0][1] - layerStyleOptions.deviceGroupPadding;
    const topY = sortX[sortX.length - 1][1] + layerStyleOptions.deviceGroupPadding;

    const deviceGroupBounds: LatLngTuple[] = [];

    /**
     * Needs to be in this specific order!
     */
    deviceGroupBounds.push([leftX, topY]);
    deviceGroupBounds.push([leftX, bottomY]);
    deviceGroupBounds.push([rightX, bottomY]);
    deviceGroupBounds.push([rightX, topY]);

    return deviceGroupBounds;
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
   * Handle antenna update
   *
   * @param leafletFeatureGroup leaflet feature group
   */
  private handleAntennaUpdate = (leafletFeatureGroup: FeatureGroup) => {
    const { selectedItems, onAntennaSave } = this.props;
    if (!selectedItems.antenna || !onAntennaSave) {
      return;
    }

    const antennaToUpdate = { ...selectedItems.antenna } as RfidAntenna;
    if (!antennaToUpdate.id) {
      return;
    }
    L.geoJSON(leafletFeatureGroup.toGeoJSON(), {
      onEachFeature(_feature, layer) {
        if (!antennaToUpdate || !antennaToUpdate.location) {
          return;
        }

        const marker = _feature.geometry as any;
        const newPoint: Point = {
          x: marker.coordinates[1],
          y: marker.coordinates[0]
        };
        antennaToUpdate.location = newPoint;
      }
    });

    onAntennaSave(antennaToUpdate);
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
   * Trigger L.Draw.Marker event which allows user to draw device marker on the map
   */
  public addDeviceMarker = () => {
    const drawMap = this.mapInstance! as DrawMap;
    const markerOptions: MarkerOptions = {
      icon: this.deviceIcon,
      draggable: false
    };
    const newMarker = new L.Draw.Marker(drawMap, markerOptions);
    newMarker.enable();
    this.setState({
      addingAntenna: false
    });
  }

  /**
   * Trigger L.Draw.Marker event which allows user to draw antenna marker on the map
   */
  public addAntennaMarker = () => {
    const drawMap = this.mapInstance! as DrawMap;
    const markerOptions: MarkerOptions = {
      icon: this.antennaIcon,
      draggable: false
    };
    const newMarker = new L.Draw.Marker(drawMap, markerOptions);
    newMarker.enable();
    this.setState({
      addingAntenna: true
    });
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
   * Enable editing mode for currently selected antenna marker
   */
  public editAntennaMarker = () => {
    const layers = this.antennaMarkers.getLayers();
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
   * Save current antenna marker
   */
  public saveAntennaMarker = () => {
    const { selectedItems } = this.props;
    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.fire(L.Draw.Event.EDITED, this.antennaMarkers);
    if (selectedItems.deviceGroup && selectedItems.antenna && selectedItems.antenna.groupId !== selectedItems.deviceGroup.id) {
      return;
    }
    const layers = this.antennaMarkers.getLayers();
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
   * Delete current antenna
   */
  public deleteAntenna = () => {
    this.antennaMarkers.clearLayers();
  }

  /**
   * Delete currently selected room
   */
  public deleteRoom = () => {
    this.roomLayers.clearLayers();
  }
}
