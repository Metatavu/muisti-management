import styles from "../../styles/components/generic/pan-zoom";
import ZoomInIcon from "@mui/icons-material/Add";
import ZoomOutIcon from "@mui/icons-material/Remove";
import { Button } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import Measure, { ContentRect } from "react-measure";
import {
  ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper
} from "react-zoom-pan-pinch";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  fitContent?: boolean;
  minScale?: number;
  defaultScale?: number;
  defaultPositionX?: number;
  defaultPositionY?: number;
  contentWidth?: number;
  contentHeight?: number;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Interface representing component state
 */
interface State {
  containerWidth: number;
  containerHeight: number;
  scale: number;
}

/**
 * Component for adding pan and zoom functionalities
 */
const PanZoom = withStyles(styles)(
  class PanZoom extends React.Component<Props, State> {
    /**
     * Constructor
     *
     * @param props component properties
     */
    constructor(props: Props) {
      super(props);
      this.state = {
        containerWidth: 0,
        containerHeight: 0,
        scale: 1
      };
    }

    /**
     * Render component
     */
    public render() {
      return (
        <Measure onResize={this.onContainerResize} bounds={true}>
          {({ measureRef }) => (
            <div ref={measureRef} style={{ width: "100%", height: "100%" }}>
              {this.renderWrapper()}
            </div>
          )}
        </Measure>
      );
    }

    /**
     * Renders wrapper component
     */
    private renderWrapper = () => {
      const { containerHeight, containerWidth } = this.state;
      const { defaultPositionX, defaultPositionY, minScale, disabled } = this.props;

      if (!containerHeight || !containerWidth) {
        return null;
      }

      return (
        <TransformWrapper
          minScale={minScale || 1}
          limitToBounds={false}
          disabled={disabled}
          initialScale={this.getDefaultScale()}
          initialPositionX={defaultPositionX}
          initialPositionY={defaultPositionY}
          onTransformed={({ state: { scale } }) => this.setState({ ...this.state, scale: scale })}
        >
          {(opts: ReactZoomPanPinchContentRef) => this.renderContents(opts)}
        </TransformWrapper>
      );
    };

    /**
     * Renders contents
     *
     * @param opts transform wrapper options
     */
    private renderContents = (opts: ReactZoomPanPinchContentRef) => {
      const { classes, children } = this.props;
      const { containerWidth, containerHeight, scale } = this.state;

      return (
        <div className={classes.root}>
          <div className={classes.controlContainer}>
            <Button variant="contained" color="primary" onClick={() => opts.zoomIn()}>
              <ZoomInIcon htmlColor="#f2f2f2" />
            </Button>
            <Button variant="contained" color="primary" onClick={() => opts.zoomOut()}>
              <ZoomOutIcon htmlColor="#f2f2f2" />
            </Button>
            <Button variant="contained" color="primary" onClick={() => opts.resetTransform()}>
              100%
            </Button>
            <span>{this.getScalePercentage(scale)}</span>
          </div>
          <TransformComponent>
            <div
              className={classes.contentContainer}
              style={{ width: containerWidth, height: containerHeight }}
            >
              {children}
            </div>
          </TransformComponent>
        </div>
      );
    };

    /**
     * Returns default scale
     *
     * @returns default scale
     */
    private getDefaultScale = () => {
      if (this.props.defaultScale) {
        return this.props.defaultScale;
      }

      if (this.props.fitContent && this.props.contentHeight && this.props.contentWidth) {
        return Math.min(
          this.state.containerHeight / this.props.contentHeight,
          this.state.containerWidth / this.props.contentWidth
        );
      }

      return undefined;
    };

    /**
     * Returns scale as percentage
     *
     * @param scale scale
     * @returns scale as percentage string
     */
    private getScalePercentage = (scale: any) => {
      const scaleNumber = !isNaN(Number(scale)) ? Number(scale) : 0;
      return `${(scaleNumber * 100).toFixed(2)} %`;
    };

    /**
     * Event handler for container resize
     *
     * @param contentRect content size details
     */
    private onContainerResize = (contentRect: ContentRect) => {
      this.setState({
        containerWidth: contentRect.bounds?.width || 0,
        containerHeight: contentRect.bounds?.height || 0
      });
    };
  }
);

export default PanZoom;
