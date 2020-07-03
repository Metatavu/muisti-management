import * as React from "react";

import Cropper from 'react-cropper';
import * as cropperjs from 'cropperjs';
import 'cropperjs/dist/cropper.css';

/**
 * Component props
 */
interface Props {
  imageDataUrl: string;
  onDetailsUpdate: (details: cropperjs.default.ImageData) => void;
  onDataUpdate: (data: Blob) => void;
}

/**
 * Component state
 */
interface State {
  width: string;
  height: string;
}

/**
 * Component for floor plan crop
 */
export default class FloorPlanCrop extends React.Component<Props, State> {

  private cropperRef = React.createRef<Cropper>();

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      height: "0",
      width: "0"
    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <div style={{ width: "100%" }}>
        <Cropper
          ref={ this.cropperRef }
          src={ this.props.imageDataUrl }
          style={{height: "100%", width: 'calc(100% - 320px)'}}
          crop={ this.onCrop }
          cropend={ this.onCropEnd }
        />
      </div>
    );
  }

  /**
   * Event handler for crop component crop update
   * 
   * @param event event
   */
  private onCrop = (event: CustomEvent<any>) => {
    this.props.onDetailsUpdate(event.detail);
  }

  /**
   * Event handler for crop component crop end
   */
  private onCropEnd = () => {
    const cropper = this.cropperRef.current;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob((data: Blob | null) => {
        if (data) {
          this.props.onDataUpdate(data);
        }
      }, "image/png", 1);
    }
  }

}