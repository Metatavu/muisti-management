import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutWidgetType
} from "../../../generated/client";
import styles from "../../../styles/page-preview";
import { CSSPropertyValuePairs, ResourceMap } from "../../../types";
import DisplayMetrics from "../../../types/display-metrics";
import AndroidUtils from "../../../utils/android-utils";
import PreviewUtils from "../../../utils/preview-utils";
import { ExhibitionPageTabHolder } from "../../content-editor/constants";
import TabItem from "../../generic/tab-item";
import { LayoutGravityValuePairs } from "../../layout/editor-constants/values";
import PagePreviewComponentEditor from "./page-preview-component";
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
    this.state = {};
  }

  /**
   * Render basic layout
   */
  public render = () => {
    const { onResize, tabMap, view } = this.props;
    const tabData = PreviewUtils.getTabContent(view, tabMap);
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
            {tabData.length > 0 ? this.renderTabContent(tabData) : this.renderChildren()}
          </div>
        )}
      </Measure>
    );
  };

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
      tabMap,
      onViewClick,
      onTabClick,
      handleLayoutProperties
    } = this.props;

    return (view.children || []).map((child, index) => (
      <PagePreviewComponentEditor
        key={index}
        view={child}
        parentView={view}
        selectedView={selectedView}
        layer={layer}
        resourceMap={resourceMap}
        displayMetrics={displayMetrics}
        scale={scale}
        handleLayoutProperties={handleLayoutProperties}
        onViewClick={onViewClick}
        onTabClick={onTabClick}
        tabMap={tabMap}
      />
    ));
  };

  /**
   * Renders tab contents
   *
   * @param tabData list of tab holders
   */
  private renderTabContent = (tabData: ExhibitionPageTabHolder[]) => {
    const tabContentHolder = tabData[0];
    const activeIndex = tabContentHolder.activeTabIndex;

    if (!tabContentHolder.tabComponent.tabs) {
      return null;
    }

    const tabItems = tabContentHolder.tabComponent.tabs.map((tab, index) => {
      if (!tab.resources[0]) {
        return null;
      }

      return (
        <TabItem
          key={`TabItem-${index}`}
          index={index}
          resource={tab.resources[0]}
          visible={index === activeIndex}
        />
      );
    });

    return tabItems;
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
   * Resolves component container styles
   *
   * @returns component container styles
   */
  private resolveStyles = (): CSSProperties => {
    const { view, parentView, layer, handleLayoutProperties } = this.props;
    const properties = view.properties;
    const parentIsFrameLayout =
      parentView && parentView.widget === PageLayoutWidgetType.FrameLayout;
    const result: CSSProperties = handleLayoutProperties(properties, {
      display: "flex",
      zIndex: layer,
      position: parentIsFrameLayout ? "absolute" : "relative"
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
            break;
          default:
            break;
        }

        return;
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

export default withStyles(styles)(PagePreviewFrameLayout);
