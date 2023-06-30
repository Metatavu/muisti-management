import strings from "../../localization/strings";
import { TextField } from "@mui/material";
import { CSSProperties } from "@mui/material/styles";
import * as React from "react";

/**
 * Component props
 */
interface Props {
  imageWidth?: number;
  imageHeight?: number;
  naturalWidth?: number;
  naturalHeight?: number;
  onCropPropertyChange: (key: string, value: number) => void;
}

/**
 * Component state
 */
interface State {
  physicalWidth: number;
  physicalHeight: number;
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
      physicalWidth: 0.0,
      physicalHeight: 0.0
    };
  }

  /**
   * Component did mount handler
   */
  public componentDidMount = () => {
    this.updateMeasurements();
  };

  /**
   * Component did update handler
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (prevProps !== this.props) {
      this.updateMeasurements();
    }
  };

  /**
   * Update measurements
   */
  private updateMeasurements() {
    const { naturalWidth, naturalHeight } = this.props;
    let physicalWidth = 0.0;
    let physicalHeight = 0.0;
    if (naturalWidth) {
      physicalWidth = naturalWidth;
    }
    if (naturalHeight) {
      physicalHeight = naturalHeight;
    }
    this.setState({
      physicalHeight,
      physicalWidth
    });
  }

  /**
   * Component render method
   */
  public render() {
    const textFieldStyle: CSSProperties = { marginBottom: 20 };

    return (
      <div>
        <TextField
          fullWidth
          disabled
          type="number"
          style={textFieldStyle}
          label={strings.floorPlan.properties.imageWidth}
          value={Math.round(this.props.imageWidth || 0)}
        />
        <TextField
          fullWidth
          disabled
          type="number"
          style={textFieldStyle}
          label={strings.floorPlan.properties.imageHeight}
          value={Math.round(this.props.imageHeight || 0)}
        />
        <TextField
          fullWidth
          type="number"
          style={textFieldStyle}
          label={strings.floorPlan.properties.physicalWidth}
          value={this.state.physicalWidth}
          onChange={this.onPhysicalWidthChange}
        />
        <TextField
          fullWidth
          type="number"
          label={strings.floorPlan.properties.physicalHeight}
          value={this.state.physicalHeight}
          onChange={this.onPhysicalHeightChange}
        />
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
    const value = Number(target.value);
    this.props.onCropPropertyChange("naturalWidth", value);
  };

  /**
   * Event handler for height changes
   *
   * @param event event
   */
  private onPhysicalHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value = Number(target.value);
    this.props.onCropPropertyChange("naturalHeight", value);
  };
}
