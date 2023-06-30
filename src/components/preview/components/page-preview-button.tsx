import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutWidgetType
} from "../../../generated/client";
import styles from "../../../styles/page-preview";
import { CSSPropertyValuePairs, ResourceMap } from "../../../types";
import DisplayMetrics from "../../../types/display-metrics";
import AndroidUtils from "../../../utils/android-utils";
import { LayoutGravityValuePairs } from "../../layout/editor-constants/values";
import { CSSProperties } from "@mui/material/styles";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import Measure, { ContentRect } from "react-measure";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  parentView?: PageLayoutView;
  selectedView?: PageLayoutView;
  layer: number;
  resourceMap: ResourceMap;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (
    properties: PageLayoutViewProperty[],
    styles: CSSProperties
  ) => CSSProperties;
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
      <Measure onResize={onResize} bounds={true}>
        {({ measureRef }) => (
          <div
            ref={measureRef}
            style={this.resolveStyles()}
            className={mouseOver || selected ? classes.highlighted : ""}
            onClick={this.onClick}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
          >
            <div style={{ position: "relative", height: "100%", width: "100%" }}>
              <div style={this.resolveButtonTextStyles()}>
                <p style={{ margin: 0 }}>{this.getText()}</p>
              </div>
            </div>
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
  };

  /**
   * Returns button text from properties
   *
   * @returns button text from properties or undefined
   */
  private getText = (): string | undefined => {
    const textProperty: PageLayoutViewProperty | undefined = this.props.view.properties.find(
      (property) => property.name === "text"
    );
    const id = textProperty?.value;
    if (id && id.startsWith("@resources/")) {
      const resource = this.props.resourceMap[id.substring(11)];
      if (resource) {
        return resource.data;
      }
    }

    return id;
  };
  /**
   * Resolves button styles
   *
   * @return button styles
   */
  private resolveStyles = (): CSSProperties => {
    const { displayMetrics, scale, view, parentView, layer, handleLayoutProperties } = this.props;
    const { properties } = view;
    const parentIsFrameLayout =
      parentView && parentView.widget === PageLayoutWidgetType.FrameLayout;

    const result: CSSProperties = handleLayoutProperties(properties, {
      display: "inline-block",
      background: "#eee",
      zIndex: layer,
      position: parentIsFrameLayout ? "absolute" : "initial",
      overflow: "hidden"
    });

    properties.forEach((property) => {
      if (property.name.startsWith("inset")) {
        const margin = AndroidUtils.stringToPx(
          this.props.displayMetrics,
          property.value,
          this.props.scale
        );
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
        case "background":
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
            /**
             * It seems that we have somewhat incorrect scaling with the font sizes since
             * scale is hardcoded to 1.
             * For example if the pixel value is 80 in android that is closer to 160.
             * TODO: Define scale dynamically
             */
            result.fontSize = fontSizePixels * 2.5;
          } else {
            this.handleUnknownProperty(property, `unknown font size ${property.value}`);
          }
          break;
        case "layout_gravity":
          if (parentIsFrameLayout) {
            const gravityProps: CSSPropertyValuePairs[] =
              AndroidUtils.layoutGravityToCSSPositioning(property.value as LayoutGravityValuePairs);
            gravityProps.forEach((prop) => {
              result[prop.key] = prop.value;
            });
          } else {
            result.alignSelf = AndroidUtils.gravityToAlignSelf(property.value);
          }
          break;
        default:
          break;
      }
    });

    return result;
  };

  /**
   * Resolves button text styles
   *
   * @returns button text styles
   */
  private resolveButtonTextStyles = (): CSSProperties => {
    const { view } = this.props;
    const properties = view.properties;
    const result: CSSProperties = {
      margin: 0,
      position: "absolute"
    };

    properties.forEach((property) => {
      switch (property.name) {
        case "gravity":
          const gravityProps: CSSPropertyValuePairs[] = AndroidUtils.layoutGravityToCSSPositioning(
            property.value as LayoutGravityValuePairs
          );
          gravityProps.forEach((prop) => {
            result[prop.key] = prop.value;
          });

          return;
        default:
          return;
      }
    });

    return result;
  };

  /**
   * Event handler for mouse over
   *
   * @param event react mouse event
   */
  private onMouseOver = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState({ mouseOver: true });
  };

  /**
   * Event handler for mouse out
   *
   * @param event react mouse event
   */
  private onMouseOut = (event: React.MouseEvent) => {
    event.stopPropagation();
    this.setState({ mouseOver: false });
  };

  /**
   * Event handler for mouse click
   *
   * @param event react mouse event
   */
  private onClick = (event: React.MouseEvent) => {
    const { view, onViewClick } = this.props;
    event.stopPropagation();
    onViewClick && onViewClick(view);
  };
}

export default withStyles(styles)(PagePreviewButton);
