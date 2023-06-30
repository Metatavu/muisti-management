import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType
} from "../../../../generated/client";
import strings from "../../../../localization/strings";
import styles from "../../../../styles/common-properties-editor";
import theme from "../../../../styles/theme";
import DisplayMetrics from "../../../../types/display-metrics";
import { LayoutTextViewPropKeys } from "../../editor-constants/keys";
import { TextViewTextAlignValues } from "../../editor-constants/values";
import { getProperty } from "../../utils/tree-data-utils";
import ColorPicker from "../color-picker";
import GenericPropertySelect from "../generic-property-select";
import GenericPropertyTextField from "../generic-property-textfield";
import GravityEditor from "../gravity-editor";
import { Divider, Typography } from "@mui/material";
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
   * @param updatedPageLayoutView updated page layout view object
   */
  onValueChange: (updatedPageLayoutView: PageLayoutViewProperty) => void;
}

/**
 * Component for editing flow text view properties
 */
class FlowTextViewEditor extends React.Component<Props, {}> {
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
        {this.renderTextColor()}
        {this.renderTextResource()}
        {this.renderTextSize()}
        {this.renderTypeface()}
        {this.renderTextAlign()}
        {this.renderTextViewGravity()}
      </>
    );
  }

  /**
   * Render flow text view text resource editor
   */
  private renderTextResource = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.textView.textResource}:
          </Typography>
          <GenericPropertyTextField
            disabled
            textFieldId={LayoutTextViewPropKeys.TextResources}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutTextViewPropKeys.TextResources,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
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
   * Render flow text view text color editor
   */
  private renderTextColor = () => {
    const { displayMetrics } = this.props;
    const foundProp = getProperty(
      this.props.pageLayoutView,
      LayoutTextViewPropKeys.TextColor,
      PageLayoutViewPropertyType.Color
    );
    return (
      <>
        <Typography variant="h4">{strings.layoutEditor.textView.color}</Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker property={foundProp} onColorChange={this.props.onValueChange} />
          </div>
          <GenericPropertyTextField
            textFieldId={LayoutTextViewPropKeys.TextColor}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={this.props.onValueChange}
          />
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
   * Render flow text view text align editor
   */
  private renderTextAlign = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h4">
          {strings.layoutEditor.textView.textAlign}
        </Typography>
        <GenericPropertySelect
          property={getProperty(
            this.props.pageLayoutView,
            LayoutTextViewPropKeys.TextAlignment,
            PageLayoutViewPropertyType.String
          )}
          onSelectChange={this.props.onValueChange}
          selectItemType={TextViewTextAlignValues}
        />
      </div>
    );
  };

  /**
   * Render flow text view text size editor
   */
  private renderTextSize = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.textView.textSize}:
          </Typography>
          <GenericPropertyTextField
            textFieldId={LayoutTextViewPropKeys.TextSize}
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutTextViewPropKeys.TextSize,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
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
   * Render flow text view typeface editor
   */
  private renderTypeface = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.textView.typeface}:
          </Typography>
          <GenericPropertyTextField
            textFieldId={LayoutTextViewPropKeys.Typeface}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutTextViewPropKeys.Typeface,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
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
   * Render flow text view gravity editor
   */
  private renderTextViewGravity = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Typography variant="h4">{strings.layoutEditor.textView.textGravity}</Typography>
        <GravityEditor
          property={getProperty(
            this.props.pageLayoutView,
            LayoutTextViewPropKeys.Gravity,
            PageLayoutViewPropertyType.String
          )}
          onSingleValueChange={this.props.onValueChange}
        />
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </div>
    );
  };
}

export default withStyles(styles)(FlowTextViewEditor);
