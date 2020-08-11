import * as React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Measure, { ContentRect } from "react-measure";
import { Button, WithStyles, withStyles } from '@material-ui/core';
import ZoomInIcon from "@material-ui/icons/Add";
import ZoomOutIcon from "@material-ui/icons/Remove";
import styles from "../../styles/components/generic/pan-zoom";

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
const PanZoom = withStyles(styles)(class PanZoom extends React.Component<Props, State> {

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
      <Measure onResize={ this.onContainerResize } bounds={ true }>
        {({ measureRef }) => (
          <div ref={ measureRef } style={{ width: "100%", height: "100%" }}>
            { this.renderWrapper() }
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

    if (!containerHeight || !containerWidth) {
      return null;
    }

    const options = {
      minScale: minScale || 1,
      limitToBounds: true,
      disabled: disabled
    };

    return (
      <TransformWrapper
        options={ options }
        defaultScale={ this.getDefaultScale() }
        defaultPositionX={ defaultPositionX }
        defaultPositionY={ defaultPositionY }
      >
        { (opts: any ) => this.renderContents(opts) }
      </TransformWrapper>
    );
  }

  /**
   * Renders contents
   *
   * @param opts transform wrapper options
   */
  private renderContents = (opts: any) => {
    const { classes } = this.props;

    return (
      <div style={{ position: "relative" }}>
        <div className={ classes.controlContainer }>
          <Button variant="contained" color="primary" onClick={ opts.zoomIn }><ZoomInIcon htmlColor="#f2f2f2" /></Button>
          <Button variant="contained" color="primary" onClick={ opts.zoomOut }><ZoomOutIcon htmlColor="#f2f2f2" /></Button>
          <Button variant="contained" color="primary" onClick={ opts.resetTransform }>100%</Button>
          <span> { (opts.scale || 0).toFixed(2) } </span>
        </div>
        <TransformComponent>
          <div style={{ width: this.state.containerWidth, height: this.state.containerHeight }}>
            { this.props.children }
          </div>
        </TransformComponent>
      </div>
    );
  }

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
      return Math.min(this.state.containerHeight / this.props.contentHeight, this.state.containerWidth / this.props.contentWidth);      
    }

    return undefined;
  }

  /**
   * Event handler for container resize
   *
   * @param contentRect content size details
   */
  private onContainerResize = (contentRect: ContentRect) => {
    this.setState({
      containerWidth: contentRect.bounds?.width || 0,
      containerHeight: contentRect.bounds?.height || 0
    });
  }

});

export default PanZoom;