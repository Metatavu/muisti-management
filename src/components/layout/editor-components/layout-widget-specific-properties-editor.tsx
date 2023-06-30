import { setSelectedLayout } from "../../../actions/layouts";
import { setSelectedSubLayout } from "../../../actions/subLayouts";
import {
  PageLayout,
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutWidgetType,
  SubLayout
} from "../../../generated/client";
import { ReduxActions, ReduxState } from "../../../store";
import styles from "../../../styles/common-properties-editor";
import DisplayMetrics from "../../../types/display-metrics";
import { constructTreeUpdateData, updateLayoutViewProperty } from "../utils/tree-data-utils";
import ButtonEditor from "./widget-editors/button-editor";
import FlowTextViewEditor from "./widget-editors/flow-text-view-editor";
import ImageViewEditor from "./widget-editors/image-view-editor";
import LinearLayoutEditor from "./widget-editors/linear-layout-editor";
import PlayerViewEditor from "./widget-editors/player-view-editor";
import TabLayoutEditor from "./widget-editors/tab-layout-editor";
import TextViewEditor from "./widget-editors/text-view-editor";
import TouchableOpacityEditor from "./widget-editors/touchable-opacity-editor";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  editingSubLayout: boolean;
  pageLayoutView: PageLayoutView;
  selectedElementPath: string;
  selectedWidgetType: PageLayoutWidgetType;
  pageLayout: PageLayout;
  subLayout: SubLayout;
  setSelectedLayout: typeof setSelectedLayout;
  setSelectedSubLayout: typeof setSelectedSubLayout;
  displayMetrics: DisplayMetrics;
  onPageLayoutViewUpdate: (pageLayoutView: PageLayoutView) => void;
}

/**
 * Interface representing component state
 */
interface State {
  layout?: PageLayout | SubLayout;
}

/**
 * Component for editing layout properties
 */
class LayoutWidgetSpecificPropertiesEditor extends React.Component<Props, State> {
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
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { editingSubLayout, pageLayout, subLayout } = this.props;

    this.setState({
      layout: editingSubLayout ? subLayout : pageLayout
    });
  };

  /**
   * Component did mount life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { pageLayout, subLayout, editingSubLayout } = this.props;
    if (
      JSON.stringify(prevProps.pageLayout) !== JSON.stringify(pageLayout) ||
      JSON.stringify(prevProps.subLayout) !== JSON.stringify(subLayout)
    ) {
      this.setState({
        layout: editingSubLayout ? subLayout : pageLayout
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { selectedWidgetType } = this.props;

    switch (selectedWidgetType) {
      case PageLayoutWidgetType.TextView:
        return this.renderTextViewEditor();
      case PageLayoutWidgetType.FlowTextView:
        return this.renderFlowTextViewEditor();
      case PageLayoutWidgetType.ImageView:
        return this.renderImageViewEditor();
      case PageLayoutWidgetType.MediaView:
      case PageLayoutWidgetType.PlayerView:
        return this.renderPlayerViewEditor();
      case PageLayoutWidgetType.Button:
        return this.renderButtonEditor();
      case PageLayoutWidgetType.LinearLayout:
        return this.renderLinearLayoutEditor();
      case PageLayoutWidgetType.MaterialTabLayout:
        return this.renderTabLayoutEditor();
      default:
        return <div />;
    }
  }

  /**
   * Render text view editor
   */
  private renderTextViewEditor = () => {
    const { pageLayoutView, displayMetrics } = this.props;

    return (
      <TextViewEditor
        pageLayoutView={pageLayoutView}
        displayMetrics={displayMetrics}
        onValueChange={this.onSinglePropertyValueChange}
      />
    );
  };

  /**
   * Render flow text view editor
   */
  private renderFlowTextViewEditor = () => {
    const { pageLayoutView, displayMetrics } = this.props;

    return (
      <FlowTextViewEditor
        pageLayoutView={pageLayoutView}
        displayMetrics={displayMetrics}
        onValueChange={this.onSinglePropertyValueChange}
      />
    );
  };

  /**
   * Render image view editor
   */
  private renderImageViewEditor = () => {
    const { pageLayoutView, displayMetrics } = this.props;

    return (
      <ImageViewEditor
        pageLayoutView={pageLayoutView}
        displayMetrics={displayMetrics}
        onValueChange={this.onSinglePropertyValueChange}
      />
    );
  };

  /**
   * Render player view editor
   */
  private renderPlayerViewEditor = () => {
    const { pageLayoutView, displayMetrics } = this.props;

    return (
      <PlayerViewEditor
        pageLayoutView={pageLayoutView}
        displayMetrics={displayMetrics}
        onValueChange={this.onSinglePropertyValueChange}
      />
    );
  };

  /**
   * Render button editor
   */
  private renderButtonEditor = () => {
    const { pageLayoutView, displayMetrics } = this.props;

    return (
      <ButtonEditor
        pageLayoutView={pageLayoutView}
        displayMetrics={displayMetrics}
        onValueChange={this.onSinglePropertyValueChange}
      />
    );
  };

  /**
   * Render touchable opacity editor
   */
  private renderTouchableOpacityEditor = () => {
    const { pageLayoutView, displayMetrics } = this.props;

    return (
      <TouchableOpacityEditor
        pageLayoutView={pageLayoutView}
        displayMetrics={displayMetrics}
        onValueChange={this.onSinglePropertyValueChange}
      />
    );
  };

  /**
   * Render linear layout editor
   */
  private renderLinearLayoutEditor = () => {
    const { pageLayoutView } = this.props;

    return (
      <LinearLayoutEditor
        pageLayoutView={pageLayoutView}
        onValueChange={this.onSinglePropertyValueChange}
      />
    );
  };

  /**
   * Render button editor
   */
  private renderTabLayoutEditor = () => {
    const { pageLayoutView, displayMetrics, pageLayout } = this.props;

    return (
      <TabLayoutEditor
        pageLayoutView={pageLayoutView}
        displayMetrics={displayMetrics}
        onValueChange={this.onSinglePropertyValueChange}
        onPageLayoutViewMetadataChange={this.onSingleMetadataValueChange}
        pageLayout={pageLayout}
      />
    );
  };

  /**
   * Generic handler for single page layout property value changes
   *
   * @param updatedPageLayoutView page layout view property object to update
   */
  private onSinglePropertyValueChange = (pageLayoutViewProperty: PageLayoutViewProperty) => {
    const { selectedElementPath, editingSubLayout, onPageLayoutViewUpdate } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutViewToUpdate = { ...this.props.pageLayoutView } as PageLayoutView;
    const updatedLayoutView = updateLayoutViewProperty(pageLayoutViewProperty, layoutViewToUpdate);
    const layoutToUpdate = constructTreeUpdateData(
      currentLayout,
      updatedLayoutView,
      selectedElementPath
    );
    editingSubLayout
      ? this.props.setSelectedSubLayout(layoutToUpdate)
      : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout: layoutToUpdate
    });

    onPageLayoutViewUpdate(updatedLayoutView);
  };

  /**
   * Generic handler for single page layout metadata value changes
   *
   * @param updatedPageLayoutView page layout view object to update
   */
  private onSingleMetadataValueChange = (updatedPageLayoutView: PageLayoutView) => {
    const { selectedElementPath, editingSubLayout, onPageLayoutViewUpdate } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutToUpdate = constructTreeUpdateData(
      currentLayout,
      updatedPageLayoutView,
      selectedElementPath
    );
    editingSubLayout
      ? this.props.setSelectedSubLayout(layoutToUpdate)
      : this.props.setSelectedLayout(layoutToUpdate);

    this.setState({ layout: layoutToUpdate });
    onPageLayoutViewUpdate(updatedPageLayoutView);
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    pageLayout: state.layouts.selectedLayout as PageLayout,
    subLayout: state.subLayouts.selectedSubLayout as SubLayout
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
    setSelectedSubLayout: (subLayout: SubLayout) => dispatch(setSelectedSubLayout(subLayout))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LayoutWidgetSpecificPropertiesEditor));
