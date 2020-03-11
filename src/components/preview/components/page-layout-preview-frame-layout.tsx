import * as React from "react";

import Measure, { ContentRect } from 'react-measure'
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-layout-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import PageLayoutPreviewComponentEditor from "./page-layout-preview-component";
import DisplayMetrics from "../display-metrics";
import AndroidUtils from "../android-utils";

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
 * Component for rendering FrameLayout views
 */
class PageLayoutPreviewFrameLayout extends React.Component<Props, State> {

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
            { this.renderChildren() }
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders layout child components
   */
  private renderChildren = () => {
    const result = (this.props.view.children || []).map((child: PageLayoutView, index: number) => {
      return <PageLayoutPreviewComponentEditor key={ `child-${index}` } 
        view={ child }
        displayMetrics={ this.props.displayMetrics } 
        scale={ this.props.scale }        
        handleLayoutProperties={ this.onHandleLayoutProperties }/>
    });

    return (
      <div>
        { result }
      </div>
    );
  }

  /**
   * Handles an unknown property logging
   * 
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: String) => {
    console.log(`PageLayoutPreviewFrameLayout: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Resolves component styles
   * 
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const properties = this.props.view.properties;
    const result: CSSProperties = this.props.handleLayoutProperties(properties, {
      position: "absolute"
    });

    properties.forEach(property => {
      if (property.name.startsWith("layout_")) {
        return;
      }

      switch (property.name) {
        case "background":
          result.backgroundColor = property.value;
        break;
        default:
          this.handleUnknownProperty(property, "unknown property");
        break;
      }
    });

    return result;
  }

  /**
   * Handles a child component layouting 
   * 
   * @param child child component properties
   * @param style child component styles
   * @return modified child component styles
   */
  private onHandleLayoutProperties = (properties: PageLayoutViewProperty[], styles: CSSProperties): CSSProperties => {
    const result: CSSProperties = { ...styles, 
      position: "absolute" 
    };

    properties
      .filter(property => property.name.startsWith("layout_"))
      .forEach(property => {
      switch (property.name) {
        case "layout_width":
          if ("match_parent" === property.value) {
            result.width = "100%";
          } else {
            const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
            if (px) {
              result.width = px
            } else {
              this.handleUnknownProperty(property, "Unknown value");
            }
          }
        break;
        case "layout_height":
          if ("match_parent" === property.value) {
            result.height = "100%";
          } else {
            const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
            if (px) {
              result.height = px
            } else {
              this.handleUnknownProperty(property, "Unknown value");
            }  
          }
        break;
        case "layout_marginTop":
        case "layout_marginRight":
        case "layout_marginBottom":
        case "layout_marginLeft":
          const marginPx = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
          if (marginPx) {
            switch (property.name) {
              case "layout_marginTop":
                result.marginTop = marginPx;
                break;
              case "layout_marginRight":
                result.marginRight = marginPx;
                break;
              case "layout_marginBottom":
                result.marginBottom = marginPx;
              break;
              case "layout_marginLeft":
                result.marginLeft = marginPx;
                break;
            }
          }
        break;
        case "layout_gravity":
          property.value.split("|").forEach((gravityValue) => {
            switch (gravityValue) {
              case "top":
                result.top = 0;
              break;
              case "bottom":
                result.bottom = 0;
              break;
              case "right":
                result.right = 0;
              break;
              case "left":
                result.left = 0;
              break;
            }
          });
        break;
        default:
          this.handleUnknownProperty(property, "Unknown layout property");
        break;
      }
    });

    return result;
  }
}

export default withStyles(styles)(PageLayoutPreviewFrameLayout);