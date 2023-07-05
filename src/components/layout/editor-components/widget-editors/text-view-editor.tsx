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
import { TextViewTextAlignValues, TextViewTextStyleValues } from "../../editor-constants/values";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertyTextField from "../generic-property-textfield";
import ColorPicker from "./../color-picker";
import GenericPropertySelect from "./../generic-property-select";
import GravityEditor from "./../gravity-editor";
import { Typography } from "@mui/material";
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
 * Component for editing layout properties
 */
class TextViewEditor extends React.Component<Props, {}> {
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
        {this.renderTypeface()}
        {this.renderTextStyle()}
        {this.renderTextAlign()}
        {this.renderTextViewGravity()}
      </>
    );
  }

  /**
   * Render text view width editor
   */
  private renderWidth = () => {
    const { pageLayoutView, onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.Width,
      PageLayoutViewPropertyType.String
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing(2)
        }}
      >
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.textView.width}:
        </Typography>
        <GenericPropertyTextField
          textFieldId={LayoutTextViewPropKeys.Width}
          textFieldType="number"
          textFieldUnit="px"
          displayMetrics={displayMetrics}
          property={foundProp}
          onTextFieldChange={onValueChange}
        />
      </div>
    );
  };

  /**
   * Render text view height editor
   */
  private renderHeight = () => {
    const { pageLayoutView, onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.Height,
      PageLayoutViewPropertyType.String
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing(2)
        }}
      >
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.textView.height}:
        </Typography>
        <GenericPropertyTextField
          textFieldId={LayoutTextViewPropKeys.Height}
          textFieldType="number"
          textFieldUnit="px"
          displayMetrics={displayMetrics}
          property={foundProp}
          onTextFieldChange={onValueChange}
        />
      </div>
    );
  };

  /**
   * Render text view text resource editor
   */
  private renderTextResource = () => {
    const { pageLayoutView, onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.TextResources,
      PageLayoutViewPropertyType.String
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing(2)
        }}
      >
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.textView.textResource}:
        </Typography>
        <GenericPropertyTextField
          disabled
          textFieldId={LayoutTextViewPropKeys.TextResources}
          textFieldType="text"
          displayMetrics={displayMetrics}
          property={foundProp}
          onTextFieldChange={onValueChange}
        />
      </div>
    );
  };

  /**
   * Render text view text color editor
   */
  private renderTextColor = () => {
    const { pageLayoutView, onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.TextColor,
      PageLayoutViewPropertyType.Color
    );

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <Typography variant="h6">{strings.layoutEditor.textView.color}</Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(1) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker property={foundProp} onColorChange={this.props.onValueChange} />
          </div>
          <GenericPropertyTextField
            textFieldId={LayoutTextViewPropKeys.TextColor}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={onValueChange}
          />
        </div>
      </div>
    );
  };

  /**
   * Render text view text style editor
   */
  private renderTextStyle = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.TextStyle,
      PageLayoutViewPropertyType.String
    );

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">
          {strings.layoutEditor.textView.fontStyle}
        </Typography>
        <GenericPropertySelect
          property={foundProp}
          onSelectChange={onValueChange}
          selectItemType={TextViewTextStyleValues}
        />
      </div>
    );
  };

  /**
   * Render text view text align editor
   */
  private renderTextAlign = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.TextAlignment,
      PageLayoutViewPropertyType.String
    );

    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">
          {strings.layoutEditor.textView.textAlign}
        </Typography>
        <GenericPropertySelect
          property={foundProp}
          onSelectChange={onValueChange}
          selectItemType={TextViewTextAlignValues}
        />
      </div>
    );
  };

  /**
   * Render text view text size editor
   */
  private renderTextSize = () => {
    const { pageLayoutView, onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.TextSize,
      PageLayoutViewPropertyType.String
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing(2)
        }}
      >
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.textView.textSize}:
        </Typography>
        <GenericPropertyTextField
          textFieldId={LayoutTextViewPropKeys.TextSize}
          textFieldType="number"
          textFieldUnit="px"
          displayMetrics={displayMetrics}
          property={foundProp}
          onTextFieldChange={onValueChange}
        />
      </div>
    );
  };

  /**
   * Render text view typeface editor
   */
  private renderTypeface = () => {
    const { pageLayoutView, onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.Typeface,
      PageLayoutViewPropertyType.String
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing(2)
        }}
      >
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.textView.typeface}:
        </Typography>
        <GenericPropertyTextField
          textFieldId={LayoutTextViewPropKeys.Typeface}
          textFieldType="text"
          displayMetrics={displayMetrics}
          property={foundProp}
          onTextFieldChange={onValueChange}
        />
      </div>
    );
  };

  /**
   * Render text view gravity editor
   */
  private renderTextViewGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTextViewPropKeys.Gravity,
      PageLayoutViewPropertyType.String
    );

    return (
      <div>
        <Typography variant="h6">{strings.layoutEditor.textView.textGravity}</Typography>
        <GravityEditor property={foundProp} onSingleValueChange={onValueChange} />
      </div>
    );
  };
}

export default withStyles(styles)(TextViewEditor);
