import * as React from "react";

import Measure, { ContentRect } from 'react-measure';
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../../../types/display-metrics";
import VideoIcon from '@material-ui/icons/OndemandVideo';
import { ResourceMap } from "../../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  selectedView?: PageLayoutView;
  layer: number;
  resourceMap: ResourceMap;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (properties: PageLayoutViewProperty[], styles: CSSProperties) => CSSProperties;
  onViewClick?: (view: PageLayoutView) => void;
}

/**
 * Interface representing component state
 */
interface State {
  mouseOver: boolean;
}

/**
 * Component for rendering Video views
 */
class PagePreviewVideoView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      mouseOver: false
    };
  }

  /**
   * Render
   */
  public render() {
    const { classes, view, selectedView, onResize } = this.props;
    const { mouseOver } = this.state;
    const selected = selectedView?.id === view.id;

    return (
      <Measure onResize={ onResize } bounds={ true }>
        {({ measureRef }) => (
          <div
            ref={ measureRef }
            style={ this.resolveStyles() }
            className={ mouseOver || selected ? classes.highlighted : "" }
            onClick={ this.onClick }
            onMouseOver={ this.onMouseOver }
            onMouseOut={ this.onMouseOut }
          >
            { this.renderVideo() }
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders preview video
   */
  private renderVideo = () => {
    const src = this.getVideoSrc();
    const videoStyles = this.resolveVideoViewStyles();

    if (src) {
      return (
        <video key={ src } style={ videoStyles } autoPlay={ true } controls={ true }>
          <source src={ src } />
        </video>
      );
    } else {
      return <VideoIcon style={ videoStyles }/>
    }
  }

  /**
   * Returns video src from resources or null if not found
   *
   * @returns video src from resources or null if not found
   */
  private getVideoSrc = () => {
    const srcProperty = this.props.view.properties.find(property => property.name === "src");

    const id = srcProperty?.value;
    if (id && id.startsWith("@resources/")) {
      const resource = this.props.resourceMap[id.substring(11)];
      if (resource) {
        return resource.data;
      }
    }

    return null;
  }

  /**
   * Handles an unknown property logging
   *
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewVideoView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Resolves video styles
   *
   * @returns video styles
   */
  private resolveVideoViewStyles = (): CSSProperties => {
    const result: CSSProperties = {
      width: "100%",
      height: "100%"
    };

    return result;
  }

  /**
   * Resolves component styles
   *
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, layer, handleLayoutProperties } = this.props;
    const properties = view.properties;
    const result: CSSProperties = handleLayoutProperties(properties, {
      zIndex: layer
    });

    properties.forEach(property => {
      if (property.name === "text" || property.name.startsWith("layout_")) {
        return;
      }

      switch (property.name) {
        default:
          this.handleUnknownProperty(property, "Unknown property");
        break;
      }
    });

    return result;
  }

  /**
   * Event handler for mouse over
   * 
   * @param event react mouse event
   */
  private onMouseOver = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState({ mouseOver: true });
  }

  /**
   * Event handler for mouse out
   * 
   * @param event react mouse event
   */
  private onMouseOut = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState({ mouseOver: false });
  }

  /**
   * Event handler for on click
   */
  private onClick = (event: React.MouseEvent) => {
    const { view, onViewClick } = this.props;
    event.stopPropagation();
    onViewClick && onViewClick(view);
  }
}

export default withStyles(styles)(PagePreviewVideoView);