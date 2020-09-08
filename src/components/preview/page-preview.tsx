import * as React from "react";

import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../styles/page-preview";
import PagePreviewComponentEditor from "./components/page-preview-component";
import { PageLayoutView, PageLayoutViewProperty, ExhibitionPageResource, ScreenOrientation } from "../../generated/client";
import DisplayMetrics from "../../types/display-metrics";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import AndroidUtils from "../../utils/android-utils";
import { ResourceMap } from "../../types";
import { TabHolder } from "../content-editor/constants";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view?: PageLayoutView;
  selectedView?: PageLayoutView;
  layer?: number;
  resources?: ExhibitionPageResource[];
  scale: number;
  displayMetrics: DisplayMetrics;
  screenOrientation?: ScreenOrientation;
  deviceOrientation?: ScreenOrientation;
  tabMap?: Map<string, TabHolder>;

  onViewClick?: (view: PageLayoutView) => void;
  onTabClick?: (viewId: string, newIndex: number) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for page layout preview
 */
class PagePreview extends React.Component<Props, State> {

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
  public render = () => {
    const {
      classes,
      screenOrientation,
      displayMetrics,
      scale,
      view,
      selectedView,
      layer,
      deviceOrientation,
      tabMap,
      onViewClick,
      onTabClick
    } = this.props;

    let height = displayMetrics.heightPixels * scale;
    let width = displayMetrics.widthPixels * scale;

    if (screenOrientation && deviceOrientation && screenOrientation !== deviceOrientation) {
      height = displayMetrics.widthPixels * scale;
      width = displayMetrics.heightPixels * scale;
    }

    return (
      <div className={ classes.root } style={{ position: "absolute", width: width, height: height  }}>
        <PagePreviewComponentEditor
          view={ view }
          selectedView={ selectedView }
          layer={ layer }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ this.getResourceMap() }
          handleLayoutProperties={ this.onHandleLayoutProperties }
          onViewClick={ onViewClick }
          onTabClick={ onTabClick }
          tabMap={ tabMap }
        />
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
    // console.log(`PagePreview: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Handles a child component layouting
   *
   * @param childProperties child component properties
   * @param childStyles child component styles
   * @return modified child component styles
   */
  private onHandleLayoutProperties = (childProperties: PageLayoutViewProperty[], childStyles: CSSProperties): CSSProperties => {
    const result = { ...childStyles };

    childProperties
      .filter(property => property.name.startsWith("layout_"))
      .forEach(property => {
        switch (property.name) {
          case "layout_width":
            if ("match_parent" === property.value || "fill_parent" === property.value) {
              result.width = "100%";
            } else {
              const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
              if (px) {
                result.width = px;
              } else {
                this.handleUnknownProperty(property, "Unknown value");
              }
            }
          break;
          case "layout_height":
            if ("match_parent" === property.value|| "fill_parent" === property.value) {
              result.height = "100%";
            } else {
              const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
              if (px) {
                result.height = px;
              } else {
                this.handleUnknownProperty(property, "Unknown value");
              }
            }
          break;
          case "layout_marginTop":
          case "layout_marginRight":
          case "layout_marginBottom":
          case "layout_marginLeft":
          case "layout_paddingTop":
          case "layout_paddingRight":
          case "layout_paddingBottom":
          case "layout_paddingLeft":
            const propertyName = property.name.substring(7);
            const pixels = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
            if (pixels) {
              result[propertyName] = pixels;
            } else {
              this.handleUnknownProperty(property, `Unknown $propertyName value ${property.value}`);
            }
          break;
          default:
            this.handleUnknownProperty(property, "Unknown layout property");
          break;
        }
      });

    return result;
  }

  /**
   * Returns resources as a map
   *
   * @returns resources as a map
   */
  private getResourceMap = () => {
    const result: ResourceMap = { };

    (this.props.resources || []).forEach(resource => {
      result[resource.id] = resource;
    });

    return result;
  }

}

export default withStyles(styles)(PagePreview);
