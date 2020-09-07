import * as React from "react";

import Measure, { ContentRect } from 'react-measure'
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../../../types/display-metrics";
import AndroidUtils from "../../../utils/android-utils";
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
 * Component for rendering Button views
 */
class PagePreviewButton extends React.Component<Props, State> {

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
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewButton: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Returns button text from properties
   *
   * @returns button text from properties
   */
  private getText = () => {
    const textProperty = this.props.view.properties.find(property => property.name === "text");
    return textProperty?.value;
  }

  /**
   * Resolves button styles
   *
   * @return button styles
   */
  private resolveStyles = (): CSSProperties => {
    const { displayMetrics, scale, view, layer } = this.props;
    const { properties } = view;
    const defaultMargin = AndroidUtils.convertDpToPixel(this.props.displayMetrics, 6, this.props.scale);

    const result: CSSProperties = {
      display: "inline-block",
      background: "#eee",
      padding: "5px 10px",
      border: "1px outset #000",
      fontSize: "14px",
      marginTop: defaultMargin,
      marginRight: defaultMargin,
      marginBottom: defaultMargin,
      marginLeft: defaultMargin,
      zIndex: layer
    };

    properties.forEach(property => {
      if (property.name.startsWith("inset")) {
        const margin = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
        if (!margin) {
          return;
        }

        switch (property.name) {
          case "insetTop":
            result.marginTop = margin;
          break;
          case "insetRight":
            result.marginRight = margin;
          break;
          case "insetBottom":
            result.marginBottom = margin;
          break;
          case "insetLeft":
            result.marginLeft = margin;
          break;
          default:
        }
      }
      switch (property.name) {
        case "backgroundColor":
          result.backgroundColor = property.value;
        break;
        case "width":
          const widthPixels = AndroidUtils.stringToPx(displayMetrics, property.value, scale);
          if (widthPixels) {
            result.width = widthPixels;
          } else {
            this.handleUnknownProperty(property, `unknown width ${property.value}`);
          }
        break;
        case "height":
          const heightPixels = AndroidUtils.stringToPx(displayMetrics, property.value, scale);
          if (heightPixels) {
            result.height = heightPixels;
          } else {
            this.handleUnknownProperty(property, `unknown height ${property.value}`);
          }
        break;
        case "textColor":
          result.color = property.value;
        break;
        case "textSize":
          const fontSizePixels = AndroidUtils.stringToPx(displayMetrics, property.value, scale);
          if (fontSizePixels) {
            result.fontSize = fontSizePixels;
          } else {
            this.handleUnknownProperty(property, `unknown font size ${property.value}`);
          }
        break;
        case "layout_gravity":
          result.alignSelf = AndroidUtils.gravityToAlignSelf(property.value);
        break;
        default:
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
   * Event handler for mouse click
   * 
   * @param event react mouse event
   */
  private onClick = (event: React.MouseEvent) => {
    const { view, onViewClick } = this.props;
    event.stopPropagation();
    onViewClick && onViewClick(view);
  }
}

export default withStyles(styles)(PagePreviewButton);
