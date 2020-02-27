import * as React from "react";

import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../styles/floor-plan";
import { Map, ImageOverlay } from 'react-leaflet';
import { CRS, LatLng } from "leaflet";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
}

/**
 * Interface representing component state
 */
interface State {
  lat: number,
  lng: number,
  loading: boolean,
  zoom: number
}

/**
 * Component for editor view
 */
class FloorPlan extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      lat: 51.505,
      lng: -0.09,
      zoom: 13,
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = () => {

  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes } = this.props;
    const position:LatLng = new LatLng(this.state.lat, this.state.lng);
    
    return (
      <div  className={ classes.root }>
        <Map
          style={{ height: 500, width: 500 }}
          crs={ CRS.Simple }
          zoom={this.state.zoom} 
          minZoom={ -5 }
          doubleClickZoom={ false }
        >
          <ImageOverlay url="https://staging-muisti-cdn.metatavu.io/testdata/test-pohjapiirros.jpg" />
        </Map>
      </div>
    );
  }
}

export default withStyles(styles)(FloorPlan);