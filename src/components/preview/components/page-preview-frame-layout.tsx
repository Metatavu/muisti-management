import * as React from "react";

import Measure, { ContentRect } from 'react-measure';
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import PagePreviewComponentEditor from "./page-preview-component";
import DisplayMetrics from "../../../types/display-metrics";
import { ResourceMap } from "../../../types";
import AndroidUtils from "../../../utils/android-utils";

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
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { onResize } = this.props;
    return (
      <Measure onResize={ onResize } bounds={ true }>
        {({ measureRef }) => (
          <div
            ref={ measureRef }
            style={ this.resolveStyles() }
            onClick={ this.onClick }
            onMouseOver={ this.onMouseOver }
            onMouseOut={ this.onMouseOut }
          >
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
    const {
      view,
      selectedView,
      layer,
      resourceMap,
      displayMetrics,
      scale,
      onViewClick,
      handleLayoutProperties
    } = this.props;

    const result = (view.children || []).map((child: PageLayoutView, index: number) => {
      return (
        <PagePreviewComponentEditor key={ `child-${index}` }
          view={ child }
          selectedView={ selectedView }
          layer={ layer }
          resourceMap={ resourceMap }
          displayMetrics={ displayMetrics }
          scale={ scale }
          handleLayoutProperties={ handleLayoutProperties }
          onViewClick={ onViewClick }
        />
      );
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
  private resolveStyles = (): CSSProperties => {
    const { view, layer, handleLayoutProperties } = this.props;
    const properties = view.properties;
    const result: CSSProperties = handleLayoutProperties(properties, {
      display: "flex",
      zIndex: layer
    });

    properties.forEach(property => {
      if (property.name.startsWith("layout_")) {
        switch (property.name) {
          case "layout_gravity":
            result.alignSelf = AndroidUtils.gravityToAlignSelf(property.value);
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
   * Event handler for mouse over
   * 
   * @param event react mouse event
   */
  private onMouseOver = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  /**
   * Event handler for mouse out
   * 
   * @param event react mouse event
   */
  private onMouseOut = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  /**
   * Event handler for mouse click
   * 
   * @param event react mouse event
   */
  private onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  }
}

export default withStyles(styles)(PagePreviewFrameLayout);
