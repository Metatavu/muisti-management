import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView } from "../../../../generated/client";
import strings from "../../../../localization/strings";
import { WithStyles, withStyles, Typography, Divider } from "@material-ui/core";
import styles from "../../../../styles/common-properties-editor";
import { LayoutTabPropKeys } from "../../editor-constants/keys";
import ColorPicker from "../color-picker";
import theme from "../../../../styles/theme";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertyTextField from "../generic-property-textfield";
import GravityEditor from "../gravity-editor";
import GenericPropertySwitch from "../generic-property-switch";
import { TabModeValues, TabGravityValues, SelectedTabIndicatorGravityValues } from "../../editor-constants/values";
import GenericPropertyCheckbox from "../generic-property-checkbox";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;

  /**
   * On value change handler
   *
   * @param updatedPageLayoutView updated page layout view object
   */
  onValueChange: (updatedPageLayoutView: PageLayoutViewProperty) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for editing tab layout properties
 */
class TabLayoutEditor extends React.Component<Props, State> {

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
        { this.renderTabMode() }
        { this.renderTabGravity() }
        { this.renderSelectedTabIndicatorColor() }
        { this.renderSelectedTabIndicatorGravity() }
        { this.renderSelectedTabIndicatorHeight() }
        { this.renderTabTextColorNormal() }
        { this.renderTabTextColorSelected() }
        { this.renderUnboundedRipple() }
        { this.renderTabIndicatorFullWidth() }
      </>
    );
  }

  /**
   * Render tab mode editor
   */
  private renderTabMode = () => {
    const { onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.TabMode, PageLayoutViewPropertyType.String);

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h6"
          >
            { strings.layoutEditor.tab.mode.title }:
          </Typography>
          <div style={{ flexGrow: 0 }}>
            <GenericPropertySwitch
              switchId={ LayoutTabPropKeys.TabMode }
              property={ foundProp }
              switchOptions={ [ TabModeValues.Scrollable, TabModeValues.Fixed ] }
              onSwitchChange={ onValueChange }
            />
          </div>
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render tab gravity editor
   */
  private renderTabGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.TabGravity, PageLayoutViewPropertyType.Color);

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h6"
          >
            { strings.layoutEditor.tab.gravity.title }:
          </Typography>
          <GravityEditor
            property={ foundProp }
            onSingleValueChange={ onValueChange }
            gravityOptions={ TabGravityValues }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render selected tab indicator color editor
   */
  private renderSelectedTabIndicatorColor = () => {
    const { onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.SelectedTabIndicatorColor, PageLayoutViewPropertyType.Color);

    return (
      <>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.tab.selectedIndicatorColor }:
        </Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker
              property={ foundProp }
              onColorChange={ onValueChange }
            />
          </div>
          <GenericPropertyTextField
            textFieldId={ LayoutTabPropKeys.SelectedTabIndicatorColor }
            textFieldType="text"
            property={ foundProp }
            onTextFieldChange={ onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render selected tab indicator gravity editor
   */
  private renderSelectedTabIndicatorGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.SelectedTabIndicatorGravity, PageLayoutViewPropertyType.Color);

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h6"
          >
            { strings.layoutEditor.tab.selectedIndicatorGravity.title }:
          </Typography>
          <GravityEditor
            property={ foundProp }
            onSingleValueChange={ onValueChange }
            gravityOptions={ SelectedTabIndicatorGravityValues }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render selected tab indication height editor
   */
  private renderSelectedTabIndicatorHeight = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.SelectedTabIndicatorHeight, PageLayoutViewPropertyType.String);

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h6"
          >
            { strings.layoutEditor.tab.selectedIndicatorHeight }:
          </Typography>
          <GenericPropertyTextField
            textFieldId={ LayoutTabPropKeys.SelectedTabIndicatorHeight }
            textFieldType="number"
            textFieldUnit="dp"
            property={ foundProp }
            onTextFieldChange={ onValueChange }
          />
          <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>px</Typography>
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render tab text color editor
   */
  private renderTabTextColorNormal = () => {
    const { onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.TabTextColorNormal, PageLayoutViewPropertyType.Color);

    return (
      <>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.tab.textColorNormal }:
        </Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker
              property={ foundProp }
              onColorChange={ onValueChange }
            />
          </div>
          <GenericPropertyTextField
            textFieldId={ LayoutTabPropKeys.TabTextColorNormal }
            textFieldType="text"
            property={ foundProp }
            onTextFieldChange={ onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render selected tab text color editor
   */
  private renderTabTextColorSelected = () => {
    const { onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.TabTextColorSelected, PageLayoutViewPropertyType.Color);

    return (
      <>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.tab.textColorSelected }:
        </Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker
              property={ foundProp }
              onColorChange={ onValueChange }
            />
          </div>
          <GenericPropertyTextField
            textFieldId={ LayoutTabPropKeys.TabTextColorSelected }
            textFieldType="text"
            property={ foundProp }
            onTextFieldChange={ onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render unbounded ripple editor
   */
  private renderUnboundedRipple = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.UnboundedRipple, PageLayoutViewPropertyType.Boolean);

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h6"
          >
            { strings.layoutEditor.tab.unboundedRipple }:
          </Typography>
          <GenericPropertyCheckbox
            property={ foundProp }
            onCheckboxChange={ onValueChange }
          />
          
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render tab indicator full width editor
   */
  private renderTabIndicatorFullWidth = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.TabIndicatorFullWidth, PageLayoutViewPropertyType.Boolean);

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h6"
          >
            { strings.layoutEditor.tab.tabIndicatorFullWidth }:
          </Typography>
          <GenericPropertyCheckbox
            property={ foundProp }
            onCheckboxChange={ onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

}

export default (withStyles(styles)(TabLayoutEditor));