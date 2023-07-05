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
import PagePreviewComponentEditor from "./page-preview-component";
import { CSSProperties } from "@mui/material/styles";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import ReactHtmlParser from "react-html-parser";
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
 * Component for FlowTextView component preview
 */
class PagePreviewFlowTextView extends React.Component<Props, State> {
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
            {this.renderChildren()}
            {this.renderText()}
            {this.getText()}
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders layout child components
   */
  private renderChildren = () => {
    const { view, layer, resourceMap, displayMetrics, scale, onViewClick, handleLayoutProperties } =
      this.props;

    return (view.children || []).map((childView, index) => (
      <PagePreviewComponentEditor
        key={index}
        view={childView}
        parentView={view}
        layer={layer}
        resourceMap={resourceMap}
        displayMetrics={displayMetrics}
        scale={scale}
        handleLayoutProperties={handleLayoutProperties}
        onViewClick={onViewClick}
      />
    ));
  };

  /**
   * Renders text
   */
  private renderText = () => {
    const text = this.getText();
    if (!text) {
      return null;
    }

    return ReactHtmlParser(text);
  };

  /**
   * Handles an unknown property logging
   *
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewFlowTextView: don't know how to handle layout property because ${reason}`, property.name, property.value);
  };

  /**
   * Returns text from view properties
   *
   * @return text from view properties
   */
  private getText = () => {
    const textProperty = this.props.view.properties.find((property) => property.name === "text");
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
      display: "inline-block",
      zIndex: layer,
      position: parentIsFrameLayout ? "absolute" : "initial"
    });

    properties.forEach((property) => {
      if (
        property.name === "text" ||
        property.name.startsWith("layout_") ||
        property.name.startsWith("inset")
      ) {
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
        case "textSize":
          const px = AndroidUtils.stringToPx(
            this.props.displayMetrics,
            property.value,
            this.props.scale
          );
          if (px) {
            result.fontSize = px;
          } else {
            console.log("FlowTextView: unknown layout_height", property.value);
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

export default withStyles(styles)(PagePreviewFlowTextView);
