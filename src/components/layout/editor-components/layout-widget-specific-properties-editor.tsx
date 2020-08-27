import * as React from "react";
import { PageLayoutViewProperty, PageLayoutView, PageLayout, PageLayoutWidgetType, SubLayout } from "../../../generated/client";
import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../../styles/common-properties-editor";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setSelectedLayout } from "../../../actions/layouts";
import { ReduxActions, ReduxState } from "../../../store";
import { constructTreeUpdateData, updateLayoutViewProperty } from "../utils/tree-data-utils";

import TextViewEditor from "./widget-editors/text-view-editor";
import FlowTextViewEditor from "./widget-editors/flow-text-view-editor";
import ImageViewEditor from "./widget-editors/image-view-editor";
import ButtonEditor from "./widget-editors/button-editor";
import LinearLayoutEditor from "./widget-editors/linear-layout-editor";
import TabLayoutEditor from "./widget-editors/tab-layout-editor";
import { setSelectedSubLayout } from "../../../actions/subLayouts";

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
    this.state = {
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { editingSubLayout, pageLayout, subLayout } = this.props;

    this.setState({
      layout: editingSubLayout ? subLayout : pageLayout
    });
  }

  /**
   * Component did mount life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { pageLayout, subLayout, editingSubLayout } = this.props;
    if (
      JSON.stringify(prevProps.pageLayout) !== JSON.stringify(pageLayout) ||
      JSON.stringify(prevProps.subLayout) !== JSON.stringify(subLayout))
    {
      this.setState({
        layout: editingSubLayout ? subLayout : pageLayout
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const editorToRender = this.getCorrectEditorForSelectedType();
    return (
      <>
        { editorToRender }
      </>
    );
  }

  /**
   * TODO: Widget type should be changed to enum in spec.
   * Get correct editor for selected page layout element type
   */
  private getCorrectEditorForSelectedType = () => {
    const { selectedWidgetType } = this.props;

    switch (selectedWidgetType) {
      case (PageLayoutWidgetType.TextView):
        return this.renderTextViewEditor();
      case (PageLayoutWidgetType.FlowTextView):
        return this.renderFlowTextViewEditor();
      case (PageLayoutWidgetType.ImageView):
      case (PageLayoutWidgetType.MediaView):
      case (PageLayoutWidgetType.PlayerView):
        return this.renderImageViewEditor();
      case (PageLayoutWidgetType.Button):
        return this.renderButtonEditor();
      case (PageLayoutWidgetType.LinearLayout):
        return this.renderLinearLayoutEditor();
      case (PageLayoutWidgetType.MaterialTabLayout):
        return this.renderTabLayoutEditor();
      default:
        return (<div/>);
    }
  }

  /**
   * Render text view editor
   */
  private renderTextViewEditor = () => {
    return (
      <TextViewEditor
        pageLayoutView={ this.props.pageLayoutView }
        onValueChange={ this.onSingleValueChange }
      />
    );
  }

  /**
   * Render flow text view editor
   */
  private renderFlowTextViewEditor = () => {
    return (
      <FlowTextViewEditor
        pageLayoutView={ this.props.pageLayoutView }
        onValueChange={ this.onSingleValueChange }
      />
    );
  }

  /**
   * Render image view editor
   */
  private renderImageViewEditor = () => {
    return (
      <ImageViewEditor
        pageLayoutView={ this.props.pageLayoutView }
        onValueChange={ this.onSingleValueChange }
      />
    );
  }

  /**
   * Render button editor
   */
  private renderButtonEditor = () => {
    return (
      <ButtonEditor
        pageLayoutView={ this.props.pageLayoutView }
        onValueChange={ this.onSingleValueChange }
      />
    );
  }

  /**
   * Render linear layout editor
   */
  private renderLinearLayoutEditor = () => {
    return (
      <LinearLayoutEditor
        pageLayoutView={ this.props.pageLayoutView }
        onValueChange={ this.onSingleValueChange }
      />
    );
  }

  /**
   * Render button editor
   */
  private renderTabLayoutEditor = () => {
    return (
      <TabLayoutEditor
        pageLayoutView={ this.props.pageLayoutView }
        onValueChange={ this.onSingleValueChange }
      />
    );
  }

  /**
   * Generic handler for single page layout property value changes
   *
   * @param updatedPageLayoutView page layout view property object to update
   */
  private onSingleValueChange = (pageLayoutViewProperty: PageLayoutViewProperty) => {
    const { selectedElementPath, editingSubLayout } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutViewToUpdate = { ...this.props.pageLayoutView } as PageLayoutView;
    const updatedLayoutView = updateLayoutViewProperty(pageLayoutViewProperty, layoutViewToUpdate);
    const layoutToUpdate = constructTreeUpdateData(currentLayout, updatedLayoutView, selectedElementPath);
    editingSubLayout ? this.props.setSelectedSubLayout(layoutToUpdate) : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout : layoutToUpdate
    });
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutWidgetSpecificPropertiesEditor));
