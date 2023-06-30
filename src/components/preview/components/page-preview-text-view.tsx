import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutWidgetType,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
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
 * Component for TextView component preview
 */
class PagePreviewTextView extends React.Component<Props, State> {
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
   * Render basic layout
   */
  public render() {
    const { classes, view, onResize, selectedView } = this.props;
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
            <div style={this.resolveTextViewStyles()}>
              <div style={this.resolveTextStyles()}>
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
    // console.log(`PagePreviewTextView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  };

  /**
   * Returns text from view properties
   *
   * @return text from view properties or undefined
   */
  private getText = (): string | undefined => {
    const textProperty: PageLayoutViewProperty | undefined = this.props.view.properties.find(
      (property) => property.name === "text"
    );
    const id = textProperty?.value;
    if (id && id.startsWith("@resources/")) {
      const resource = this.props.resourceMap[id.substring(11)];
      if (!resource) {
        return;
      }

      switch (resource.mode) {
        case PageResourceMode.Scripted:
          return strings.contentEditor.preview.resourceModePreview.scripted;
        case PageResourceMode.Dynamic:
          return strings.contentEditor.preview.resourceModePreview.dynamic;
        case PageResourceMode.Static:
        default:
          return resource.data;
      }
    }

    return id;
  };

  /**
   * Resolves container styles
   *
   * @returns container styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, parentView, layer, handleLayoutProperties } = this.props;
    const properties = view.properties;
    const parentIsFrameLayout =
      parentView && parentView.widget === PageLayoutWidgetType.FrameLayout;
    const result: CSSProperties = handleLayoutProperties(properties, {
      display: "flex",
      zIndex: layer,
      position: parentIsFrameLayout ? "absolute" : "initial"
    });

    properties.forEach((property) => {
      if (property.name.startsWith("layout_")) {
        switch (property.name) {
          case "layout_gravity":
            if (parentIsFrameLayout) {
              const gravityProps: CSSPropertyValuePairs[] =
                AndroidUtils.layoutGravityToCSSPositioning(
                  property.value as LayoutGravityValuePairs
                );
              gravityProps.forEach((prop) => {
                result[prop.key] = prop.value;
              });
            } else {
              result.alignSelf = AndroidUtils.gravityToAlignSelf(property.value);
            }
            return;
          default:
            return;
        }
      }
      if (property.name === "text" || property.name.startsWith("inset")) {
        return;
      }

      switch (property.name) {
        default:
          this.handleUnknownProperty(property, "Unknown or unsupported property for container");
          break;
      }
    });

    return result;
  };

  /**
   * Resolves text view styles
   *
   * @returns text view styles
   */
  private resolveTextViewStyles = (): CSSProperties => {
    const { displayMetrics, scale } = this.props;
    const properties = this.props.view.properties;
    const result: CSSProperties = this.props.handleLayoutProperties(properties, {
      display: "inline-block",
      position: "relative",
      color: "#ffffff"
    });

    properties.forEach((property) => {
      if (
        property.name === "text" ||
        property.name.startsWith("layout_") ||
        property.name.startsWith("inset")
      ) {
        switch (property.name) {
          case "layout_gravity":
            result.alignSelf = AndroidUtils.gravityToAlignSelf(property.value);
            break;
          default:
        }
        return result;
      }

      switch (property.name) {
        case "width":
          const widthInPixels = AndroidUtils.stringToPx(displayMetrics, property.value, scale);
          if (widthInPixels) {
            result.width = widthInPixels;
          } else {
            console.log("Button: unknown width", property.value);
          }
          break;
        case "height":
          const heightInPixels = AndroidUtils.stringToPx(displayMetrics, property.value, scale);
          if (heightInPixels) {
            result.height = heightInPixels;
          } else {
            console.log("Button: unknown height", property.value);
          }
          break;
        case "background":
          const color = AndroidUtils.toCssColor(property.value);
          if (color) {
            result.background = color;
          } else {
            this.handleUnknownProperty(property, "Unknown background");
          }
          break;
        case "textSize":
          const px = AndroidUtils.stringToPx(
            this.props.displayMetrics,
            property.value,
            this.props.scale
          );
          if (px) {
            result.fontSize = px;
          } else {
            console.log("TextView: unknown textSize", property.value);
          }
          break;
        case "textAlignment":
          switch (property.value) {
            case "inherit":
              result.textAlign = property.value;
              break;
            case "center":
              result.textAlign = property.value;
              break;
            case "text_start":
              result.textAlign = "left";
              break;
            case "text_end":
              result.textAlign = "right";
              break;
            case "view_start":
              result.textAlign = "left";
              break;
            case "view_end":
              result.textAlign = "right";
              break;
            default:
          }
          break;
        case "textColor":
          const textColor = AndroidUtils.toCssColor(property.value);
          if (textColor) {
            result.color = textColor;
          } else {
            this.handleUnknownProperty(property, "Unknown text color");
          }
          break;
        default:
          this.handleUnknownProperty(property, "Unknown property");
          break;
      }
    });

    return result;
  };

  /**
   * Resolves text styles
   *
   * @returns text styles
   */
  private resolveTextStyles = (): CSSProperties => {
    const { view, parentView } = this.props;
    const properties = view.properties;
    const parentIsFrameLayout =
      parentView && parentView.widget === PageLayoutWidgetType.FrameLayout;
    const result: CSSProperties = {
      margin: 0,
      position: "absolute"
    };

    properties.forEach((property) => {
      switch (property.name) {
        case "gravity":
          if (parentIsFrameLayout) {
            const gravityProps: CSSPropertyValuePairs[] =
              AndroidUtils.layoutGravityToCSSPositioning(property.value as LayoutGravityValuePairs);
            gravityProps.forEach((prop) => {
              result[prop.key] = prop.value;
            });
          } else {
            result.alignSelf = AndroidUtils.gravityToAlignSelf(property.value);
          }
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
   * Event handler for on click
   */
  private onClick = (event: React.MouseEvent) => {
    const { view, onViewClick } = this.props;
    event.stopPropagation();
    onViewClick && onViewClick(view);
  };
}

export default withStyles(styles)(PagePreviewTextView);
