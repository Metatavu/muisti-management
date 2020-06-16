import * as React from "react";
import { Map as LeafletMap, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent, Layer, FeatureGroup } from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import Api from "../../api/api";
import { AccessToken } from "../../types";
import { ExhibitionRoom, Polygon as ApiPolygon, ExhibitionFloor, ExhibitionDeviceGroup, ExhibitionDevice } from "../../generated/client";
import { FeatureCollection, Polygon } from "geojson";
import PolygonDialog from "./polygon-dialog";
import strings from "../../localization/strings";

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
  onDeviceClick?: (floor: ExhibitionFloor, room: ExhibitionRoom, deviceGroup: ExhibitionDeviceGroup, device: ExhibitionDevice) => void;
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
  geoShapeMap: Map<number, ExhibitionRoom>;
  roomsToDelete: number[];
}

/**
 * Component for floor plan map
 */
export default class FloorPlanMap extends React.Component<Props, State> {

  // tslint:disable-next-line
  private mapInstance?: MapInstance;

  /**
   * This feature group contains all layers that are displayed
   */
  private layersToShow = new L.FeatureGroup();

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
      geoShapeMap: new Map(),
      roomsToDelete: [],
    };
  }

  /**
   * Component did mount handler
   */
  public componentDidMount = () => {
    this.loadGeoShapes();
  }

  /**
   * Component did update handler
   */
  public componentDidUpdate = (prevProps: Props) => {

    if (prevProps.selectedFloor !== this.props.selectedFloor || prevProps.selectedRoom !== this.props.selectedRoom) {
      this.loadGeoShapes();
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
    this.mapInstance = mapRef ? mapRef.leafletElement : undefined;

    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.addLayer(this.layersToShow);

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

    this.layersToShow.on('click', event => {
      this.setSelectedRoom(event);
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
      const layer = event.layer;
      this.addedLayers.addLayer(layer);
      this.setState({
        polygonCreated: true,
        layer: layer
      });
    });
  }

  /**
   * Get leaflet controls
   */
  private getControls() {
    const { readOnly, selectedRoom } = this.props;
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

    if (!selectedRoom) {
      return new L.Control.Draw({
        position: 'topleft',
        draw: {
          circle: false,
          circlemarker: false,
          polyline: false,
        }
      });
    }
    return new L.Control.Draw({
      position: 'topleft',
      draw: {
        circle: false,
        circlemarker: false,
        polyline: false,
      },
      edit: {
        featureGroup: this.layersToShow,
        remove: false
      },
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
      const layerId = this.layersToShow.getLayerId(event.layer);
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

  private setSelectedRoom = (event: L.LeafletEvent) => {
    const { onRoomClick, selectedFloor, selectedItemHasNodes } = this.props;
    const { geoShapeMap } = this.state;
    const foundRoom = geoShapeMap.get(event.layer._leaflet_id);

    if (!onRoomClick || !selectedFloor || !foundRoom || !selectedItemHasNodes) {
      return;
    }
    onRoomClick(selectedFloor, foundRoom, selectedItemHasNodes);
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
    this.layersToShow.addLayer(layer);
  }


  /**
   * Delete n amount of rooms from API
   * TODO: Add confirmation dialog
   */
  private onEditPolygons = (event: L.LeafletEvent) => {
    const { exhibitionId, accessToken, selectedRoom } = this.props;

    if ( !exhibitionId || !selectedRoom || !accessToken) {
      return;
    }

    /**
     * Must cast is it like this because L.LeafletEvent does not contain
     * layers object but that is used during runtime.
     */
    const leafletEvent = event as any;
    const leafletFeatureGroup = leafletEvent.layers as FeatureGroup;

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

  }

  /**
   * Delete n amount of rooms from API
   * TODO: Add confirmation dialog
   */
  private onDeletePolygons = () => {
    const { accessToken, exhibitionId } = this.props;
    const { geoShapeMap, roomsToDelete } = this.state;
    if (!accessToken || !exhibitionId || !roomsToDelete) {
      return;
    }
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const tempMap = geoShapeMap;
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
      geoShapeMap: tempMap
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

  /**
   * Load geo shape data from API
   */
  private loadGeoShapes = async () => {
    const { accessToken, exhibitionId, selectedFloor, selectedRoom } = this.props;
    const { mapInstance } = this;
    if (!accessToken || !exhibitionId || !selectedFloor || !selectedFloor.id) {
      return;
    }

    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    let foundRooms = [];

    if (selectedRoom && selectedRoom.id) {
      const foundRoom = await roomsApi.findExhibitionRoom({
        exhibitionId: exhibitionId,
        roomId: selectedRoom.id
      });
      foundRooms.push(foundRoom);
    } else {
      foundRooms = await roomsApi.listExhibitionRooms({
        exhibitionId: exhibitionId,
        floorId: selectedFloor.id
      });
    }

    this.layersToShow.clearLayers();
    this.addLayers(foundRooms);
    mapInstance?.removeControl(this.currentControls);
    this.currentControls = this.getControls();
    mapInstance?.addControl(this.currentControls);
  }

  /**
   * Add layers to leaflet map
   *
   * @param rooms list of exhibition rooms
   */
  private addLayers = (rooms: ExhibitionRoom[]) => {

    if (!rooms) {
      return;
    }
    const tempMap = new Map<number, ExhibitionRoom>();
    rooms.forEach(room => {
      const geoShape = room.geoShape;
      if (geoShape && this.mapInstance && this.layersToShow) {
        const geoJson = geoShape as Polygon;
        try {
          const geoShapesToAdd: Layer[] = [];
          L.geoJSON(geoJson, {
            onEachFeature(_feature, layer) {
              geoShapesToAdd.push(layer);
            }
          });

          this.addLayersToMap(geoShapesToAdd, room, tempMap);
        } catch (error) {
          console.log(error);
        }
      }
    });

    this.setState({
      geoShapeMap : tempMap
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
   * Adds all geo shapes found from api to leaflet map
   *
   * @param geoShapesToAdd list of geo shapes
   * @param room room
   * @param tempMap temp maps
   */
  private addLayersToMap(geoShapesToAdd: Layer[], room: ExhibitionRoom, tempMap: Map<number, ExhibitionRoom>) {
    geoShapesToAdd.forEach(shape => {
      if (room.id) {
        this.layersToShow.addLayer(shape);
        const layerId = this.layersToShow.getLayerId(shape);
        tempMap.set(layerId, room);
      }
    });
    this.mapInstance?.fitBounds(this.layersToShow.getBounds());
  }
}