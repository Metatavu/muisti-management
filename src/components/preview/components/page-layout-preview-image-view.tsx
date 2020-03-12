import * as React from "react";

import Measure, { ContentRect } from 'react-measure'
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-layout-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../display-metrics";
import ImageIcon from '@material-ui/icons/Image';

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
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
class PageLayoutPreviewImageView extends React.Component<Props, State> {

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
    const { classes } = this.props;
    
    return (
      <Measure onResize={ this.props.onResize } bounds={ true }>
        {({ measureRef }) => (
          <div ref={ measureRef } className={ classes.root } style={ this.resolveStyles() }>
            <ImageIcon style={ this.resolveImageViewStyles() }/>
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Handles an unknown property logging
   * 
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    console.log(`PageLayoutPreviewImageView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Resolves image styles
   * 
   * @returns image styles
   */
  private resolveImageViewStyles = (): CSSProperties => {
    const result: CSSProperties = {
      width: "100%",
      height: "100%",
      background: "#fff",
      color: "rgb(188, 190, 192)"
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

export default withStyles(styles)(PageLayoutPreviewImageView);