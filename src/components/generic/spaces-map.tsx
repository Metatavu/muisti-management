import {
  DeviceImageLoadStrategy,
  DeviceModel,
  ExhibitionDevice,
  ExhibitionDeviceGroup,
  ExhibitionFloor,
  ExhibitionRoom,
  Point,
  Polygon as ApiPolygon,
  RfidAntenna,
  ScreenOrientation
} from "../../generated/client";
import strings from "../../localization/strings";
import antennaIcon from "../../resources/gfx/svg/antennaIcon.svg";
import deviceIcon from "../../resources/gfx/svg/deviceIcon.svg";
import { FeatureCollection, Polygon } from "geojson";
import {
  CRS,
  DrawMap,
  FeatureGroup,
  LatLng,
  LatLngBounds,
  LatLngExpression,
  LatLngTuple,
  Layer,
  LeafletMouseEvent,
  Map as MapInstance,
  MarkerOptions
} from "leaflet";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import * as React from "react";
import { ImageOverlay, Map as LeafletMap, ScaleControl } from "react-leaflet";

// Required for Leaflet to work.
// Older version of Leaflet declares it as global variable but newer version no longer does
// https://github.com/Leaflet/Leaflet.draw/issues/1026#issuecomment-986702652
window.type = true;

/**
 * Component props
 */
interface Props {
  deviceModels?: DeviceModel[];
  exhibitionId?: string;

  mapData: MapData;
  floorPlanInfo: FloorPlanInfo;
  selectedItems: SelectedItems;

  onRoomAdd?: (roomToCreate: ExhibitionRoom) => void;
  onRoomSave?: (updatedRoom: ExhibitionRoom) => void;
  onRoomClick?: (floorId: string, roomId: string) => void;

  onDeviceGroupClick?: (
    floorId: string,
    roomId: string,
    deviceGroupId: string,
    hasNodes: boolean
  ) => void;

  onDeviceAdd?: (deviceToCreate: ExhibitionDevice) => void;
  onDeviceSave?: (deviceToUpdate: ExhibitionDevice) => void;
  onDeviceClick?: (
    floorId: string,
    roomId: string,
    deviceGroupId: string,
    deviceId: string,
    hasNodes: boolean
  ) => void;

  onAntennaAdd?: (antennaToCreate: RfidAntenna) => void;
  onAntennaSave?: (antennaToUpdate: RfidAntenna) => void;
  onAntennaClick?: (
    floorId: string,
    roomId: string,
    deviceGroupId: string,
    antennaId: string,
    hasNodes: boolean
  ) => void;
  onDataChange: () => void;
}

/**
 * Component state
 */
interface State {
  zoom: number;
  cursorPosition?: LatLng;
  leafletIdToRoomMap: Map<number, ExhibitionRoom>;
  leafletIdToDeviceGroupMap: Map<number, ExhibitionDeviceGroup>;
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
  floor?: ExhibitionFloor;
  room?: ExhibitionRoom;
  deviceGroup?: ExhibitionDeviceGroup;
  device?: ExhibitionDevice;
  antenna?: RfidAntenna;
  selectedItemHasNodes?: boolean;
}

/**
 * Component for floor plan map
 */
export default class SpacesMap extends React.Component<Props, State> {
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
   * This feature group contains all devices that are displayed
   */
  private deviceMarkers = new L.FeatureGroup();

  /**
   * This feature group contains all antennas that are displayed
   */
  private antennaMarkers = new L.FeatureGroup();

  /**
   * This feature group contains selected marker
   */
  private selectedMarker = new L.FeatureGroup();

  /**
   * Custom device icon
   */
  private deviceIcon = new L.Icon({
    iconUrl: deviceIcon,
    iconSize: new L.Point(50, 50),
    iconAnchor: undefined,
    popupAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    className: "device-icon"
  });

  /**
   * Custom selected device icon
   */
  private selectedDeviceIcon = new L.Icon({
    iconUrl: deviceIcon,
    iconSize: new L.Point(60, 60),
    iconAnchor: undefined,
    popupAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    className: "device-icon"
  });

  /**
   * Custom antenna icon
   */
  private antennaIcon = new L.Icon({
    iconUrl: antennaIcon,
    iconSize: new L.Point(50, 50),
    iconAnchor: undefined,
    popupAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    className: "antenna-icon"
  });

  /**
   * Custom selected antenna icon
   */
  private selectedAntennaIcon = new L.Icon({
    iconUrl: antennaIcon,
    iconSize: new L.Point(60, 60),
    iconAnchor: undefined,
    popupAnchor: undefined,
    shadowUrl: undefined,
    shadowSize: undefined,
    shadowAnchor: undefined,
    className: "antenna-icon"
  });

  /**
   * Contains all style values for layers
   *
   * TODO: Needs API support for layer properties
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
      leafletIdToDeviceGroupMap: new Map(),
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
  };

  /**
   * Component did update handler
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (
      prevProps.selectedItems.floor !== this.props.selectedItems.floor ||
      prevProps.selectedItems.room !== this.props.selectedItems.room ||
      prevProps.selectedItems.device !== this.props.selectedItems.device ||
      prevProps.selectedItems.deviceGroup !== this.props.selectedItems.deviceGroup ||
      prevProps.selectedItems.antenna !== this.props.selectedItems.antenna ||
      JSON.stringify(prevProps.mapData) !== JSON.stringify(this.props.mapData)
    ) {
      this.initializeMapData();
    }
  };

  /**
   * Component render method
   */
  public render = () => {
    const { floorPlanInfo } = this.props;

    return (
      <LeafletMap
        ref={this.setMapRef}
        key="leafletMap"
        crs={CRS.Simple}
        center={[0, 0]}
        bounds={floorPlanInfo.bounds}
        minZoom={floorPlanInfo.minZoom}
        maxZoom={floorPlanInfo.maxZoom}
        zoom={this.state.zoom}
        style={{ width: "100%", height: "100%" }}
        onmousemove={this.onMapMouseMove}
      >
        {this.renderMapChildren()}
      </LeafletMap>
    );
  };

  /**
   * Renders map child components
   */
  private renderMapChildren = () => {
    const { floorPlanInfo } = this.props;

    return (
      <>
        <ImageOverlay url={floorPlanInfo.url} bounds={floorPlanInfo.bounds} />
        <ScaleControl imperial={false} />
      </>
    );
  };

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

    this.addDrawHandler();

    this.mapInstance.on(L.Draw.Event.EDITED, (event) => {
      this.onEditLayers(event);
    });

    this.roomLayers.on("click", (event) => {
      this.setSelectedRoom(event);
    });

    this.deviceGroupLayers.on("click", (event) => {
      this.setSelectedDeviceGroup(event);
    });

    this.deviceMarkers.on("click", (event) => {
      this.setSelectedDevice(event);
    });

    this.antennaMarkers.on("click", (event) => {
      this.setSelectedAntenna(event);
    });
  };

  /**
   * Event handler for mouse moving over the map
   *
   * @param event leaflet mouse event
   */
  private onMapMouseMove = (event: LeafletMouseEvent) => {
    this.setState({
      cursorPosition: event.latlng
    });
  };

  /**
   * Add draw handler
   */
  private addDrawHandler = () => {
    if (!this.mapInstance) {
      return;
    }

    this.mapInstance.on(L.Draw.Event.CREATED, (event) => {
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
  };

  /**
   * Device marker creation handler
   *
   * @param event leaflet event
   */
  private handleDeviceMarkerCreation = (event: L.LeafletEvent) => {
    const { exhibitionId, selectedItems, deviceModels, onDeviceAdd } = this.props;
    if (
      !exhibitionId ||
      !selectedItems.deviceGroup ||
      !selectedItems.deviceGroup.id ||
      !deviceModels ||
      !deviceModels[0].id ||
      !onDeviceAdd
    ) {
      return;
    }

    const marker = event.layer;
    if (marker?._latlng) {
      const markerOptions: MarkerOptions = {
        icon: this.deviceIcon,
        draggable: false
      };
      const customMarker = new L.Marker(marker._latlng, markerOptions);
      this.deviceMarkers.addLayer(customMarker);

      const exhibitionDevice: ExhibitionDevice = {
        name: strings.floorPlan.device.new,
        groupId: selectedItems.deviceGroup.id,
        screenOrientation: ScreenOrientation.Landscape,
        imageLoadStrategy: DeviceImageLoadStrategy.Memory,
        location: {
          x: marker._latlng.lat,
          y: marker._latlng.lng
        }
      };
      onDeviceAdd(exhibitionDevice);
    }
  };

  /**
   * Antenna marker creation handler
   *
   * @param event leaflet event
   */
  private handleAntennaMarkerCreation = (event: L.LeafletEvent) => {
    const { exhibitionId, selectedItems, mapData, onAntennaAdd } = this.props;
    // tslint:disable-next-line: max-line-length
    if (
      !exhibitionId ||
      !selectedItems.room ||
      !selectedItems.room.id ||
      !selectedItems.deviceGroup ||
      !selectedItems.deviceGroup.id ||
      mapData.antennas === undefined ||
      !onAntennaAdd
    ) {
      return;
    }

    const marker = event.layer;
    if (marker?._latlng) {
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
        },
        visitorSessionStartThreshold: 80,
        visitorSessionEndThreshold: 10
      };
      onAntennaAdd(rfidAntenna);
    }
  };

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
    if (room?._latlngs) {
      const newRoom = new L.Rectangle(room._latlngs);
      this.addedLayers.addLayer(newRoom);

      const geoJson = this.addedLayers.toGeoJSON() as FeatureCollection;
      if (geoJson.features[0].geometry.type !== "Polygon") {
        this.addedLayers = new L.FeatureGroup();
        return;
      }
      const roomPolygon = geoJson.features[0].geometry as ApiPolygon;
      const roomToCreate: ExhibitionRoom = {
        floorId: selectedItems.floor.id,
        name: strings.floorPlan.room.new,
        geoShape: roomPolygon
      };
      onRoomAdd(roomToCreate);
      this.addedLayers = new L.FeatureGroup();
    }
  };

  /**
   * Set selected room
   *
   * @param event leaflet event
   */
  private setSelectedRoom = (event: L.LeafletEvent) => {
    const { onRoomClick, selectedItems } = this.props;
    const { leafletIdToRoomMap } = this.state;
    const foundRoom = leafletIdToRoomMap.get(event.layer._leaflet_id);

    if (!onRoomClick || !selectedItems.floor?.id || !foundRoom?.id) {
      return;
    }

    onRoomClick(selectedItems.floor.id, foundRoom.id);
  };

  /**
   * Set selected device group
   *
   * @param event leaflet event
   */
  private setSelectedDeviceGroup = (event: L.LeafletEvent) => {
    const { onDeviceGroupClick, selectedItems } = this.props;
    const { leafletIdToDeviceGroupMap } = this.state;
    const foundDeviceGroup = leafletIdToDeviceGroupMap.get(event.layer._leaflet_id);

    if (
      !onDeviceGroupClick ||
      !selectedItems.floor ||
      !selectedItems.room ||
      !foundDeviceGroup ||
      !selectedItems.selectedItemHasNodes
    ) {
      return;
    }

    onDeviceGroupClick(
      selectedItems.floor.id!,
      selectedItems.room.id!,
      foundDeviceGroup.id!,
      selectedItems.selectedItemHasNodes
    );
  };

  /**
   * Set selected device
   *
   * @param event leaflet event
   */
  private setSelectedDevice = (event: L.LeafletEvent) => {
    const { onDeviceClick, selectedItems } = this.props;
    const { leafletIdToDeviceMap } = this.state;
    const foundDevice = leafletIdToDeviceMap.get(event.layer._leaflet_id);
    if (
      !onDeviceClick ||
      !selectedItems.floor ||
      !selectedItems.room ||
      !selectedItems.deviceGroup ||
      !foundDevice ||
      selectedItems.selectedItemHasNodes === undefined
    ) {
      return;
    }
    onDeviceClick(
      selectedItems.floor.id!,
      selectedItems.room.id!,
      selectedItems.deviceGroup.id!,
      foundDevice.id!,
      selectedItems.selectedItemHasNodes
    );
  };

  /**
   * Set selected antenna
   *
   * @param event leaflet event
   */
  private setSelectedAntenna = (event: L.LeafletEvent) => {
    const { onAntennaClick, selectedItems } = this.props;
    const { leafletIdToAntennaMap } = this.state;
    const foundAntenna = leafletIdToAntennaMap.get(event.layer._leaflet_id);
    if (
      !onAntennaClick ||
      !selectedItems.floor ||
      !selectedItems.room ||
      !selectedItems.deviceGroup ||
      !foundAntenna ||
      selectedItems.selectedItemHasNodes === undefined
    ) {
      return;
    }
    onAntennaClick(
      selectedItems.floor.id!,
      selectedItems.room.id!,
      selectedItems.deviceGroup.id!,
      foundAntenna.id!,
      selectedItems.selectedItemHasNodes
    );
  };

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
  };

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
  };

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

    const tempRooms = [...mapData.rooms] as ExhibitionRoom[];
    if (selectedItems.room) {
      this.addSelectedRoomLayer(tempRooms, selectedItems.room);
    }

    this.addRoomLayers(tempRooms);
  };

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

    const tempDeviceGroups = [...mapData.deviceGroups] as ExhibitionDeviceGroup[];
    const tempDevices = [...mapData.devices] as ExhibitionDevice[];
    const tempAntennas = [...mapData.antennas] as RfidAntenna[];

    if (selectedItems.deviceGroup) {
      this.addSelectedDeviceGroupLayer(
        selectedItems.deviceGroup,
        tempDeviceGroups,
        tempDevices,
        tempAntennas
      );
    }

    this.addDeviceGroupLayers(tempDeviceGroups, tempDevices, tempAntennas);
  };

  /**
   * Add device markers to leaflet map
   */
  private loadDevices = () => {
    this.deviceMarkers.clearLayers();
    this.selectedMarker.clearLayers();

    const { mapData, selectedItems } = this.props;
    if (!mapData.devices || !selectedItems.deviceGroup) {
      return;
    }

    const tempDevices = [...mapData.devices] as ExhibitionDevice[];

    if (selectedItems.device) {
      this.addSelectedDeviceMarker(tempDevices, selectedItems.device);
    }

    this.addDeviceMarkers(tempDevices);
  };

  /**
   * Add antenna markers to leaflet map
   */
  private loadAntennas = () => {
    this.antennaMarkers.clearLayers();

    const { mapData, selectedItems } = this.props;

    if (!mapData.antennas || !selectedItems.deviceGroup) {
      return;
    }

    const tempAntennas = [...mapData.antennas] as RfidAntenna[];

    if (selectedItems.antenna) {
      this.addSelectedAntennaMarker(tempAntennas, selectedItems.antenna);
    }

    this.addAntennaMarkers(tempAntennas);
  };

  /**
   * Get layer polygon from geoJson
   *
   * @param geoJson polygon as geoJson
   * @param opacity layer opacity
   * @param color layer fill color
   */
  private getLayerPolygon = (
    geoJson: Polygon,
    layerName: string,
    opacity: number,
    color?: string
  ) => {
    const { onDataChange } = this.props;
    let tempLayer: any;
    // Temporary fix for invalid geoJson data from API
    const tempGeoJson: Polygon = {
      ...geoJson,
      coordinates: geoJson.coordinates.map((coordinates) =>
        coordinates.filter((coordinate) => coordinate.length > 0)
      )
    };
    L.geoJSON(tempGeoJson, {
      style: {
        fillOpacity: opacity,
        fillColor: color
      },
      onEachFeature(_feature, layer) {
        layer
          .bindTooltip(layerName, {
            permanent: false
          })
          .on("edit", () => onDataChange())
          .openTooltip();
        tempLayer = layer;
      }
    });

    return tempLayer;
  };

  /**
   * Add selected room layer handler
   *
   * @param tempRooms temporary list of exhibition rooms
   * @param selectedRoom currently selected exhibition room
   */
  private addSelectedRoomLayer = (tempRooms: ExhibitionRoom[], selectedRoom: ExhibitionRoom) => {
    const { layerStyleOptions } = this;

    const index = tempRooms.findIndex((room) => room.id === selectedRoom.id);
    if (index === -1) {
      return;
    }

    const geoShape = selectedRoom.geoShape;
    if (geoShape && this.mapInstance && this.roomLayers) {
      const geoJson = geoShape as Polygon;
      try {
        const roomLayerToAdd: any = this.getLayerPolygon(
          geoJson,
          selectedRoom.name,
          layerStyleOptions.selectedRoomLayerOpacity,
          selectedRoom.color
        );
        this.selectedRoomLayer.addLayer(roomLayerToAdd);
        tempRooms.splice(index, 1);
      } catch (error) {
        console.error(error);
      }
    }
  };

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
    tempRooms.forEach((room) => {
      const geoShape = room.geoShape;
      if (geoShape && this.mapInstance && this.roomLayers) {
        const geoJson = geoShape as Polygon;
        try {
          const roomLayerToAdd: any = this.getLayerPolygon(
            geoJson,
            room.name,
            layerStyleOptions.roomLayerOpacity,
            room.color
          );
          this.addRoomLayersToMap(roomLayerToAdd, room, tempMap);
        } catch (error) {
          console.error(error);
        }
      }
    });

    if (
      this.roomLayers.getLayers().length > 0 &&
      !selectedItems.deviceGroup &&
      !selectedItems.device &&
      !selectedItems.antenna
    ) {
      this.mapInstance.fitBounds(this.roomLayers.getBounds());
    }

    this.setState({
      leafletIdToRoomMap: tempMap
    });
  };

  /**
   * Get custom marker with given styles
   *
   * @param device exhibition device or RFID antenna device
   * @param icon leaflet icon
   * @param opacity marker opacity
   * @returns new marker
   */
  private getCustomMarker = (
    device: ExhibitionDevice | RfidAntenna,
    icon: L.Icon,
    opacity: number
  ): L.Marker<any> => {
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
  };

  /**
   * Add selected device group layer
   *
   * @param selectedDeviceGroup selected device group
   * @param tempDeviceGroups list of device groups
   * @param tempDevices list of devices
   * @param tempAntennas list of antennas
   */
  // tslint:disable-next-line: max-line-length
  private addSelectedDeviceGroupLayer = (
    selectedDeviceGroup: ExhibitionDeviceGroup,
    tempDeviceGroups: ExhibitionDeviceGroup[],
    tempDevices: ExhibitionDevice[],
    tempAntennas?: RfidAntenna[]
  ) => {
    const { layerStyleOptions } = this;

    const deviceGroupIndex = tempDeviceGroups.findIndex(
      (group) => group.id === selectedDeviceGroup.id
    );
    if (deviceGroupIndex === -1) {
      return;
    }

    const devicePoints: LatLngExpression[] = [];
    tempDevices
      .filter((device) => device.groupId === selectedDeviceGroup.id)
      .forEach((device) => {
        if (device.location && device.location.x && device.location.y) {
          const latLng: LatLngTuple = [device.location.x, device.location.y];
          devicePoints.push(latLng);
        }
      });
    if (tempAntennas) {
      tempAntennas
        .filter((antenna) => antenna.groupId === selectedDeviceGroup.id)
        .forEach((antenna) => {
          if (antenna.location.x && antenna.location.y) {
            const latLng: LatLngTuple = [antenna.location.x, antenna.location.y];
            devicePoints.push(latLng);
          }
        });
    }

    const layer = this.createDeviceGroupLayer(
      devicePoints,
      layerStyleOptions.selectedDeviceGroupOpacity,
      layerStyleOptions.selectedDeviceGroupColor
    );
    this.selectedDeviceGroupLayer.addLayer(layer);
  };

  /**
   * Add device group layers
   *
   * @param tempDeviceGroups list of device groups
   * @param tempDevices list of devices
   * @param tempAntennas list of antennas
   */
  private addDeviceGroupLayers = (
    tempDeviceGroups: ExhibitionDeviceGroup[],
    tempDevices: ExhibitionDevice[],
    tempAntennas?: RfidAntenna[]
  ) => {
    const { layerStyleOptions } = this;

    if (!this.mapInstance) {
      return;
    }

    const tempLeafletIdToDeviceGroupMap = new Map<number, ExhibitionDeviceGroup>();
    tempDeviceGroups.forEach((deviceGroup) => {
      const devicePoints = this.findDevicePoints(tempDevices, deviceGroup, tempAntennas);

      const layer = this.createDeviceGroupLayer(
        devicePoints,
        layerStyleOptions.deviceGroupOpacity,
        layerStyleOptions.deviceGroupLayerColor
      );
      this.deviceGroupLayers.addLayer(layer);
      const layerId = this.deviceGroupLayers.getLayerId(layer);
      tempLeafletIdToDeviceGroupMap.set(layerId, deviceGroup);
    });

    this.setState({
      leafletIdToDeviceGroupMap: tempLeafletIdToDeviceGroupMap
    });

    this.mapInstance.addLayer(this.deviceGroupLayers);
  };

  /**
   * Add selected device marker
   *
   * @param tempDevices list of devices
   * @param selectedDevice selected device
   */
  private addSelectedDeviceMarker = (
    tempDevices: ExhibitionDevice[],
    selectedDevice: ExhibitionDevice
  ) => {
    const { layerStyleOptions, selectedDeviceIcon } = this;
    const deviceIndex = tempDevices.findIndex((device) => device.id === selectedDevice.id);
    if (deviceIndex === -1) {
      return;
    }

    const marker = this.getCustomMarker(
      selectedDevice,
      selectedDeviceIcon,
      layerStyleOptions.selectedMarkerOpacity
    );
    this.selectedMarker.addLayer(marker);
    tempDevices.splice(deviceIndex, 1);
  };

  /**
   * Add device markers
   *
   * @param tempDevices list of devices
   */
  private addDeviceMarkers = (tempDevices: ExhibitionDevice[]) => {
    const { layerStyleOptions } = this;
    const { selectedItems } = this.props;
    if (!this.mapInstance) {
      return;
    }

    const tempLeafletIdToDeviceMap = new Map<number, ExhibitionDevice>();
    let opacity = layerStyleOptions.selectedMarkerOpacity;

    if (selectedItems.device || selectedItems.antenna) {
      opacity = layerStyleOptions.markerOpacity;
    }

    tempDevices
      .filter((device) => device.groupId === selectedItems.deviceGroup!.id)
      .forEach((device) => {
        const marker = this.getCustomMarker(device, this.deviceIcon, opacity);
        this.deviceMarkers.addLayer(marker);
        const markerId = this.deviceMarkers.getLayerId(marker);
        tempLeafletIdToDeviceMap.set(markerId, device);
      });

    this.mapInstance.addLayer(this.selectedMarker);
    this.mapInstance.addLayer(this.deviceMarkers);

    this.setState({
      leafletIdToDeviceMap: tempLeafletIdToDeviceMap
    });
  };

  /**
   * Add selected antenna marker
   *
   * @param tempAntennas list of antennas
   * @param selectedAntenna selected antenna
   */
  private addSelectedAntennaMarker = (
    tempAntennas: RfidAntenna[],
    selectedAntenna: RfidAntenna
  ) => {
    const { layerStyleOptions, selectedAntennaIcon } = this;
    const antennaIndex = tempAntennas.findIndex((antenna) => antenna.id === selectedAntenna.id);
    if (antennaIndex === -1) {
      return;
    }

    const marker = this.getCustomMarker(
      selectedAntenna,
      selectedAntennaIcon,
      layerStyleOptions.selectedMarkerOpacity
    );
    this.selectedMarker.addLayer(marker);
    tempAntennas.splice(antennaIndex, 1);
  };

  /**
   * Add antenna markers
   *
   * @param tempAntennas list of antennas
   */
  private addAntennaMarkers = (tempAntennas: RfidAntenna[]) => {
    const { layerStyleOptions } = this;
    const { selectedItems } = this.props;

    if (!this.mapInstance) {
      return;
    }

    const tempLeafletIdToAntennaMap = new Map<number, RfidAntenna>();

    let opacity = layerStyleOptions.selectedMarkerOpacity;

    if (selectedItems.device || selectedItems.antenna) {
      opacity = layerStyleOptions.markerOpacity;
    }

    tempAntennas
      .filter((antenna) => antenna.groupId === selectedItems.deviceGroup!.id)
      .forEach((antenna) => {
        if (selectedItems.deviceGroup && selectedItems.deviceGroup.id !== antenna.groupId) {
          return;
        }
        const marker = this.getCustomMarker(antenna, this.antennaIcon, opacity);
        this.antennaMarkers.addLayer(marker);
        const antennaMarkerId = this.antennaMarkers.getLayerId(marker);
        tempLeafletIdToAntennaMap.set(antennaMarkerId, antenna);
      });

    this.mapInstance.addLayer(this.antennaMarkers);

    this.setState({
      leafletIdToAntennaMap: tempLeafletIdToAntennaMap
    });
  };

  /**
   * Create device group layer
   *
   * @param devicePoints list device points
   * @param opacity layer opacity
   * @param color layer fill color
   */
  private createDeviceGroupLayer = (
    devicePoints: LatLngExpression[],
    opacity: number,
    color: string
  ) => {
    const deviceGroupBounds = this.getDeviceGroupBounds(devicePoints);
    const newDeviceGroupLayer = new L.Polygon(deviceGroupBounds) as any;
    newDeviceGroupLayer.setStyle({
      fillOpacity: opacity,
      fillColor: color
    });
    return newDeviceGroupLayer;
  };

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
    sortX.sort((point1, point2) => {
      return point1[0] - point2[0];
    });
    const leftX = sortX[0][0] - layerStyleOptions.deviceGroupPadding;
    const rightX = sortX[sortX.length - 1][0] + layerStyleOptions.deviceGroupPadding;

    const sortY = devicePoints as LatLngTuple[];
    sortY.sort((point1, point2) => {
      return point1[1] - point2[1];
    });
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
  };

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
  private findDevicePoints = (
    tempDevices: ExhibitionDevice[],
    selectedDeviceGroup: ExhibitionDeviceGroup,
    tempAntennas?: RfidAntenna[]
  ): LatLngExpression[] => {
    const devicePoints: LatLngExpression[] = [];
    tempDevices
      .filter((device) => device.groupId === selectedDeviceGroup.id)
      .forEach((device) => {
        if (device.location && device.location.x && device.location.y) {
          const latLng: LatLngTuple = [device.location.x, device.location.y];
          devicePoints.push(latLng);
        }
      });

    if (tempAntennas) {
      tempAntennas
        .filter((antenna) => antenna.groupId === selectedDeviceGroup.id)
        .forEach((antenna) => {
          if (antenna.location.x && antenna.location.y) {
            const latLng: LatLngTuple = [antenna.location.x, antenna.location.y];
            devicePoints.push(latLng);
          }
        });
    }

    return devicePoints;
  };

  /**
   * Adds all room geo shapes found from api to leaflet map
   *
   * @param roomLayersToAdd list of room layers
   * @param room room
   * @param tempMap temp maps
   */
  private addRoomLayersToMap(
    roomLayer: Layer,
    room: ExhibitionRoom,
    tempMap: Map<number, ExhibitionRoom>
  ) {
    if (!this.mapInstance) {
      return;
    }

    if (room.id) {
      this.roomLayers.addLayer(roomLayer);
      const layerId = this.roomLayers.getLayerId(roomLayer);
      tempMap.set(layerId, room);
    }
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
  };

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
  };

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
  };

  /**
   * Trigger L.Draw.Rectangle event which allows user to draw rectangle on the map
   */
  public addRoom = () => {
    if (!this.mapInstance) {
      return;
    }

    const drawMap = this.mapInstance as DrawMap;
    const newRoomShape = new L.Draw.Rectangle(drawMap);
    newRoomShape.enable();
  };

  /**
   * Enable editing mode for currently selected room polygon
   */
  public editRoom = () => {
    const layers = this.selectedRoomLayer.getLayers();
    if (layers && layers.length > 0) {
      const layer = layers[0] as any;
      layer.editing.enable();
    }
  };

  /**
   * Save current device marker
   */
  public saveRoom = () => {
    if (!this.mapInstance) {
      return;
    }

    const layers = this.selectedRoomLayer.getLayers();
    if (layers && layers.length > 0) {
      this.mapInstance.fire(L.Draw.Event.EDITED, this.selectedRoomLayer);
      const layer = layers[0] as any;
      layer.editing.disable();
    }
  };

  /**
   * Trigger L.Draw.Marker event which allows user to draw device marker on the map
   */
  public addDeviceMarker = () => {
    if (!this.mapInstance) {
      return;
    }

    const drawMap = this.mapInstance as DrawMap;
    const markerOptions: MarkerOptions = {
      icon: this.deviceIcon,
      draggable: false
    };
    const newMarker = new L.Draw.Marker(drawMap, markerOptions);
    newMarker.enable();
    this.setState({
      addingAntenna: false
    });
  };

  /**
   * Trigger L.Draw.Marker event which allows user to draw antenna marker on the map
   */
  public addAntennaMarker = () => {
    if (!this.mapInstance) {
      return;
    }

    const drawMap = this.mapInstance as DrawMap;
    const markerOptions: MarkerOptions = {
      icon: this.antennaIcon,
      draggable: false
    };
    const newMarker = new L.Draw.Marker(drawMap, markerOptions);
    newMarker.enable();
    this.setState({
      addingAntenna: true
    });
  };

  /**
   * Enable editing mode for currently selected device marker
   */
  public editDeviceMarker = () => {
    const layers = this.selectedMarker.getLayers();
    if (layers && layers.length > 0) {
      const layer = layers[0] as any;
      layer.editing.enable();
      this.props.onDataChange();
    }
  };

  /**
   * Enable editing mode for currently selected antenna marker
   */
  public editAntennaMarker = () => {
    const layers = this.selectedMarker.getLayers();
    if (layers && layers.length > 0) {
      const layer = layers[0] as any;
      layer.editing.enable();
      this.props.onDataChange();
    }
  };

  /**
   * Save current device marker
   */
  public saveDeviceMarker = () => {
    if (!this.mapInstance) {
      return;
    }

    const layers = this.selectedMarker.getLayers();
    if (layers && layers.length > 0) {
      this.mapInstance.fire(L.Draw.Event.EDITED, this.selectedMarker);
      const layer = layers[0] as any;
      layer.editing.disable();
    }
  };

  /**
   * Save current antenna marker
   */
  public saveAntennaMarker = () => {
    const { selectedItems } = this.props;
    if (!this.mapInstance) {
      return;
    }
    const layers = this.selectedMarker.getLayers();
    if (layers && layers.length > 0) {
      this.mapInstance.fire(L.Draw.Event.EDITED, this.selectedMarker);
      if (
        selectedItems.deviceGroup &&
        selectedItems.antenna &&
        selectedItems.antenna.groupId !== selectedItems.deviceGroup.id
      ) {
        return;
      }
      const layer = layers[0] as any;
      layer.editing.disable();
    }
  };

  /**
   * Delete current device
   */
  public deleteDevice = () => {
    this.deviceMarkers.clearLayers();
  };

  /**
   * Delete current antenna
   */
  public deleteAntenna = () => {
    this.antennaMarkers.clearLayers();
  };

  /**
   * Delete currently selected room
   */
  public deleteRoom = () => {
    this.roomLayers.clearLayers();
  };
}
