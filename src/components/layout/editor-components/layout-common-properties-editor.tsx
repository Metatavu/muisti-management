import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView, PageLayout, SubLayout } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, Typography, Divider, TextField } from "@material-ui/core";
import styles from "../../../styles/common-properties-editor";
import GenericPropertySelect from "./generic-property-select";
import MarginPaddingEditor from "./margin-padding-editor";
import GravityEditor from "./gravity-editor";
import { LayoutWidthValues, LayoutHeightValues } from "../editor-constants/values";
import { LayoutPropKeys, LayoutPaddingPropKeys, LayoutMarginPropKeys } from "../editor-constants/keys";
import ColorPicker from "./color-picker";
import theme from "../../../styles/theme";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { setSelectedLayout } from "../../../actions/layouts";
import { ReduxActions, ReduxState } from "../../../store";
import { constructTreeUpdateData, updateLayoutViewProperty, removeLayoutViewProperty, hasProperty, getProperty, getPaddingOrMarginProperties } from "../utils/tree-data-utils";
import GenericPropertyTextField from "./generic-property-textfield";
import GenericPropertyEnabledCheckbox from "./generic-property-enabled-checkbox";
import { setSelectedSubLayout } from "../../../actions/subLayouts";
import { v4 as uuid } from "uuid";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  editingSubLayout: boolean;
  pageLayoutView: PageLayoutView;
  selectedElementPath: string;
  pageLayout: PageLayout;
  subLayout: SubLayout;
  setSelectedLayout: typeof setSelectedLayout;
  setSelectedSubLayout: typeof setSelectedSubLayout;

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
    return (
      <>
        { this.renderName() }
        { this.renderLayoutWidth() }
        { this.renderLayoutHeight() }
        { this.renderLayoutBackgroundColor() }
        { this.renderBackgroundImage() }
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
   * Render layout name editor
   */
  private renderName = () => {
    const { pageLayoutView } = this.props;

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(2) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.commonComponents.name }:
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            variant="filled"
            type="text"
            name="name"
            value={ (pageLayoutView && pageLayoutView.name) ? pageLayoutView.name : "" }
            onChange={ this.onNameChange }
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(2) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.commonComponents.layoutWidth }:
        </Typography>
        <div style={{ marginRight: theme.spacing(1) }}>
          <GenericPropertySelect
            property={ foundProp }
            onSelectChange={ this.onSingleValueChange }
            selectItemType={ LayoutWidthValues }
            />
        </div>
        <Typography variant="h6" style={{ marginRight: theme.spacing(1) }}>{ strings.generic.or }</Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <GenericPropertyTextField
            textFieldId={ LayoutPropKeys.LayoutWidth }
            textFieldType="number"
            textFieldUnit="dp"
            property={ foundProp }
            onTextFieldChange={ this.onSingleValueChange }
            />
          <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>px</Typography>
        </div>
      </div>
    );
  }

  /**
   * Render layout width editor
   */
  private renderLayoutHeight = () => {
    const foundProp = getProperty(this.props.pageLayoutView, LayoutPropKeys.LayoutHeight, PageLayoutViewPropertyType.String);

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h6"
          >
            { strings.layoutEditor.commonComponents.layoutHeight }:
          </Typography>
          <div style={{ marginRight: theme.spacing(1) }}>
            <GenericPropertySelect
              property={ foundProp }
              onSelectChange={ this.onSingleValueChange }
              selectItemType={ LayoutHeightValues }
            />
          </div>
          <Typography variant="h6" style={{ marginRight: theme.spacing(1) }}>{ strings.generic.or }</Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <GenericPropertyTextField
              textFieldId={ LayoutPropKeys.LayoutHeight }
              textFieldType="number"
              textFieldUnit="dp"
              property={ foundProp }
              onTextFieldChange={ this.onSingleValueChange }
              />
            <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>px</Typography>
          </div>
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render layout background color editor
   */
  private renderLayoutBackgroundColor = () => {
    const { classes } = this.props;
    const foundProp = getProperty(this.props.pageLayoutView, LayoutPropKeys.LayoutBackgroundColor, PageLayoutViewPropertyType.Color);
    return (
      <div className={ classes.colorPickerContainer }>
        <Typography variant="h6">{ strings.layoutEditor.commonComponents.backgroundColor }</Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker
              property={ foundProp }
              onColorChange={ this.onSingleValueChange }
              />
          </div>
          <GenericPropertyTextField
            textFieldId={ LayoutPropKeys.LayoutBackgroundColor }
            textFieldType="text"
            property={ foundProp }
            onTextFieldChange={ this.onSingleValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </div>
    );
  }

  /**
   * Render button background image resource editor
   */
  private renderBackgroundImage = () => {
    const { pageLayoutView } = this.props;

    const hasBackgroundImage = hasProperty(pageLayoutView, LayoutPropKeys.BackgroundImage, PageLayoutViewPropertyType.String);

    return (
      <>
        <Typography
          display="inline"
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h4"
        >
          { strings.layoutEditor.commonComponents.hasBackgroundImage }:
        </Typography>
        <GenericPropertyEnabledCheckbox
          propertyName={ LayoutPropKeys.BackgroundImage }
          enabled={ hasBackgroundImage }
          onCheckboxChange={ this.onToggleProperty }
        />
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render layout padding editor
   */
  private renderLayoutPadding = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">{ strings.layoutEditor.commonComponents.paddings.title }</Typography>
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
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">{ strings.layoutEditor.commonComponents.margins.title }</Typography>
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
        <Typography variant="h6">{ strings.layoutEditor.commonComponents.layoutGravity }</Typography>
        <GravityEditor
          property={ getProperty(this.props.pageLayoutView, LayoutPropKeys.LayoutGravity, PageLayoutViewPropertyType.String) }
          onSingleValueChange={ this.onSingleValueChange }
        />
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </div>
    );
  }

  /**
   * On name change handler
   *
   * @param event react text field event 
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedElementPath, editingSubLayout, onPageLayoutViewUpdate } = this.props;
    const { layout } = this.state;

    const key = event.target.name;
    const value = event.target.value;

    if (!layout || !key) {
      return;
    }

    const layoutView = { ...this.props.pageLayoutView, [key] : value } as PageLayoutView;
    const tempLayout = { ...layout } as PageLayout | SubLayout;
    const layoutToUpdate = constructTreeUpdateData(tempLayout, layoutView, selectedElementPath);
    editingSubLayout ? this.props.setSelectedSubLayout(layoutToUpdate) : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout : layoutToUpdate,
    });

    onPageLayoutViewUpdate(layoutView);
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

    const layoutView = { ...this.props.pageLayoutView } as PageLayoutView;
    const updatedLayoutView = updateLayoutViewProperty(pageLayoutViewProperty, layoutView);
    const layoutToUpdate = constructTreeUpdateData(currentLayout, updatedLayoutView, selectedElementPath);
    editingSubLayout ? this.props.setSelectedSubLayout(layoutToUpdate) : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout : layoutToUpdate
    });
  }

  /**
   * Generic handler for single page layout property value removals
   * 
   * @param layoutPropertyKey layout property key
   */
  private onSingleValueRemove = (layoutPropertyKey: LayoutPropKeys) => {
    const { selectedElementPath, editingSubLayout } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutView = { ...this.props.pageLayoutView } as PageLayoutView;
    const updatedLayoutView = removeLayoutViewProperty(layoutPropertyKey, layoutView);
    const layoutToUpdate = constructTreeUpdateData(currentLayout, updatedLayoutView, selectedElementPath);
    editingSubLayout ? this.props.setSelectedSubLayout(layoutToUpdate) : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout : layoutToUpdate
    });
  }

  /**
   * Generic handler for multiple page layout property value changes
   *
   * @param updatedPageLayoutViews list of page layout view property objects to update
   */
  private onMultipleValueChange = (pageLayoutViewProperties: PageLayoutViewProperty[]) => {
    const { selectedElementPath } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutViewToUpdate = { ...this.props.pageLayoutView } as PageLayoutView;

    pageLayoutViewProperties.forEach(property => {
      updateLayoutViewProperty(property, layoutViewToUpdate);
    });

    const layoutToUpdate = constructTreeUpdateData(currentLayout, layoutViewToUpdate, selectedElementPath);
    this.props.setSelectedSubLayout(layoutToUpdate);
    this.setState({
      layout : layoutToUpdate
    });
  }

  /**
   * Event handler for toggle property
   * 
   * @param layoutPropertyKey layout property key
   * @param enabled is property enabled
   */
  private onToggleProperty = (layoutPropertyKey: LayoutPropKeys, enabled: boolean) => {
    if (enabled) {
      switch (layoutPropertyKey) {
        case LayoutPropKeys.BackgroundImage:
          this.onSingleValueChange({
            name: "backgroundImage",
            type: PageLayoutViewPropertyType.String,
            value: `@resources/${uuid()}`
          });
        break;
        default:
        break;
      }
    } else {
      this.onSingleValueRemove(layoutPropertyKey);
    }
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
    subLayout: state.subLayouts.selectedSubLayout as SubLayout,
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
    setSelectedSubLayout: (subLayout: SubLayout) => dispatch(setSelectedSubLayout(subLayout)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CommonLayoutPropertiesEditor));
