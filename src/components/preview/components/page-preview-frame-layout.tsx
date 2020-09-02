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
import AndroidUtils from "../../../utils/android-utils";

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
          <div ref={ measureRef } style={ this.resolveContainerStyles() }>
            <div style={ this.resolveStyles() }>
              { this.renderChildren() }
            </div>
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders layout child components
   */
  private renderChildren = () => {
    const { displayMetrics, scale } = this.props;
    const result = (this.props.view.children || []).map((child: PageLayoutView, index: number) => {
      return <PagePreviewComponentEditor key={ `child-${index}` }
        view={ child }
        resourceMap={ this.props.resourceMap }
        displayMetrics={ displayMetrics }
        scale={ scale }
        handleLayoutProperties={ this.onHandleLayoutProperties }/>;
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
   * Resolves component container styles
   *
   * @returns component container styles
   */
  private resolveContainerStyles = (): CSSProperties => {
    const properties = this.props.view.properties;
    const result: CSSProperties = this.props.handleLayoutProperties(properties, {
      display: "flex",
      position: "absolute"
    });

    properties.forEach(property => {
      if (property.name.startsWith("layout_")) {
        switch (property.name) {
          case "layout_gravity":
            result.justifyContent = AndroidUtils.gravityToJustifyContent(property.value);
          break;
          default:
        }
        return result;
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
    result.boxSizing = "border-box";

    return result;
  }

  /**
   * Resolves component styles
   *
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, handleLayoutProperties } = this.props;
    const properties = view.properties;
    const result: CSSProperties = handleLayoutProperties(properties, {});

    properties.forEach(property => {
      if (property.name.startsWith("layout_")) {
        switch (property.name) {
          case "layout_gravity":
            result.alignSelf = AndroidUtils.gravityToAlignSelf(property.value);
          break;
        }
        return result;
      }
    });
    result.boxSizing = "border-box";

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
          default:
            this.handleUnknownProperty(property, "Unknown layout property");
          break;
        }
    });

    return result;
  }
}

export default withStyles(styles)(PagePreviewFrameLayout);