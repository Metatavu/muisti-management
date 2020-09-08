import * as React from "react";

import Measure, { ContentRect } from "react-measure";
import { WithStyles, withStyles, Tabs, Tab, AppBar } from "@material-ui/core";
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty, PageLayoutWidgetType } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import PagePreviewComponentEditor from "./page-preview-component";
import DisplayMetrics from "../../../types/display-metrics";
import { ResourceMap } from "../../../types";
import PagePreviewUtils from "./page-preview-utils";
import AndroidUtils from "../../../utils/android-utils";
import { TabStructure } from "../../content-editor/constants";
import { parseStringToJsonObject } from "../../../utils/content-editor-utils";
import TabItem from "../../generic/tab-item";

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
  onTabClick?: (viewId: string, newIndex: number) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for rendering MaterialTabLayout views
 */
class PagePreviewMaterialTab extends React.Component<Props, State> {

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
  public render = () => {
    const { onResize } = this.props;

    return (
      <Measure onResize={ onResize } bounds={ true }>
        {({ measureRef }) => (
          <div
            ref={ measureRef }
            style={ this.resolveContainerStyles() }
            onClick={ this.onClick }
            onMouseOver={ this.onMouseOver }
            onMouseOut={ this.onMouseOut }
          >
            { this.renderTabs() }
          </div>
        )}
      </Measure>
    );
  }

  private renderTabs = () => {
    const { resourceMap, view } = this.props;
    const tabResource = this.getTabResource();
    if (!tabResource) {
      return null;
    }

    const tabItems = tabResource.tabs.map((tab, index) => {
      return (
        <Tab
          key={ `${tab.label}-${index}` }
          label={ tab.label }
          value={ index }
        />
      );
    });

    return (
      <>
        <Tabs
          style={ this.resolveStyles() }
          value={ 0 }
          name={ view.id }
          onChange={ this.onTabClickHandler(view.id) }
          aria-label="simple tabs example"
        >
          { tabItems }
        </Tabs>
      </>
    );
  }

  /**
   * Get tab resource from resource map
   *
   * @returns found tab structure or undefined
   */
  private getTabResource = (): TabStructure | undefined => {
    const { resourceMap, view } = this.props;
    if (view.widget !== PageLayoutWidgetType.MaterialTabLayout) {
      return;
    }

    const tabData = view.properties.find(prop => prop.name === "data");
    if (!tabData) {
      return;
    }

    const keySplit = tabData.value.split("@resources/");

    if (keySplit.length < 2) {
      return;
    }

    const key = keySplit[1];

    const tabResource = resourceMap[key];
    if (!tabResource) {
      return;
    }

    const data = tabResource.data;
    const parsed = parseStringToJsonObject<typeof data, TabStructure>(data);
    return parsed;
  }

  /**
   * Handles an unknown property logging
   *
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // // console.log(`PagePreviewFrameLayout: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Resolves component container styles
   *
   * @returns component container styles
   */
  private resolveContainerStyles = (): CSSProperties => {
    const { view, layer, handleLayoutProperties } = this.props;
    const properties = view.properties;

    const result: CSSProperties = handleLayoutProperties(properties, {
      display: "flex",
      zIndex: layer + 1
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
   * TODO: Implement styles
   *
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, handleLayoutProperties, layer } = this.props;
    const properties = view.properties;
    const result: CSSProperties = handleLayoutProperties(properties, {
      zIndex: layer + 1
    });

    properties.forEach(property => {
      switch (property.name) {
        case "tabGravity":
          // console.log("tabGravity")
          break;

        case "selectedTabIndicatorColor":
          // console.log("selectedTabIndicatorColor")
          break;

        case "selectedTabIndicatorGravity":
          // console.log("selectedTabIndicatorGravity")
          break;

        case "selectedTabIndicatorHeight":
          // console.log("selectedTabIndicatorHeight")
          break;

        case "tabTextColorNormal":
          // console.log("tabTextColorNormal")
          break;

        case "tabTextColorSelected":
          // console.log("tabTextColorSelected")
          break;

        case "unboundedRipple":
          // console.log("unboundedRipple")
          break;

        case "tabIndicatorFullWidth":
          // console.log("tabIndicatorFullWidth")
          break;

        default:
          // console.log(`Unknown property: ${property.name}`)
      }
    });

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

  private onTabClickHandler = (viewId: string) => (event: React.ChangeEvent<{}>, value: any) => {
    const { onTabClick } = this.props;
    if (!onTabClick) {
      return;
    }

    const selectedTabIndex = value;
    onTabClick(viewId, selectedTabIndex);
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

export default withStyles(styles)(PagePreviewMaterialTab);
