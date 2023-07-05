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
import ImageIcon from "@mui/icons-material/Image";
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
 * Component for rendering Image views
 */
class PagePreviewImageView extends React.Component<Props, State> {
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
            {this.renderImage()}
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders preview image
   */
  private renderImage = () => {
    const src = this.getImageSrc();
    const imageStyles = this.resolveImageViewStyles();

    if (src) {
      return (
        <div style={{ ...imageStyles, textAlign: "center" }}>
          <img key={src} alt="preview" src={src} style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </div>
      );
    } else {
      return (
        <ImageIcon style={{ ...imageStyles, background: "#fff", color: "rgb(188, 190, 192)" }} />
      );
    }
  };

  /**
   * Returns image src from resources or null if not found
   *
   * @returns image src from resources or null if not found
   */
  private getImageSrc = () => {
    const srcProperty = this.props.view.properties.find((property) => property.name === "src");

    const id = srcProperty?.value;
    if (id && id.startsWith("@resources/")) {
      const resource = this.props.resourceMap[id.substring(11)];
      if (resource) {
        return resource.data;
      }
    }

    return null;
  };

  /**
   * Handles an unknown property logging
   *
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewImageView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  };

  /**
   * Resolves image styles
   *
   * @returns image styles
   */
  private resolveImageViewStyles = (): CSSProperties => {
    const result: CSSProperties = {
      width: "100%",
      height: "100%"
    };

    return result;
  };

  /**
   * Resolves component styles
   *
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, parentView, layer, handleLayoutProperties } = this.props;
    const properties = view.properties;
    const parentIsFrameLayout =
      parentView && parentView.widget === PageLayoutWidgetType.FrameLayout;
    const result: CSSProperties = handleLayoutProperties(properties, {
      zIndex: layer,
      position: parentIsFrameLayout ? "absolute" : "initial"
    });

    properties.forEach((property) => {
      if (property.name === "text" || property.name.startsWith("layout_")) {
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
            break;
          default:
        }
        return;
      }

      switch (property.name) {
        default:
          this.handleUnknownProperty(property, "Unknown property");
          break;
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

export default withStyles(styles)(PagePreviewImageView);
