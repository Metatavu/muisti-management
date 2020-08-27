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
import { LayoutModeValues } from "../../editor-constants/values";

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
        { this.renderTabTextColorNormal() }
        { this.renderTabTextColorSelected() }
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
            variant="h4"
          >
            { strings.layoutEditor.tab.mode.title }:
          </Typography>
          <GenericPropertySwitch
            switchId={ LayoutTabPropKeys.TabMode }
            property={ foundProp }
            switchOptions={ [LayoutModeValues.Scrollable, LayoutModeValues.Fixed] }
            onSwitchChange={ onValueChange }
          />
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
      <div>
        <Typography variant="h6">{ strings.layoutEditor.tab.gravity.title }</Typography>
        <GravityEditor
          property={ foundProp }
          onSingleValueChange={ onValueChange }
        />
      </div>
    );
  }

  /**
   * Render selected tab indicator color editor
   */
  private renderSelectedTabIndicatorColor = () => {
    const { classes, onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.SelectedTabIndicatorColor, PageLayoutViewPropertyType.Color);

    return (
      <div className={ classes.colorPickerContainer }>
        <Typography variant="h4">{ strings.layoutEditor.tab.selectedIndicatorColor }:</Typography>
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
      </div>
    );
  }

  /**
   * Render selected tab indicator gravity editor
   */
  private renderSelectedTabIndicatorGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.SelectedTabIndicatorGravity, PageLayoutViewPropertyType.Color);

    return (
      <div>
        <Typography variant="h6">{ strings.layoutEditor.tab.selectedIndicatorGravity.title }</Typography>
        <GravityEditor
          property={ foundProp }
          onSingleValueChange={ onValueChange }
        />
      </div>
    );
  }

  /**
   * Render tab text color editor
   */
  private renderTabTextColorNormal = () => {
    const { classes, onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.TabTextColorNormal, PageLayoutViewPropertyType.Color);

    return (
      <div className={ classes.colorPickerContainer }>
        <Typography variant="h4">{ strings.layoutEditor.tab.textColorNormal }:</Typography>
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
      </div>
    );
  }

  /**
   * Render selected tab text color editor
   */
  private renderTabTextColorSelected = () => {
    const { classes, onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutTabPropKeys.TabTextColorSelected, PageLayoutViewPropertyType.Color);

    return (
      <div className={ classes.colorPickerContainer }>
        <Typography variant="h4">{ strings.layoutEditor.tab.textColorSelected }:</Typography>
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
      </div>
    );
  }
}

export default (withStyles(styles)(TabLayoutEditor));