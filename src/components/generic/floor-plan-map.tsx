import * as React from "react";
import { Map, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent } from "leaflet";
import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import "leaflet-draw"
import "leaflet-draw/dist/leaflet.draw.css"
import Api from "../../api/api";
import { AccessToken } from "../../types";
import { ExhibitionRoom, Polygon } from "../../generated/client";
import { GeometryCollection, FeatureCollection, Geometry, Feature, MultiPoint } from "geojson";

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
}

/**
 * Component for floor plan map
 */
export default class FloorPlanMap extends React.Component<Props, State> {

  // tslint:disable-next-line
  private mapInstance?: MapInstance;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      zoom: 2
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    return (
      <Map ref={ this.setMapRef } 
        crs={ CRS.Simple } 
        center={ [0, 0] } 
        bounds={ this.props.bounds }
        minZoom={ this.props.minZoom }
        maxZoom={ this.props.maxZoom }
        zoom={ this.state.zoom } 
        style={{ width: "100%", height: "100%" }}
        onmousemove={ this.onMapMouseMove }>
          { this.renderMapChildren() }
      </Map>
    )
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
   * Updates Leaflet instance 
   */
  private setMapRef = (mapRef: any) => {
    this.mapInstance = mapRef ? mapRef.leafletElement : undefined;

    if (!this.mapInstance) {
      return;
    }
    const featureGroup = new L.FeatureGroup();
    this.mapInstance.addLayer(featureGroup);
    const polygonOption: L.DrawOptions.PolygonOptions = {}
    const controls = new L.Control.Draw({
      position: 'topleft',
      draw: {
        polygon: polygonOption
      },
      edit: {
        featureGroup: featureGroup,
      },
    });
    this.mapInstance.addControl(controls)
    this.mapInstance.on(L.Draw.Event.CREATED, event => {
      const layer = event.layer;
      featureGroup.addLayer(layer);
      this.saveGeoJson(featureGroup)
    })
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

  private saveGeoJson = async (geoShape: L.FeatureGroup<any>) => {
    const { accessToken, exhibitionId, exhibitionFloorId } = this.props;
    console.log(accessToken, exhibitionId, exhibitionFloorId)
    if (!accessToken || !exhibitionId || !exhibitionFloorId) {
      return;
    }

    const test = geoShape.toGeoJSON() as FeatureCollection;
    const roomPolygon = test.features[0].geometry as Polygon;
    const roomsApi = Api.getExhibitionRoomsApi(accessToken)
    const exhibitionRoomToCreate: ExhibitionRoom = {
      floorId: exhibitionFloorId,
      name: "Huone 1",
      geoShape: roomPolygon
    }
    console.log(exhibitionRoomToCreate)
    const newRoom = await roomsApi.createExhibitionRoom({
      exhibitionId: exhibitionId,
      exhibitionRoom: exhibitionRoomToCreate
    })

    console.log(newRoom);

  }

};