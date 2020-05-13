import * as React from "react";
import { Map as LeafletMap, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent, Layer } from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";
import Api from "../../api/api";
import { AccessToken } from "../../types";
import { ExhibitionRoom, Polygon as ApiPolygon } from "../../generated/client";
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
  exhibitionId?: string;
  exhibitionFloorId? : string;
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
  geoShapeMap: Map<number, string>;
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
   * inidividual feature group objects can be cast to polygon objects
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
   * Component render method
   */
  public render = () => {
    return (<>
      <LeafletMap ref={ this.setMapRef } 
        crs={ CRS.Simple } 
        center={ [0, 0] } 
        bounds={ this.props.bounds }
        minZoom={ this.props.minZoom }
        maxZoom={ this.props.maxZoom }
        zoom={ this.state.zoom } 
        style={{ width: "100%", height: "100%" }}
        onmousemove={ this.onMapMouseMove }>
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
   */
  private setMapRef = (mapRef: any) => {
    this.mapInstance = mapRef ? mapRef.leafletElement : undefined;

    if (!this.mapInstance) {
      return;
    }
    this.mapInstance.addLayer(this.layersToShow);
    const polygonOption: L.DrawOptions.PolygonOptions = {};
    const controls = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: polygonOption
      },
      edit: {
        featureGroup: this.layersToShow,
      },
    });
    this.mapInstance.addControl(controls);
    this.addDrawHandler();
    this.addOnLayerRemovedHandler();
    this.mapInstance.on(L.Draw.Event.DELETED, _event => {
      this.onDeletePolygons()
    });
  }

  /**
   * Event handler for mouse moving over the map
   * 
   * @param event event
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

  /**
   * Save polygon to API handler
   */
  private savePolygon = async () => {
    const { accessToken, exhibitionId, exhibitionFloorId } = this.props;
    const { roomName, layer } = this.state;
    if (!accessToken || !exhibitionId || !exhibitionFloorId || !roomName || !layer) {
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
      floorId: exhibitionFloorId,
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
   * TODO: Add confimation dialog
   */
  private onDeletePolygons = () => {
    const { accessToken, exhibitionId, exhibitionFloorId } = this.props;
    const { geoShapeMap, roomsToDelete } = this.state;
    if (!accessToken || !exhibitionId || !exhibitionFloorId || !roomsToDelete) {
      return;
    }
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const tempMap = geoShapeMap;
    roomsToDelete.map(async room => {
      const roomToDelete = tempMap.get(room);
      if (roomToDelete) {
        await roomsApi.deleteExhibitionRoom({
          exhibitionId: exhibitionId,
          roomId: roomToDelete
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
    const { accessToken, exhibitionId, exhibitionFloorId } = this.props;
    if (!accessToken || !exhibitionId || !exhibitionFloorId) {
      return;
    }
    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const foundRooms = await roomsApi.listExhibitionRooms({
      exhibitionId: exhibitionId,
      floorId: exhibitionFloorId
    });

    this.addLayers(foundRooms);
  }

  /**
   * Add layers to leaflet map
   * @param rooms list of exhibition rooms
   */
  private addLayers = (rooms: ExhibitionRoom[]) => {

    if (!rooms) {
      return;
    }
    const tempMap = new Map<number, string>();
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

  

  /**
   * Adds all geo shapes found from api to leaflet map
   * @param geoShapesToAdd list of geo shapes
   * @param room 
   * @param tempMap 
   */
  private addLayersToMap(geoShapesToAdd: Layer[], room: ExhibitionRoom, tempMap: Map<number, string>) {
    geoShapesToAdd.forEach(shape => {
      if (room.id) {
        this.layersToShow.addLayer(shape);
        const layerId = this.layersToShow.getLayerId(shape);
        tempMap.set(layerId, room.id);
      }
    });
  }
};
