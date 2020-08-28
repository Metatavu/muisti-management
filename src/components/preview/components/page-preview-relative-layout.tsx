import * as React from "react";

import Measure, { ContentRect, BoundingRect } from 'react-measure'
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

type ChildBounds = { [id: string]: BoundingRect }

/**
 * Interface representing component state
 */
interface State {
  rootBounds?: BoundingRect;
  childBounds: ChildBounds;
}

/**
 * Component for rendering RelativeLayout views
 */
class PagePreviewRelativeLayout extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      childBounds: {}
    };
  }

  /**
   * Render
   */
  public render() {
    const { classes } = this.props;

    return (
      <Measure onResize={ this.onRootResize } bounds={ true }>
        {({ measureRef }) => (
          <div ref={ measureRef } className={ classes.relativeLayout } style={ this.resolveStyles() }>
            { this.renderChildren() }
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders child component
   */
  private renderChildren = () => {
    const result = (this.props.view.children || []).map((child: PageLayoutView, index: number) => {
      return (
        <PagePreviewComponentEditor key={ `child-${index}` } 
          view={ child }
          resourceMap={ this.props.resourceMap }
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale }
          style={ this.resolveChildStyles(child) }
          handleLayoutProperties={ this.onHandleLayoutProperties }
          onResize={ (contentRect: ContentRect) => this.onChildResize(child.id, contentRect) }
          />
      );      
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
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewRelativeLayout: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Resolves child component styles
   * 
   * @param child child
   * @return child component styles
   */
  private resolveChildStyles = (child: PageLayoutView): CSSProperties  => {
    const rightOfChildId = child.properties
      .find(item => item.name === "layout_toRightOf")
      ?.value;
    
    const result: CSSProperties = {
      "position": "absolute"
    };
    
    if (rightOfChildId) {
      const rightOfBounds = this.state.childBounds[rightOfChildId];
      if (rightOfBounds) {
        result.left = rightOfBounds.right - (this.state.rootBounds?.left || 0);
      }
    }


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
   * Updates child bounds into state
   *
   * @param id child id
   * @param bounds child bounds
   */
  private updateChildBounds = (id: string, bounds: BoundingRect) => {
    const childBounds = { ...this.state.childBounds };
    childBounds[id] = bounds;

    this.setState({
      childBounds: childBounds
    });
  }

  /**
   * Event handler for root component resize
   *
   * @param contentRect root content rect
   */
  private onRootResize = (contentRect: ContentRect) => {
    this.setState({
      rootBounds: contentRect.bounds
    });

    if (this.props.onResize) {
      this.props.onResize(contentRect);
    }
  }

  /**
   * Event handler for child resize event
   *
   * @param id child id
   * @param contentRect child content rect
   */
  private onChildResize = (id: string, contentRect: ContentRect) => {
    if (id && contentRect.bounds) {
      this.updateChildBounds(id, contentRect.bounds);
    }
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
      position: "absolute" 
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
          default:
            this.handleUnknownProperty(property, "Unknown layout property");
          break;
        }
      });

    return result;
  }
}

export default withStyles(styles)(PagePreviewRelativeLayout);