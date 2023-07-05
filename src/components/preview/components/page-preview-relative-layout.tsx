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
import Measure, { BoundingRect, ContentRect } from "react-measure";

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

type ChildBounds = { [id: string]: BoundingRect };

/**
 * Interface representing component state
 */
interface State {
  rootBounds?: BoundingRect;
  childBounds: ChildBounds;
}

/**
 * Component for rendering RelativeLayout views
 */
class PagePreviewRelativeLayout extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      childBounds: {}
    };
  }

  /**
   * Render
   */
  public render() {
    const { classes, view, tabMap } = this.props;
    const tabData = PreviewUtils.getTabContent(view, tabMap);

    return (
      <Measure onResize={this.onRootResize} bounds={true}>
        {({ measureRef }) => (
          <div
            ref={measureRef}
            className={classes.relativeLayout}
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
  }

  /**
   * Renders child component
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

    return (view.children || []).map((child: PageLayoutView, index: number) => (
      <PagePreviewComponentEditor
        key={`child-${index}`}
        view={child}
        parentView={view}
        selectedView={selectedView}
        layer={layer}
        resourceMap={resourceMap}
        displayMetrics={displayMetrics}
        scale={scale}
        style={this.resolveChildStyles(child)}
        handleLayoutProperties={handleLayoutProperties}
        onResize={(contentRect: ContentRect) => this.onChildResize(child.id, contentRect)}
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
    // console.log(`PagePreviewRelativeLayout: don't know how to handle layout property because ${reason}`, property.name, property.value);
  };

  /**
   * Resolves child component styles
   *
   * @param child child
   * @return child component styles
   */
  private resolveChildStyles = (child: PageLayoutView): CSSProperties => {
    const rightOfChildId = child.properties.find((item) => item.name === "layout_toRightOf")?.value;

    const result: CSSProperties = {
      position: "absolute"
    };

    if (rightOfChildId) {
      const rightOfBounds = this.state.childBounds[rightOfChildId];
      if (rightOfBounds) {
        result.left = rightOfBounds.right - (this.state.rootBounds?.left || 0);
      }
    }

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

    return result;
  };

  /**
   * Updates child bounds into state
   *
   * @param id child id
   * @param bounds child bounds
   */
  private updateChildBounds = (id: string, bounds: BoundingRect) => {
    const childBounds = { ...this.state.childBounds };
    childBounds[id] = bounds;

    this.setState({
      childBounds: childBounds
    });
  };

  /**
   * Event handler for root component resize
   *
   * @param contentRect root content rect
   */
  private onRootResize = (contentRect: ContentRect) => {
    this.setState({
      rootBounds: contentRect.bounds
    });

    if (this.props.onResize) {
      this.props.onResize(contentRect);
    }
  };

  /**
   * Event handler for child resize event
   *
   * @param id child id
   * @param contentRect child content rect
   */
  private onChildResize = (id: string, contentRect: ContentRect) => {
    if (id && contentRect.bounds) {
      this.updateChildBounds(id, contentRect.bounds);
    }
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
   * Event handler for on click
   */
  private onClick = (event: React.MouseEvent) => {
    event.stopPropagation();
  };
}

export default withStyles(styles)(PagePreviewRelativeLayout);
