import * as React from "react";
import { Map as LeafletMap, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent, Layer, MarkerOptions, LatLngExpression, LatLngTuple } from "leaflet";
// TODO: Code mirror related imports.
// import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw";
// import "leaflet-draw/dist/leaflet.draw.css";
// tslint:disable-next-line: max-line-length
import { ExhibitionRoom, ExhibitionFloor, ExhibitionDeviceGroup, ExhibitionDevice, DeviceModel, RfidAntenna } from "../../generated/client";
import { Polygon } from "geojson";

/**
 * Component props
 */
interface Props {
  deviceModels?: DeviceModel[];
  exhibitionId?: string;

  mapData: MapData;
  floorPlanInfo: FloorPlanInfo;
  selectedItems: SelectedItems;

  onRoomClick?: (floorId: string, roomId: string, hasNodes: boolean) => void;
  onDeviceGroupClick?: (floorId: string, roomId: string, deviceGroupId: string, hasNodes?: boolean) => void;
}

/**
 * Component state
 */
interface State {
  zoom: number;
  cursorPosition?: LatLng;
  leafletIdToRoomMap: Map<number, ExhibitionRoom>;
  leafletIdToDeviceGroupMap: Map<number, ExhibitionDeviceGroup>;
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
  selectedItemHasNodes?: boolean;
}

/**
 * Component for floor plan map
 */
export default class ContentMap extends React.Component<Props, State> {

  // tslint:disable-next-line
  private mapInstance?: MapInstance;

  /**
   * This feature group contains all room layers that are displayed
   */
  private roomLayers = new L.FeatureGroup();

  /**
   * This feature group contains selected room layer
   */
  private selectedRoomLayer = new L.FeatureGroup();

  /**
   * This feature group contains all generated device group layers that are displayed
   */
  private deviceGroupLayers = new L.FeatureGroup();

  /**
   * This feature group contains selected device group layer
   */
  private selectedDeviceGroupLayer = new L.FeatureGroup();

  /**
   * Contains all style values for layers
   */
  private layerStyleOptions = {
    selectedRoomLayerOpacity: 0.6,
    roomLayerOpacity: 0.3,
    deviceGroupPadding: 0.3,
    selectedDeviceGroupOpacity: 1.0,
    selectedDeviceGroupColor: "#987654",
    deviceGroupOpacity: 0.3,
    deviceGroupLayerColor: "#3388ff",
    selectedMarkerOpacity: 1.0,
    markerOpacity: 0.8
  };

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
      leafletIdToDeviceGroupMap: new Map(),
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
      prevProps.selectedItems.deviceGroup !== this.props.selectedItems.deviceGroup ||
      JSON.stringify(prevProps.mapData) !== JSON.stringify(this.props.mapData)
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
    this.mapInstance.addLayer(this.selectedRoomLayer);
    this.mapInstance.addLayer(this.deviceGroupLayers);
    this.mapInstance.addLayer(this.selectedDeviceGroupLayer);

    this.roomLayers.on('click', event => {
      this.setSelectedRoom(event);
    });

    this.deviceGroupLayers.on('click', event => {
      this.setSelectedDeviceGroup(event);
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
   * Set selected device group
   *
   * @param event leaflet event
   */
  private setSelectedDeviceGroup = (event: L.LeafletEvent) => {
    const { onDeviceGroupClick, selectedItems } = this.props;
    const { leafletIdToDeviceGroupMap } = this.state;
    const foundDeviceGroup = leafletIdToDeviceGroupMap.get(event.layer._leaflet_id);

    if (!onDeviceGroupClick || !selectedItems.floor || !selectedItems.room || !foundDeviceGroup) {
      return;
    }

    onDeviceGroupClick(selectedItems.floor.id!, selectedItems.room.id!, foundDeviceGroup.id!);
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
  }

  /**
   * Add room layers to leaflet map
   */
  private loadRooms = () => {
    const { mapData, selectedItems } = this.props;
    this.roomLayers.clearLayers();
    this.selectedRoomLayer.clearLayers();
    if (!mapData.rooms) {
      return;
    }

    const tempRooms = [ ...mapData.rooms ] as ExhibitionRoom[];
    if (selectedItems.room) {
      this.addSelectedRoomLayer(tempRooms, selectedItems.room);
    }

    this.addRoomLayers(tempRooms);
  }

  /**
   * Add device markers to leaflet map
   */
  private loadDeviceGroup = () => {
    const { mapData, selectedItems } = this.props;
    this.deviceGroupLayers.clearLayers();
    this.selectedDeviceGroupLayer.clearLayers();

    if (!mapData.deviceGroups || !mapData.devices || !mapData.antennas) {
      return;
    }

    const tempDeviceGroups = [ ...mapData.deviceGroups ] as ExhibitionDeviceGroup[];
    const tempDevices = [ ...mapData.devices ] as ExhibitionDevice[];
    const tempAntennas = [ ...mapData.antennas ] as RfidAntenna[];

    if (selectedItems.deviceGroup) {
      this.addSelectedDeviceGroupLayer(selectedItems.deviceGroup, tempDeviceGroups, tempDevices, tempAntennas);
    }

    this.addDeviceGroupLayers(tempDeviceGroups, tempDevices, tempAntennas);
  }

  /**
   * Get layer polygon from geoJson
   *
   * @param geoJson polygon as geoJson
   * @param opacity layer opacity
   * @param color layer fill color
   */
  private getLayerPolygon = (geoJson: Polygon, layerName: string, opacity: number, color?: string) => {
    let tempLayer: any;
    L.geoJSON(geoJson, {
      onEachFeature(_feature, layer) {
        const customLayer = layer as any;
        customLayer.setStyle({
          fillOpacity: opacity,
          fillColor: color
        });
        customLayer.bindTooltip(layerName, {
          permanent: true,
        }).openTooltip();
        tempLayer = layer;
      }
    });

    return tempLayer;
  }

  /**
   * Add selected room layer handler
   *
   * @param tempRooms temporary list of exhibition rooms
   * @param selectedRoom currently selected exhibition room
   */
  private addSelectedRoomLayer = (tempRooms: ExhibitionRoom[], selectedRoom: ExhibitionRoom) => {
    const { layerStyleOptions } = this;

    const index = tempRooms.findIndex(room => room.id === selectedRoom.id);
    if (index === -1) {
      return;
    }

    const geoShape = selectedRoom.geoShape;
    if (geoShape && this.mapInstance && this.roomLayers) {
      const geoJson = geoShape as Polygon;
      try {
        const roomLayerToAdd: any = this.getLayerPolygon(geoJson, selectedRoom.name, layerStyleOptions.selectedRoomLayerOpacity, selectedRoom.color);
        this.selectedRoomLayer.addLayer(roomLayerToAdd);
        tempRooms.splice(index, 1);
      } catch (error) {
        console.log(error);
      }
    }
  }

  /**
   * Add room layers handler
   *
   * @param tempRooms temporary list of exhibition rooms
   */
  private addRoomLayers = (tempRooms: ExhibitionRoom[]) => {
    const { selectedItems } = this.props;
    const { layerStyleOptions } = this;

    if (!this.mapInstance) {
      return;
    }

    const tempMap = new Map<number, ExhibitionRoom>();
    tempRooms.forEach(room => {
      const geoShape = room.geoShape;
      if (geoShape && this.mapInstance && this.roomLayers) {
        const geoJson = geoShape as Polygon;
        try {
          const roomLayerToAdd: any = this.getLayerPolygon(geoJson, room.name, layerStyleOptions.roomLayerOpacity, room.color);
          this.addRoomLayersToMap(roomLayerToAdd, room, tempMap);
        } catch (error) {
          console.log(error);
        }
      }
    });

    if (this.roomLayers.getLayers().length > 0 && !selectedItems.deviceGroup) {
      this.mapInstance.fitBounds(this.roomLayers.getBounds());
    }

    this.setState({
      leafletIdToRoomMap : tempMap
    });
  }

  /**
   * Get custom marker with given styles
   *
   * @param device exhibition device or RFID antenna device
   * @param icon leaflet icon
   * @param opacity marker opacity
   * @returns new marker
   */
  private getCustomMarker = (device: ExhibitionDevice | RfidAntenna, icon: L.Icon, opacity: number): L.Marker<any> => {

    if (!device.location || !device.location.x || !device.location.y) {
      return new L.Marker([0.0, 0.0]);
    }

    const markerOptions: MarkerOptions = {
      icon: icon,
      draggable: false,
      opacity: opacity
    };

    const latlng = new LatLng(device.location.x, device.location.y);
    const customMarker = new L.Marker(latlng, markerOptions);

    return customMarker;
  }

  /**
   * Add selected device group layer
   *
   * @param selectedDeviceGroup selected device group
   * @param tempDeviceGroups list of device groups
   * @param tempDevices list of devices
   * @param tempAntennas list of antennas
   */
  // tslint:disable-next-line: max-line-length
  private addSelectedDeviceGroupLayer = (selectedDeviceGroup: ExhibitionDeviceGroup, tempDeviceGroups: ExhibitionDeviceGroup[], tempDevices: ExhibitionDevice[], tempAntennas?: RfidAntenna[]) => {
    const { layerStyleOptions } = this;

    const deviceGroupIndex = tempDeviceGroups.findIndex(group => group.id === selectedDeviceGroup.id);
    if (deviceGroupIndex === -1) {
      return;
    }

    const devicePoints: LatLngExpression[] = [];
    tempDevices.filter(device => device.groupId === selectedDeviceGroup.id).forEach(device => {
      if (device.location && device.location.x && device.location.y) {
        const latLng: LatLngTuple = [device.location.x, device.location.y];
        devicePoints.push(latLng);
      }
    });
    if (tempAntennas) {
      tempAntennas.filter(antenna => antenna.groupId === selectedDeviceGroup.id).forEach(antenna => {
        if (antenna.location.x && antenna.location.y) {
          const latLng: LatLngTuple = [antenna.location.x, antenna.location.y];
          devicePoints.push(latLng);
        }
      });
    }

    const layer = this.createDeviceGroupLayer(devicePoints, layerStyleOptions.selectedDeviceGroupOpacity, layerStyleOptions.selectedDeviceGroupColor);
    this.selectedDeviceGroupLayer.addLayer(layer);
  }

  /**
   * Add device group layers
   *
   * @param tempDeviceGroups list of device groups
   * @param tempDevices list of devices
   * @param tempAntennas list of antennas
   */
  private addDeviceGroupLayers = (tempDeviceGroups: ExhibitionDeviceGroup[], tempDevices: ExhibitionDevice[], tempAntennas?: RfidAntenna[]) => {
    const { layerStyleOptions } = this;

    if (!this.mapInstance) {
      return;
    }

    const tempLeafletIdToDeviceGroupMap = new Map<number, ExhibitionDeviceGroup>();
    tempDeviceGroups.forEach(deviceGroup => {
      const devicePoints = this.findDevicePoints(tempDevices, deviceGroup, tempAntennas);

      const layer = this.createDeviceGroupLayer(devicePoints, layerStyleOptions.deviceGroupOpacity, layerStyleOptions.deviceGroupLayerColor);
      this.deviceGroupLayers.addLayer(layer);
      const layerId = this.deviceGroupLayers.getLayerId(layer);
      tempLeafletIdToDeviceGroupMap.set(layerId, deviceGroup);
    });

    this.setState({
      leafletIdToDeviceGroupMap: tempLeafletIdToDeviceGroupMap
    });

    this.mapInstance.addLayer(this.deviceGroupLayers);
  }

  /**
   * Create device group layer
   *
   * @param devicePoints list device points
   * @param opacity layer opacity
   * @param color layer fill color
   */
  private createDeviceGroupLayer = (devicePoints: LatLngExpression[], opacity: number, color: string) => {
    const deviceGroupBounds = this.getDeviceGroupBounds(devicePoints);
    const newDeviceGroupLayer = new L.Polygon(deviceGroupBounds) as any;
    newDeviceGroupLayer.setStyle({
      fillOpacity: opacity,
      fillColor: color,
    });
    return newDeviceGroupLayer;
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
   * Find device points
   *
   * @param tempDevices list of device
   * @param selectedDeviceGroup selected device group
   * @param devicePoints list of device points
   * @param tempAntennas list of antennas
   * @returns list of device points
   */
  // tslint:disable-next-line: max-line-length
  private findDevicePoints = (tempDevices: ExhibitionDevice[], selectedDeviceGroup: ExhibitionDeviceGroup, tempAntennas?: RfidAntenna[]): LatLngExpression[] => {
    const devicePoints: LatLngExpression[] = [];
    tempDevices.filter(device => device.groupId === selectedDeviceGroup.id).forEach(device => {
      if (device.location && device.location.x && device.location.y) {
        const latLng: LatLngTuple = [device.location.x, device.location.y];
        devicePoints.push(latLng);
      }
    });

    if (tempAntennas) {
      tempAntennas.filter(antenna => antenna.groupId === selectedDeviceGroup.id).forEach(antenna => {
        if (antenna.location.x && antenna.location.y) {
          const latLng: LatLngTuple = [antenna.location.x, antenna.location.y];
          devicePoints.push(latLng);
        }
      });
    }

    return devicePoints;
  }

  /**
   * Adds all room geo shapes found from api to leaflet map
   *
   * @param roomLayersToAdd list of room layers
   * @param room room
   * @param tempMap temp maps
   */
  private addRoomLayersToMap(roomLayer: Layer, room: ExhibitionRoom, tempMap: Map<number, ExhibitionRoom>) {
    if (!this.mapInstance) {
      return;
    }

    if (room.id) {
      this.roomLayers.addLayer(roomLayer);
      const layerId = this.roomLayers.getLayerId(roomLayer);
      tempMap.set(layerId, room);
    }
  }
}