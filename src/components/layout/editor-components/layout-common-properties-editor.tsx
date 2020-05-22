import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView, PageLayout } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, Typography, Divider, TextField } from "@material-ui/core";
import styles from "../../../styles/common-properties-editor";
import GenericPropertySelect from "./generic-property-select";
import MarginPaddingEditor from "./margin-padding-editor";
import GravityEditor from "./gravity-editor";
import { LayoutWidthValues, LayoutHeightValues } from "../editor-constants/values";
import { LayoutPropKeys, LayoutPaddingPropKeys, LayoutMarginPropKeys, LayoutInfoKeys } from "../editor-constants/keys";
import ColorPicker from "./color-picker";
import theme from "../../../styles/theme";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setSelectedLayout } from "../../../actions/layouts";
import { ReduxActions, ReduxState } from "../../../store";
import { constructTreeUpdateData, updateLayoutView, getProperty, getPaddingOrMarginProperties } from "../utils/tree-data-utils";
import GenericPropertyTextField from "./generic-property-textfield";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;
  selectedElementPath: string;
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
class CommonLayoutPropertiesEditor extends React.Component<Props, State> {

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

    return (
      <>
        { this.renderLayoutInfo() }
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
        <Typography variant="h3">{ strings.layoutEditor.commonComponents.layoutLabel }</Typography>
        { this.renderLayoutWidth() }
        { this.renderLayoutHeight() }
        { this.renderLayoutBackgroundColor() }
        <div style={{ display: "flex" }}>
          { this.renderLayoutPadding() }
          { this.renderLayoutMargin() }
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
        { this.renderLayoutGravity() }
      </>
    );
  }

  /**
   * Render layout width editor
   */
  private renderLayoutInfo = () => {

    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(1) }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.commonComponents.id }:
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            type="string"
            name={ LayoutInfoKeys.Id }
            value={ this.props.pageLayoutView.id }
            onChange={ this.onInfoValueChange }
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.commonComponents.widget }:
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            type="string"
            name={ LayoutInfoKeys.Widget }
            value={ this.props.pageLayoutView.widget }
            onChange={ this.onInfoValueChange }
          />
        </div>
      </div>
    );
  }

  /**
   * Render layout width editor
   */
  private renderLayoutWidth = () => {

    const foundProp = getProperty(this.props.pageLayoutView, LayoutPropKeys.LayoutWidth, PageLayoutViewPropertyType.String);
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(1) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="body2"
        >
          { strings.layoutEditor.commonComponents.layoutWidth }:
        </Typography>
        <GenericPropertySelect
          property={ foundProp }
          onSelectChange={ this.onSingleValueChange }
          selectItemType={ LayoutWidthValues }
        />
        <GenericPropertyTextField
          textFieldId={ LayoutPropKeys.LayoutWidth }
          textFieldType="number"
          textFieldUnit="dp"
          property={ foundProp }
          onTextFieldChange={ this.onSingleValueChange }
        />
      </div>
    );
  }

  /**
   * Render layout width editor
   */
  private renderLayoutHeight = () => {
    const foundProp = getProperty(this.props.pageLayoutView, LayoutPropKeys.LayoutHeight, PageLayoutViewPropertyType.String);

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="body2"
        >
          { strings.layoutEditor.commonComponents.layoutHeight }:
        </Typography>
        <GenericPropertySelect
          property={ foundProp }
          onSelectChange={ this.onSingleValueChange }
          selectItemType={ LayoutHeightValues }
        />
        <GenericPropertyTextField
          textFieldId={ LayoutPropKeys.LayoutHeight }
          textFieldType="number"
          textFieldUnit="dp"
          property={ foundProp }
          onTextFieldChange={ this.onSingleValueChange }
        />
      </div>
    );
  }

  /**
   * Render layout background color editor
   */
  private renderLayoutBackgroundColor = () => {
    const { classes } = this.props;
    const foundProp = getProperty(this.props.pageLayoutView, LayoutPropKeys.LayoutBackgroundColor, PageLayoutViewPropertyType.Color);
    return (
      <div className={ classes.backgroundPickerContainer }>
        <Typography variant="body2">{ strings.layoutEditor.commonComponents.backgroundColor }:</Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <ColorPicker
            property={ foundProp }
            onColorChange={ this.onSingleValueChange }
          />
          <div style={{ marginLeft: theme.spacing(2) }}>
            <GenericPropertyTextField
              textFieldId={ LayoutPropKeys.LayoutBackgroundColor }
              textFieldType="text"
              property={ foundProp }
              onTextFieldChange={ this.onSingleValueChange }
            />
          </div>
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </div>
    );
  }

  /**
   * Render layout padding editor
   */
  private renderLayoutPadding = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h4">{ strings.layoutEditor.commonComponents.paddings.title }</Typography>
        <MarginPaddingEditor
          itemKey="layout_padding"
          properties={ getPaddingOrMarginProperties(this.props.pageLayoutView, LayoutPaddingPropKeys) }
          onSingleValueChange={ this.onSingleValueChange }
          onMultipleValueChange={ this.onMultipleValueChange }
        />
      </div>
    );
  }

  /**
   * Render layout margin editor
   */
  private renderLayoutMargin = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h4">{ strings.layoutEditor.commonComponents.margins.title }</Typography>
        <MarginPaddingEditor
          itemKey="layout_margin"
          properties={ getPaddingOrMarginProperties(this.props.pageLayoutView, LayoutMarginPropKeys) }
          onSingleValueChange={ this.onSingleValueChange }
          onMultipleValueChange={ this.onMultipleValueChange }
        />
      </div>
    );
  }

  /**
   * Render layout gravity editor
   */
  private renderLayoutGravity = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Typography variant="h4">{ strings.layoutEditor.commonComponents.layoutGravity }</Typography>
        <GravityEditor
          property={ getProperty(this.props.pageLayoutView, LayoutPropKeys.LayoutGravity, PageLayoutViewPropertyType.String) }
          onSingleValueChange={ this.onSingleValueChange }
        />
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </div>
    );
  }

  /**
   * Generic handler for single page layout property value changes
   * @param updatedPageLayoutView page layout view property object to update
   */
  private onInfoValueChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedElementPath } = this.props;
    const currentPageLayout = { ...this.props.pageLayout } as PageLayout;

    const key = event.target.name;
    const value = event.target.value;

    if (!key || ! value) {
      return;
    }

    const layoutViewToUpdate = { ...this.props.pageLayoutView, [key]: value } as PageLayoutView;
    const pageLayoutToUpdate = constructTreeUpdateData(currentPageLayout, layoutViewToUpdate, selectedElementPath);
    this.props.setSelectedLayout(pageLayoutToUpdate);
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

  /**
   * Generic handler for multiple page layout property value changes
   * @param updatedPageLayoutViews list of page layout view property objects to update
   */
  private onMultipleValueChange = (updatedPageLayoutViews: PageLayoutViewProperty[]) => {
    const { selectedElementPath } = this.props;
    const currentPageLayout = { ...this.props.pageLayout } as PageLayout;
    const layoutViewToUpdate = { ...this.props.pageLayoutView } as PageLayoutView;

    updatedPageLayoutViews.forEach(updatedPageLayoutView => {
      updateLayoutView(updatedPageLayoutView, layoutViewToUpdate);
    });

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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CommonLayoutPropertiesEditor));