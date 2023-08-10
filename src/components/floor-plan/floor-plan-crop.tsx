import PanZoom from "../generic/pan-zoom";
import * as cropperjs from "cropperjs";
import "cropperjs/dist/cropper.css";
import * as React from "react";
import Cropper, { ReactCropperElement } from "react-cropper";

/**
 * Component props
 */
interface Props {
  imageDataUrl: string;
  imageWidth: number;
  imageHeight: number;
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
  private cropperRef = React.createRef<ReactCropperElement>();

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
    const { imageWidth, imageHeight } = this.props;

    return (
      <div style={{ width: "100%" }}>
        <PanZoom
          minScale={0.1}
          fitContent={true}
          contentWidth={imageWidth}
          contentHeight={imageHeight}
        >
          <Cropper
            ref={this.cropperRef}
            src={this.props.imageDataUrl}
            style={{ height: imageHeight, width: imageWidth }}
            crop={this.onCrop}
            cropend={this.onCropEnd}
            zoomable={false}
          />
        </PanZoom>
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
  };

  /**
   * Event handler for crop component crop end
   */
  private onCropEnd = () => {
    const cropper = this.cropperRef.current?.cropper;
    if (cropper) {
      cropper.getCroppedCanvas().toBlob(
        (data: Blob | null) => {
          if (data) {
            this.props.onDataUpdate(data);
          }
        },
        "image/png",
        1
      );
    }
  };
}
