import * as React from "react";
import { ExhibitionDevice, ScreenOrientation, DeviceModel, PageLayout, PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, Typography, Grid, Divider } from "@material-ui/core";
import styles from "../../../styles/common-properties-editor";
import { ReduxActions, ReduxState } from "../../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import GenericPropertySelect from "./generic-property-select";
import MarginPaddingEditor from "./margin-padding-editor";
import GravityEditor from "./gravity-editor";
import { LayoutWidthValues, LayoutHeightValues } from "../editor-constants/values";
import { LayoutPropKeys, LayoutPaddingPropKeys, LayoutMarginPropKeys } from "../editor-constants/keys";

import ColorPicker from "./color-picker";
import theme from "../../../styles/theme";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;
  onLayoutPropertyChange: (layout: PageLayoutView) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for add device editor
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

  public componentDidMount = () => {
  }

  public componentDidUpdate = (prevProps: Props) => {
    // if (prevProps.pageLayout !== this.props.pageLayout) {
    // }
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
        { this.renderLayoutGravity() }
      </>
    );
  }

  private renderLayoutWidth = () => {
    return (
      <>
        <Typography variant="h4">{ strings.layoutEditor.commonComponents.layoutWidth }</Typography>
        <GenericPropertySelect
          property={ this.getProperty(LayoutPropKeys.LayoutWidth, PageLayoutViewPropertyType.String) }
          onSelectChange={ this.onSingleValueChange }
          selectItemType={ LayoutWidthValues }
        />
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />
      </>
    );
  }

  private renderLayoutHeight = () => {
    return (
      <>
        <Typography variant="h4">{ strings.layoutEditor.commonComponents.layoutHeight }</Typography>
        <GenericPropertySelect
          property={ this.getProperty(LayoutPropKeys.LayoutHeight, PageLayoutViewPropertyType.String) }
          onSelectChange={ this.onSingleValueChange }
          selectItemType={ LayoutHeightValues }
        />
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />
      </>
    );
  }

  private renderLayoutBackgroundColor = () => {
    const { classes } = this.props;
    return (
      <div className={ classes.backgroundPickerContainer }>
        <Typography variant="h4">{ strings.layoutEditor.commonComponents.backgroundColor }</Typography>
        <ColorPicker
          property={ this.getProperty(LayoutPropKeys.LayoutBackgroundColor, PageLayoutViewPropertyType.Color) }
          onColorChange={ this.onSingleValueChange }
        />
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />
      </div>
    );
  }

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

  private renderLayoutGravity = () => {
    return (
      <>
        <Typography variant="h4">{ strings.layoutEditor.commonComponents.layoutGravity }</Typography>
        <GravityEditor
          property={ this.getProperty(LayoutPropKeys.LayoutGravity, PageLayoutViewPropertyType.String) }
          onSingleValueChange={ this.onSingleValueChange }
        />
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />
      </>
    );
  }

  /**
   * Generic handler for page layout property value changes
   */
  private onSingleValueChange = (updatedPageLayoutView: PageLayoutViewProperty) => {
    const { onLayoutPropertyChange, pageLayoutView } = this.props;
    const layoutViewToUpdate = JSON.parse(JSON.stringify(pageLayoutView)) as PageLayoutView;
    this.doUpdate(updatedPageLayoutView, layoutViewToUpdate);
    onLayoutPropertyChange(layoutViewToUpdate);
  }

  /**
   * Generic handler for page layout property value changes
   */
  private onMultipleValueChange = (updatedPageLayoutViews: PageLayoutViewProperty[]) => {
    const { onLayoutPropertyChange, pageLayoutView } = this.props;
    const layoutViewToUpdate = JSON.parse(JSON.stringify(pageLayoutView)) as PageLayoutView;

    updatedPageLayoutViews.forEach(updatedPageLayoutView => {
      this.doUpdate(updatedPageLayoutView, layoutViewToUpdate);
    });
    onLayoutPropertyChange(layoutViewToUpdate);
  }

  /**
   * Generic handler for page layout property value changes
   * @param key property key to update
   * @returns empty string or found value
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

  private doUpdate(updatedPageLayoutView: PageLayoutViewProperty, layoutViewToUpdate: PageLayoutView): PageLayoutView {
    const name = updatedPageLayoutView.name;
    const value = updatedPageLayoutView.value;
    const type = updatedPageLayoutView.type;

    const foundIndex = layoutViewToUpdate.properties.findIndex(data => data.name === updatedPageLayoutView.name);
    if (foundIndex < 0) {
      const propertyToCreate: PageLayoutViewProperty = {
        name: name,
        value: value,
        type: type
      };
      layoutViewToUpdate.properties.push(propertyToCreate);
    }
    else {
      const propToUpdate = { ...layoutViewToUpdate.properties[foundIndex] };
      propToUpdate.value = value;
      layoutViewToUpdate.properties.splice(foundIndex, 1, propToUpdate);
    }
    return layoutViewToUpdate;
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return { };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CommonLayoutPropertiesEditor));