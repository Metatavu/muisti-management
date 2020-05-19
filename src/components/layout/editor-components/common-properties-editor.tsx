import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView, PageLayout } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, Typography, Divider } from "@material-ui/core";
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
import { constructTreeUpdateData, updateLayoutView } from "../utils/tree-data-utils";

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
  private renderLayoutWidth = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.commonComponents.layoutWidth }:
          </Typography>
          <GenericPropertySelect
            property={ this.getProperty(LayoutPropKeys.LayoutWidth, PageLayoutViewPropertyType.String) }
            onSelectChange={ this.onSingleValueChange }
            selectItemType={ LayoutWidthValues }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render layout width editor
   */
  private renderLayoutHeight = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.commonComponents.layoutHeight }:
          </Typography>
          <GenericPropertySelect
            property={ this.getProperty(LayoutPropKeys.LayoutHeight, PageLayoutViewPropertyType.String) }
            onSelectChange={ this.onSingleValueChange }
            selectItemType={ LayoutHeightValues }
          />
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
    return (
      <div className={ classes.backgroundPickerContainer }>
        <Typography variant="h4">{ strings.layoutEditor.commonComponents.backgroundColor }</Typography>
        <ColorPicker
          property={ this.getProperty(LayoutPropKeys.LayoutBackgroundColor, PageLayoutViewPropertyType.Color) }
          onColorChange={ this.onSingleValueChange }
        />
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
          properties={ this.getPaddingOrMarginProperties(LayoutPaddingPropKeys) }
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
          properties={ this.getPaddingOrMarginProperties(LayoutMarginPropKeys) }
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
          property={ this.getProperty(LayoutPropKeys.LayoutGravity, PageLayoutViewPropertyType.String) }
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

  /**
   * Find property with given key
   * @param key property to find
   * @param type page layout view property type
   * @returns Found property or new property to be modified
   */
  private getProperty = (key: string, type: PageLayoutViewPropertyType): PageLayoutViewProperty => {
    const { pageLayoutView } = this.props;
    const layoutProps = pageLayoutView.properties;
    const foundIndex = layoutProps.findIndex(prop => prop.name === key);
    if (foundIndex < 0) {
      const createdSingleProperty: PageLayoutViewProperty = {
        name: key,
        value: "",
        type: type
      };
      return createdSingleProperty;
    }
    return layoutProps[foundIndex];
  }

  /**
   * Get padding and margin properties
   * @param enumObject enum object that is used to find/generate property
   * @returns list of page layout view properties
   */
  private getPaddingOrMarginProperties = (enumObject: typeof LayoutPaddingPropKeys | typeof LayoutMarginPropKeys): PageLayoutViewProperty[] => {
    const { pageLayoutView } = this.props;
    const propertyList: PageLayoutViewProperty[] = [];
    const values = Object.values(enumObject);

    values.forEach(valueKey => {
      const foundProp = pageLayoutView.properties.find(prop => prop.name === valueKey);
      if (foundProp) {
        propertyList.push(foundProp);
      } else {
        const newProp: PageLayoutViewProperty = {
          name: valueKey,
          type: PageLayoutViewPropertyType.String,
          value: "0dp"
        };
        propertyList.push(newProp);
      }
    });

    return propertyList;
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