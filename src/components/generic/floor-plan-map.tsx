import * as React from "react";
import { Map, ImageOverlay, ScaleControl } from "react-leaflet";
import { Map as MapInstance, LatLngBounds, CRS, LatLng, LeafletMouseEvent } from "leaflet";
import 'leaflet/dist/leaflet.css';

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

};