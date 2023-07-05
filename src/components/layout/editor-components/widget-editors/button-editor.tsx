import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType
} from "../../../../generated/client";
import strings from "../../../../localization/strings";
import styles from "../../../../styles/common-properties-editor";
import theme from "../../../../styles/theme";
import DisplayMetrics from "../../../../types/display-metrics";
import HelpDialog from "../../../generic/help-dialog";
import { LayoutButtonPropKeys } from "../../editor-constants/keys";
import { TextViewTextStyleValues } from "../../editor-constants/values";
import { getProperty } from "../../utils/tree-data-utils";
import ColorPicker from "../color-picker";
import GenericPropertyCheckbox from "../generic-property-checkbox";
import GenericPropertySelect from "../generic-property-select";
import GenericPropertyTextField from "../generic-property-textfield";
import GravityEditor from "../gravity-editor";
import { Box, Divider, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;
  displayMetrics: DisplayMetrics;

  /**
   * On value change handler
   *
   * @param updatedPageLayoutView updated page layout view object
   */
  onValueChange: (updatedPageLayoutView: PageLayoutViewProperty) => void;
}

/**
 * Component for editing button properties
 */
class ButtonEditor extends React.Component<Props, {}> {
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
   * Component render method
   */
  public render() {
    return (
      <>
        {this.renderWidth()}
        {this.renderHeight()}
        {this.renderTextColor()}
        {this.renderTextResource()}
        {this.renderTextSize()}
        {this.renderTextStyle()}
        {this.renderAllCaps()}
        {this.renderButtonGravity()}
      </>
    );
  }

  /**
   * Render button width editor
   */
  private renderWidth = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.button.width}:
          </Typography>
          <GenericPropertyTextField
            textFieldId={LayoutButtonPropKeys.Width}
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutButtonPropKeys.Width,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
          <HelpDialog title={strings.layoutEditor.button.width}>
            <Typography>{strings.helpDialogs.layoutEditor.button.width}</Typography>
          </HelpDialog>
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </>
    );
  };

  /**
   * Render button height editor
   */
  private renderHeight = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.button.height}:
          </Typography>
          <GenericPropertyTextField
            textFieldId={LayoutButtonPropKeys.Height}
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutButtonPropKeys.Height,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
          <HelpDialog title={strings.layoutEditor.button.height}>
            <Typography>{strings.helpDialogs.layoutEditor.button.height}</Typography>
          </HelpDialog>
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </>
    );
  };

  /**
   * Render button text resource editor
   */
  private renderTextResource = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.button.textResource}:
          </Typography>
          <GenericPropertyTextField
            disabled
            textFieldId={LayoutButtonPropKeys.TextResources}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutButtonPropKeys.TextResources,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
          <HelpDialog title={strings.layoutEditor.button.textResource}>
            <Typography>{strings.helpDialogs.layoutEditor.button.text}</Typography>
          </HelpDialog>
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </>
    );
  };

  /**
   * Render button text color editor
   */
  private renderTextColor = () => {
    const { onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      this.props.pageLayoutView,
      LayoutButtonPropKeys.TextColor,
      PageLayoutViewPropertyType.Color
    );
    return (
      <>
        <Typography variant="h4">{strings.layoutEditor.button.color}:</Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker property={foundProp} onColorChange={onValueChange} />
          </div>
          <GenericPropertyTextField
            textFieldId={LayoutButtonPropKeys.TextColor}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={onValueChange}
          />
          <HelpDialog title={strings.layoutEditor.button.color}>
            <Typography>{strings.helpDialogs.layoutEditor.button.color}</Typography>
          </HelpDialog>
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </>
    );
  };

  /**
   * Render button text style editor
   */
  private renderTextStyle = () => {
    return (
      <Box pt={1} display="flex" alignItems="center">
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h4">
          {strings.layoutEditor.button.fontStyle}
        </Typography>
        <GenericPropertySelect
          property={getProperty(
            this.props.pageLayoutView,
            LayoutButtonPropKeys.TextStyle,
            PageLayoutViewPropertyType.String
          )}
          onSelectChange={this.props.onValueChange}
          selectItemType={TextViewTextStyleValues}
        />
        <HelpDialog title={strings.layoutEditor.button.fontStyle}>
          <Typography>{strings.helpDialogs.layoutEditor.button.style}</Typography>
          <Typography>{strings.helpDialogs.layoutEditor.button.capitalize}</Typography>
        </HelpDialog>
      </Box>
    );
  };

  /**
   * Render button text size editor
   */
  private renderTextSize = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.button.textSize}:
          </Typography>
          <GenericPropertyTextField
            textFieldId={LayoutButtonPropKeys.TextSize}
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutButtonPropKeys.TextSize,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
          <HelpDialog title={strings.layoutEditor.button.textSize}>
            <Typography>{strings.helpDialogs.layoutEditor.button.textSize.description}</Typography>
            <Box mt={2}>
              <Typography variant="h6">
                {strings.helpDialogs.layoutEditor.button.textSize.note}
              </Typography>
            </Box>
          </HelpDialog>
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </>
    );
  };

  /**
   * Render button all caps editor
   */
  private renderAllCaps = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutButtonPropKeys.AllCaps,
      PageLayoutViewPropertyType.Boolean
    );

    return (
      <Box ml={2}>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.button.allCaps}
            property={foundProp}
            onCheckboxChange={onValueChange}
          />
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </Box>
    );
  };

  /**
   * Render button gravity editor
   */
  private renderButtonGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;

    return (
      <div>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">{strings.layoutEditor.button.gravity}</Typography>
          <HelpDialog title={strings.layoutEditor.button.gravity}>
            <Typography>{strings.helpDialogs.layoutEditor.button.gravity.description}</Typography>
            <Box mt={2}>
              <Typography variant="h6">
                {strings.helpDialogs.layoutEditor.button.gravity.note}
              </Typography>
            </Box>
          </HelpDialog>
        </Box>
        <GravityEditor
          property={getProperty(
            pageLayoutView,
            LayoutButtonPropKeys.Gravity,
            PageLayoutViewPropertyType.String
          )}
          onSingleValueChange={onValueChange}
        />
      </div>
    );
  };
}

export default withStyles(styles)(ButtonEditor);
