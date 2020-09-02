import * as React from "react";

import Measure, { ContentRect } from 'react-measure'
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import PagePreviewComponentEditor from "./page-preview-component";
import DisplayMetrics from "../../../types/display-metrics";
import { ResourceMap } from "../../../types";
import PagePreviewUtils from "./page-preview-utils";

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
 * Component for rendering FrameLayout views
 */
class PagePreviewFrameLayout extends React.Component<Props, State> {

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
    return (
      <Measure onResize={ this.props.onResize } bounds={ true }>
        {({ measureRef }) => (
          <div ref={ measureRef } style={ this.resolveStyles() }>
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
      return <PagePreviewComponentEditor key={ `child-${index}` } 
        view={ child }
        resourceMap={ this.props.resourceMap }
        displayMetrics={ this.props.displayMetrics } 
        scale={ this.props.scale }        
        handleLayoutProperties={ this.onHandleLayoutProperties }/>
    });

    return (
      <>
        { result }
      </>
    );
  }

  /**
   * Handles an unknown property logging
   * 
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewFrameLayout: don't know how to handle layout property because ${reason}`, property.name, property.value);
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
    result.boxSizing = "border-box"

    return result;
  }

  /**
   * Handles a child component layouting 
   * 
   * @param childProperties child component properties
   * @param childStyles child component styles
   * @return modified child component styles
   */
  private onHandleLayoutProperties = (childProperties: PageLayoutViewProperty[], childStyles: CSSProperties): CSSProperties => {
    const result: CSSProperties = { ...childStyles,
      position: "absolute",
      overflow: "hidden"
    };

    PagePreviewUtils.withDefaultLayoutProperties(childProperties)
      .filter(property => property.name.startsWith("layout_"))
      .forEach(property => {
        switch (property.name) {
          case "layout_width":
            const width = PagePreviewUtils.getLayoutChildWidth(this.props.displayMetrics, property, this.props.scale);
            if (width) {
              result.width = width;
            }
          break;
          case "layout_height":
            const height = PagePreviewUtils.getLayoutChildHeight(this.props.displayMetrics, property, this.props.scale);
            if (height) {
              result.height = height;
            }
          break;
          case "layout_marginTop":
          case "layout_marginRight":
          case "layout_marginBottom":
          case "layout_marginLeft":
            const margin = PagePreviewUtils.getLayoutChildMargin(this.props.displayMetrics, property, this.props.scale);
            if (margin) {
              result[property.name.substring(7)] = margin;
            }
          break;
          case "layout_gravity":
            property.value.split("|").forEach(gravityValue => {
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
                default:
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

export default withStyles(styles)(PagePreviewFrameLayout);