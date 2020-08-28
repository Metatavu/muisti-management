import * as React from "react";

import Measure, { ContentRect } from 'react-measure';
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../../../types/display-metrics";
import ImageIcon from '@material-ui/icons/Image';
import { ResourceMap } from "../../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  resourceMap: ResourceMap;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (properties: PageLayoutViewProperty[], styles: CSSProperties) => CSSProperties;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for rendering Image views
 */
class PagePreviewImageView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Render
   */
  public render() {
    return (
      <Measure onResize={ this.props.onResize } bounds={ true }>
        {({ measureRef }) => (
          <div ref={ measureRef } style={ this.resolveStyles() }>
            { this.renderImage() }
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders preview image
   */
  private renderImage = () => {
    const src = this.getImageSrc();
    const imageStyles = this.resolveImageViewStyles();

    if (src) {
      return (
        <div style={{ ...imageStyles, textAlign: "center" }}>
          <img key={ src } alt="preview" src={ src } style={{ maxWidth: "100%", maxHeight: "100%" }}/>
        </div>
      );
    } else {
      return (
        <ImageIcon style={{ ...imageStyles, background: "#fff", color: "rgb(188, 190, 192)" }}/>
      );
    }
  }

  /**
   * Returns image src from resources or null if not found
   *
   * @returns image src from resources or null if not found
   */
  private getImageSrc = () => {
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
    // console.log(`PagePreviewImageView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Resolves image styles
   * 
   * @returns image styles
   */
  private resolveImageViewStyles = (): CSSProperties => {
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
    const properties = this.props.view.properties;
    const result: CSSProperties = this.props.handleLayoutProperties(properties, {

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
}

export default withStyles(styles)(PagePreviewImageView);