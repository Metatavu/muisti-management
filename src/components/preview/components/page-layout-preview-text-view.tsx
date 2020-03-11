import * as React from "react";

import Measure, { ContentRect } from 'react-measure'
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-layout-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../display-metrics";
import AndroidUtils from "../android-utils";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  scale: number,
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
 * Component for TextView component preview
 */
class PageLayoutPreviewTextView extends React.Component<Props, State> {

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
   * Render basic layout
   */
  public render() {
    const { classes } = this.props;
    
    return (
      <Measure onResize={ this.props.onResize } bounds={ true }>
        {({ measureRef }) => (
          <div ref={ measureRef } className={ classes.root } style={ this.resolveStyles() }>
            { this.getText() }      
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
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: String) => {
    console.log(`PageLayoutPreviewTextView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Returns text from view properties
   * 
   * @return text from view properties
   */
  private getText = () => {
    const textProperty = this.props.view.properties.find(property => property.name === "text");
    return textProperty?.value;
  }

  /**
   * Resolves component styles
   * 
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const properties = this.props.view.properties;
    const result: CSSProperties = this.props.handleLayoutProperties(properties, {
      display: "inline-block"
    });

    properties.forEach(property => {
      if (property.name === "text" || property.name.startsWith("layout_") || property.name.startsWith("inset")) {
        return;
      }

      switch (property.name) {
        case "textSize":
          const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
          if (px) {
            result.fontSize = px
          } else {
            console.log("TextView: unknown layout_height", property.value);
          }
        break;
        case "textAlignment":
          switch (property.value) {
            case "center": 
              result.textAlign = property.value;
            break;
          }
        break;
        default:
          this.handleUnknownProperty(property, "Unknown property");
        break; 
      }
    });

    return result;
  }
}

export default withStyles(styles)(PageLayoutPreviewTextView);