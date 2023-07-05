import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutWidgetType
} from "../../../generated/client";
import styles from "../../../styles/page-preview";
import { CSSPropertyValuePairs, ResourceMap } from "../../../types";
import DisplayMetrics from "../../../types/display-metrics";
import AndroidUtils from "../../../utils/android-utils";
import { ExhibitionPageTabHolder } from "../../content-editor/constants";
import { SelectedTabIndicatorGravityValues } from "../../layout/editor-constants/values";
import { Tab, Tabs } from "@mui/material";
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
  tabMap?: Map<string, ExhibitionPageTabHolder>;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (
    properties: PageLayoutViewProperty[],
    styles: CSSProperties
  ) => CSSProperties;
  onViewClick?: (view: PageLayoutView) => void;
  onTabClick?: (viewId: string, newIndex: number) => void;
}

/**
 * Interface representing component state
 */
interface State {}

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
    this.state = {};
  }

  /**
   * Render basic layout
   */
  public render = () => {
    const { onResize } = this.props;

    return (
      <Measure onResize={onResize} bounds={true}>
        {({ measureRef }) => (
          <div
            ref={measureRef}
            style={this.resolveStyles()}
            onClick={this.onClick}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
          >
            {this.renderTabs()}
          </div>
        )}
      </Measure>
    );
  };

  /**
   * Renders tabs
   */
  private renderTabs = () => {
    const { view } = this.props;
    const tabResource = this.getTabResource();
    if (!tabResource) {
      return null;
    }

    const activeIndex = tabResource.activeTabIndex;

    if (!tabResource.tabComponent.tabs) {
      return null;
    }

    const tabItems = tabResource.tabComponent.tabs.map((tab, index) => {
      return (
        <Tab
          style={this.resolveTabButtonStyles(activeIndex, index)}
          key={`${tab.label}-${index}`}
          label={tab.label}
          value={index}
          fullWidth
        />
      );
    });

    return (
      <>
        <Tabs
          variant={this.findTabProperty("variant")}
          TabIndicatorProps={{
            style: this.resolveTabIndicatorStyles()
          }}
          style={this.resolveTabContainerStyles()}
          value={activeIndex}
          name={view.id}
          onChange={this.onTabClick(view.id)}
          aria-label="simple tabs example"
        >
          {tabItems}
        </Tabs>
      </>
    );
  };

  /**
   * Find tab property and set tab settings according to the property value
   *
   * @param key key to find
   */
  private findTabProperty = (key: string) => {
    switch (key) {
      case "variant":
        const tabMode = this.searchForTabProperty("tabMode");
        if (!tabMode) {
          return "standard";
        }
        return tabMode.name === "fixed" ? "standard" : "scrollable";
      default:
        break;
    }
  };

  /**
   * Search for tab property
   *
   * @param propertyName property name
   * @returns found page layout view property or undefined
   */
  private searchForTabProperty = (propertyName: string): PageLayoutViewProperty | undefined => {
    const { view } = this.props;
    return view.properties.find((prop) => prop.name === propertyName);
  };

  /**
   * Get tab resource from resource map
   *
   * @returns found tab structure or undefined
   */
  private getTabResource = (): ExhibitionPageTabHolder | undefined => {
    const { view, tabMap } = this.props;
    if (view.widget !== PageLayoutWidgetType.MaterialTabLayout || !tabMap) {
      return;
    }

    return tabMap.get(view.id);
  };

  /**
   * Handles an unknown property logging
   *
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    // console.log(`PagePreviewFrameLayout: don't know how to handle layout property because ${reason}`, property.name, property.value);
  };

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
      zIndex: layer
    });

    properties.forEach((property) => {
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
  };

  /**
   * Resolves styles for material ui tab container
   *
   * @returns material ui tab container styles
   */
  private resolveTabContainerStyles = (): CSSProperties => {
    const { view, displayMetrics, scale, layer } = this.props;
    const properties = view.properties;
    const result: CSSProperties = {
      zIndex: layer + 1
    };

    properties.forEach((property) => {
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

        case "unboundedRipple":
          // console.log("unboundedRipple")
          break;

        default:
        // console.log(`Unknown property: ${property.name}`)
      }
    });

    return result;
  };

  /**
   * Resolves styles for material ui tab indicator
   *
   * @returns material ui tab indicator styles
   */
  private resolveTabIndicatorStyles = (): CSSProperties => {
    const { view, displayMetrics, scale, layer } = this.props;
    const properties = view.properties;
    const result: CSSProperties = {
      zIndex: layer + 2
    };

    properties.forEach((property) => {
      switch (property.name) {
        case "selectedTabIndicatorColor":
          result.backgroundColor = property.value;
          break;

        case "selectedTabIndicatorGravity":
          const gravityProps: CSSPropertyValuePairs[] =
            AndroidUtils.tabIndicatorGravityToCSSPositioning(
              property.value as SelectedTabIndicatorGravityValues
            );
          gravityProps.forEach((prop) => {
            result[prop.key] = prop.value;
          });
          break;
        case "selectedTabIndicatorHeight":
          const px = AndroidUtils.stringToPx(displayMetrics, property.value, scale);
          if (px) {
            result.height = px;
          } else {
            this.handleUnknownProperty(property, "Unknown value");
          }
          break;

        case "tabIndicatorFullWidth":
          // console.log("tabIndicatorFullWidth")
          break;

        default:
        // console.log(`Unknown property: ${property.name}`)
      }
    });

    return result;
  };

  /**
   * Resolves tab button styles
   *
   * @returns tab button styles
   */
  private resolveTabButtonStyles = (activeIndex: number, buttonIndex: number): CSSProperties => {
    const { view, displayMetrics, scale, layer } = this.props;
    const properties = view.properties;
    const result: CSSProperties = {
      zIndex: layer + 3
    };

    properties.forEach((property) => {
      switch (property.name) {
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

        case "tabTextColorNormal":
          const tabTextColorNormal = AndroidUtils.toCssColor(property.value);
          if (tabTextColorNormal) {
            result.color = tabTextColorNormal;
          } else {
            this.handleUnknownProperty(property, "Unknown text color");
          }
          break;
        case "tabTextColorSelected":
          if (activeIndex === buttonIndex) {
            const tabTextColorSelected = AndroidUtils.toCssColor(property.value);
            if (tabTextColorSelected) {
              result.color = tabTextColorSelected;
            } else {
              this.handleUnknownProperty(property, "Unknown text color");
            }
          }
          break;
        case "unboundedRipple":
          // console.log("unboundedRipple")
          break;
        default:
          // console.log(`Unknown property: ${property.name}`)
          break;
      }
    });

    return result;
  };

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
  };

  /**
   * Event handler for mouse over
   *
   * @param event react mouse event
   */
  private onMouseOver = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  /**
   * Event handler for mouse out
   *
   * @param event react mouse event
   */
  private onMouseOut = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  /**
   * Event handler for mouse click
   *
   * @param event react mouse event
   */
  private onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
}

export default withStyles(styles)(PagePreviewMaterialTab);
