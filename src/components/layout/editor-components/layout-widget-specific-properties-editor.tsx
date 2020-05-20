import * as React from "react";
import { PageLayoutViewProperty, PageLayoutView, PageLayout } from "../../../generated/client";
import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../../styles/common-properties-editor";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setSelectedLayout } from "../../../actions/layouts";
import { ReduxActions, ReduxState } from "../../../store";
import { constructTreeUpdateData, updateLayoutView } from "../utils/tree-data-utils";
import { PageLayoutElementType } from "../../../types";

import TextViewEditor from "./widget-editors/text-view-editor";
import FlowTextViewEditor from "./widget-editors/flow-text-view-editor";
import ImageViewEditor from "./widget-editors/image-view-editor";
import ButtonEditor from "./widget-editors/button-editor";
import LinearLayoutEditor from "./widget-editors/linear-layout-editor";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;
  selectedElementPath: string;
  selectedWidgetType: PageLayoutElementType;
  pageLayout: PageLayout;
  setSelectedLayout: typeof setSelectedLayout;
}

/**
 * Interface representing component state
 */
interface State {
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
      case (PageLayoutElementType.TEXTVIEW):
        return this.renderTextViewEditor();
      case (PageLayoutElementType.FLOWTEXTVIEW):
        return this.renderFlowTextViewEditor();
      case (PageLayoutElementType.IMAGEVIEW):
      case (PageLayoutElementType.MEDIAVIEW):
      case (PageLayoutElementType.PLAYERVIEW):
        return this.renderImageViewEditor();
      case (PageLayoutElementType.BUTTON):
        return this.renderButtonEditor();
      case (PageLayoutElementType.LINEARLAYOUT):
        return this.renderLinearLayoutEditor();
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
   * Generic handler for single page layout property value changes
   * @param updatedPageLayoutView page layout view property object to update
   */
  private onSingleValueChange = (updatedPageLayoutView: PageLayoutViewProperty) => {
    const { selectedElementPath } = this.props;
    const currentPageLayout = { ...this.props.pageLayout } as PageLayout;
    const layoutViewToUpdate = { ...this.props.pageLayoutView } as PageLayoutView;
    updateLayoutView(updatedPageLayoutView, layoutViewToUpdate);
    const pageLayoutToUpdate = constructTreeUpdateData(currentPageLayout, layoutViewToUpdate, selectedElementPath);
    this.props.setSelectedLayout(pageLayoutToUpdate);
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutWidgetSpecificPropertiesEditor));