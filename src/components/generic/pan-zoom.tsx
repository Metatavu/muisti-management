import * as React from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Measure, { ContentRect } from 'react-measure'

/**
 * Interface representing component properties
 */
interface Props {
  fitContent?: boolean;
  minScale?: number;
  defaultScale?: number;
  defaultPositionX?: number;
  defaultPositionY?: number; 
  contentWidth?: number;
  contentHeight?: number;
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
export default class PanZoom extends React.Component<Props, State> {

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
    if (!this.state.containerHeight || !this.state.containerWidth) {
      return null;
    }

    const options = {
      minScale: this.props.minScale || 1,
      limitToBounds: false
    };

    return (
      <TransformWrapper options={ options } defaultScale={ this.getDefaultScale() } defaultPositionX={ this.props.defaultPositionX } defaultPositionY={ this.props.defaultPositionY }>
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
    return (
      <div style={{ position: "relative" }}>
        <div style={{ position: "fixed", zIndex: 9999, bottom: 10, right: 10 }}>
          <button onClick={ opts.zoomIn }>+</button>
          <button onClick={ opts.zoomOut }>-</button>
          <button onClick={ opts.resetTransform }>x</button>
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

}