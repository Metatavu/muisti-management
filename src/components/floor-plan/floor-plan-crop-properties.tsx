import * as React from "react";

import strings from "../../localization/strings";
import { TextField } from "@material-ui/core";

/**
 * Component props
 */
interface Props {
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * Component state
 */
interface State {
  physicalWidth: string;
  physicalHeight: string;
}

/**
 * Component for exhibition view
 */
export default class FloorPlanCropProperties extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      physicalWidth: "0",
      physicalHeight: "0"
    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <div>
        <TextField fullWidth disabled type="number" label={ strings.floorPlan.properties.imageWidth } value={ Math.round(this.props.imageWidth || 0) } />        
        <TextField fullWidth disabled type="number" label={ strings.floorPlan.properties.imageHeight } value={ Math.round(this.props.imageHeight || 0) } />
        <TextField fullWidth type="number" label={ strings.floorPlan.properties.physicalWidth } value={ this.state.physicalWidth } onChange={ this.onPhysicalWidthChange } />
        <TextField fullWidth type="number" label={ strings.floorPlan.properties.physicalHeight } value={ this.state.physicalHeight } onChange={ this.onPhysicalHeightChange } />
      </div>
    );
  }

  /**
   * Event handler for width changes
   * 
   * @param event event
   */
  private onPhysicalWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value: string = target.value;
    this.setState({
      physicalWidth: value
    });
  }


  /**
   * Event handler for width changes
   * 
   * @param event event
   */
  private onPhysicalHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value: string = target.value;
    this.setState({
      physicalHeight: value
    });
  }
}