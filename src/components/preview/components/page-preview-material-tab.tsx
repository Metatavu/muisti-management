import * as React from "react";

import Measure, { ContentRect } from "react-measure";
import { WithStyles, withStyles, Tabs, Tab, TabScrollButtonProps } from "@material-ui/core";
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty, PageLayoutWidgetType } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../../../types/display-metrics";
import { ResourceMap } from "../../../types";
import { TabStructure } from "../../content-editor/constants";
import { parseStringToJsonObject } from "../../../utils/content-editor-utils";
import { property } from "lodash";
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
    console.log("äsdöl,fäösld,fäöl");

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
            { this.renderTabs() }
          </div>
        )}
      </Measure>
    );
  }

  /**
   * Renders tabs
   */
  private renderTabs = () => {
    const { view } = this.props;
    const tabResource = this.getTabResource();
    if (!tabResource) {
      return null;
    }

    const tabItems = tabResource.tabs.map((tab, index) => {
      return (
        <Tab
          style={{ height: "100px", color: "#ffffff" }}
          key={ `${tab.label}-${index}` }
          label={ tab.label }
          value={ index }
        />
      );
    });

    return (
      <>
        <Tabs
          variant={ this.findTabProperties("variant") }
          TabIndicatorProps={{
            style: {
            }
          }}

          style={ this.resolveTabStyles() }
          value={ 0 }
          name={ view.id }
          onChange={ this.onTabClick(view.id) }
          aria-label="simple tabs example"
        >
          { tabItems }
        </Tabs>
      </>
    );
  }

  private findTabProperties = (key: string) => {
    switch (key) {
      case "variant":
        const tabMode = this.searchForTabProperty("tabMode");
        if (!tabMode) {
          return;
        }
        return (tabMode.name === "fixed") ? "standard" : "scrollable";

      default:
        break;
    }
  }

  private searchForTabProperty = (propertyName: string) => {
    const { view } = this.props;
    return view.properties.find(property => property.name === propertyName);
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
   * Resolves component styles
   * TODO: Implement styles
   *
   * @returns component styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, handleLayoutProperties, layer } = this.props;
    const properties = view.properties;
    console.log(properties);
    const result: CSSProperties = handleLayoutProperties(properties, {
      zIndex: layer + 1
    });

    properties.forEach(property => {
      switch (property.name) {
        case "background":
          result.backgroundColor = property.value;
          break;

        default:
          // console.log(`Unknown property: ${property.name}`)
          break;
      }
    });

    return result;
  }

  private resolveTabStyles = (): CSSProperties => {
    const { view, displayMetrics, scale } = this.props;
    const properties = view.properties;
    const result: CSSProperties = {};
    console.log(properties);
    properties.forEach(property => {
      switch (property.name) {
        case "background":
          result.backgroundColor = property.value;
          break;
        case "layout_height":
          const px = AndroidUtils.stringToPx(displayMetrics, property.value, scale);
          if (px) {
            result.height = px;
          } else {
            this.handleUnknownProperty(property, "Unknown value");
          }
          break;
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
   * Event handler for tab click
   *
   * @param viewId view id
   * @param event react change event
   */
  private onTabClick = (viewId: string) => (event: React.ChangeEvent<{}>, value: any) => {
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
