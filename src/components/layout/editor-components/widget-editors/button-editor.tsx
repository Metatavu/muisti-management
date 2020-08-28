import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView } from "../../../../generated/client";
import strings from "../../../../localization/strings";
import { WithStyles, withStyles, Typography, Divider } from "@material-ui/core";
import styles from "../../../../styles/common-properties-editor";
import GenericPropertySelect from "../generic-property-select";
import { TextViewTextStyleValues } from "../../editor-constants/values";
import { LayoutButtonPropKeys } from "../../editor-constants/keys";
import ColorPicker from "../color-picker";
import theme from "../../../../styles/theme";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertyTextField from "../generic-property-textfield";
import GenericPropertyCheckbox from "../generic-property-checkbox";
import GravityEditor from "../gravity-editor";

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
 * Component for editing button properties
 */
class ButtonEditor extends React.Component<Props, State> {

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
        { this.renderWidth() }
        { this.renderHeight() }
        { this.renderTextColor() }
        { this.renderTextResource() }
        { this.renderTextSize() }
        { this.renderTextStyle() }
        { this.renderAllCaps() }
        { this.renderButtonGravity() }
      </>
    );
  }

  /**
   * Render button width editor
   */
  private renderWidth = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.button.width }:
          </Typography>
          <GenericPropertyTextField
            textFieldId={ LayoutButtonPropKeys.Width }
            textFieldType="number"
            textFieldUnit="dp"
            property={ getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.Width, PageLayoutViewPropertyType.String) }
            onTextFieldChange={ this.props.onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render button height editor
   */
  private renderHeight = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.button.height }:
          </Typography>
          <GenericPropertyTextField
            textFieldId={ LayoutButtonPropKeys.Height }
            textFieldType="number"
            textFieldUnit="dp"
            property={ getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.Height, PageLayoutViewPropertyType.String) }
            onTextFieldChange={ this.props.onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render button text resource editor
   */
  private renderTextResource = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.button.textResource }:
          </Typography>
          <GenericPropertyTextField
            disabled
            textFieldId={ LayoutButtonPropKeys.TextResources }
            textFieldType="text"
            property={ getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.TextResources, PageLayoutViewPropertyType.String) }
            onTextFieldChange={ this.props.onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render button text color editor
   */
  private renderTextColor = () => {
    const { classes, onValueChange } = this.props;
    const foundProp = getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.TextColor, PageLayoutViewPropertyType.Color);
    return (
      <div className={ classes.colorPickerContainer }>
        <Typography variant="h4">{ strings.layoutEditor.button.color }:</Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker
              property={ foundProp }
              onColorChange={ onValueChange }
            />
          </div>
          <GenericPropertyTextField
            textFieldId={ LayoutButtonPropKeys.TextColor }
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
   * Render button text style editor
   */
  private renderTextStyle = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h4">{ strings.layoutEditor.button.fontStyle }</Typography>
        <GenericPropertySelect
          property={ getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.TextStyle, PageLayoutViewPropertyType.String) }
          onSelectChange={ this.props.onValueChange }
          selectItemType={ TextViewTextStyleValues }
        />
      </div>
    );
  }

  /**
   * Render button text size editor
   */
  private renderTextSize = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.button.textSize }:
          </Typography>
          <GenericPropertyTextField
            textFieldId={ LayoutButtonPropKeys.TextSize }
            textFieldType="number"
            textFieldUnit="dp"
            property={ getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.TextSize, PageLayoutViewPropertyType.String) }
            onTextFieldChange={ this.props.onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render button all caps editor
   */
  private renderAllCaps = () => {
    const { pageLayoutView, onValueChange, classes } = this.props;
    const foundProp = getProperty(pageLayoutView, LayoutButtonPropKeys.AllCaps, PageLayoutViewPropertyType.Boolean);

    return (
      <div className={ classes.colorPickerContainer }>
        <Typography variant="h4">{ strings.layoutEditor.button.allCaps }:</Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <GenericPropertyCheckbox
            property={ foundProp }
            onCheckboxChange={ onValueChange }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </div>
    );
  }

  /**
   * Render button gravity editor
   */
  private renderButtonGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;

    return (
      <div>
        <Typography variant="h6">{ strings.layoutEditor.button.gravity }</Typography>
        <GravityEditor
          property={ getProperty(pageLayoutView, LayoutButtonPropKeys.Gravity, PageLayoutViewPropertyType.String) }
          onSingleValueChange={ onValueChange }
        />
      </div>
    );
  }
}

export default (withStyles(styles)(ButtonEditor));