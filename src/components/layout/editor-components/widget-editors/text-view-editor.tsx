import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView } from "../../../../generated/client";
import strings from "../../../../localization/strings";
import { WithStyles, withStyles, Typography } from "@material-ui/core";
import styles from "../../../../styles/common-properties-editor";
import GenericPropertySelect from "./../generic-property-select";
import GravityEditor from "./../gravity-editor";
import { TextViewTextStyleValues, TextViewTextAlignValues } from "../../editor-constants/values";
import { LayoutTextViewPropKeys } from "../../editor-constants/keys";
import ColorPicker from "./../color-picker";
import theme from "../../../../styles/theme";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertyTextField from "../generic-property-textfield";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;

  /**
   * On value change handler
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
 * Component for editing layout properties
 */
class TextViewEditor extends React.Component<Props, State> {

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
        { this.renderTypeface() }
        { this.renderTextStyle() }
        { this.renderTextAlign() }
        { this.renderTextViewGravity() }
      </>
    );
  }

  /**
   * Render text view width editor
   */
  private renderWidth = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(2) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.textView.width }:
        </Typography>
        <GenericPropertyTextField
          textFieldId={ LayoutTextViewPropKeys.Width }
          textFieldType="number"
          textFieldUnit="dp"
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.Width, PageLayoutViewPropertyType.String) }
          onTextFieldChange={ this.props.onValueChange }
        />
      </div>
    );
  }

  /**
   * Render  text view height editor
   */
  private renderHeight = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(2) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.textView.height }:
        </Typography>
        <GenericPropertyTextField
          textFieldId={ LayoutTextViewPropKeys.Height }
          textFieldType="number"
          textFieldUnit="dp"
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.Height, PageLayoutViewPropertyType.String) }
          onTextFieldChange={ this.props.onValueChange }
        />
      </div>
    );
  }

  /**
   * Render text view text resource editor
   */
  private renderTextResource = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(2) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.textView.textResource }:
        </Typography>
        <GenericPropertyTextField
          textFieldId={ LayoutTextViewPropKeys.TextResources }
          textFieldType="text"
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.TextResources, PageLayoutViewPropertyType.String) }
          onTextFieldChange={ this.props.onValueChange }
        />
      </div>
    );
  }

  /**
   * Render text view text color editor
   */
  private renderTextColor = () => {
    const { classes } = this.props;
    const foundProp = getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.TextColor, PageLayoutViewPropertyType.Color);
    return (
      <div className={ classes.backgroundPickerContainer } style={{ marginBottom: theme.spacing(2) }}>
        <Typography variant="h6">{ strings.layoutEditor.textView.color }</Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(1) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker
              property={ foundProp }
              onColorChange={ this.props.onValueChange }
              />
          </div>
          <GenericPropertyTextField
            textFieldId={ LayoutTextViewPropKeys.TextColor }
            textFieldType="text"
            property={ foundProp }
            onTextFieldChange={ this.props.onValueChange }
          />
        </div>
      </div>
    );
  }

  /**
   * Render text view text style editor
   */
  private renderTextStyle = () => {
    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">{ strings.layoutEditor.textView.fontStyle }</Typography>
        <GenericPropertySelect
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.TextStyle, PageLayoutViewPropertyType.String) }
          onSelectChange={ this.props.onValueChange }
          selectItemType={ TextViewTextStyleValues }
        />
      </div>
    );
  }

  /**
   * Render text view text align editor
   */
  private renderTextAlign = () => {
    return (
      <div style={{ marginBottom: theme.spacing(2) }}>
        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">{ strings.layoutEditor.textView.textAlign }</Typography>
        <GenericPropertySelect
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.TextAlignment, PageLayoutViewPropertyType.String) }
          onSelectChange={ this.props.onValueChange }
          selectItemType={ TextViewTextAlignValues }
        />
      </div>
    );
  }

  /**
   * Render text view text size editor
   */
  private renderTextSize = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(2) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.textView.textSize }:
        </Typography>
        <GenericPropertyTextField
          textFieldId={ LayoutTextViewPropKeys.TextSize }
          textFieldType="number"
          textFieldUnit="dp"
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.TextSize, PageLayoutViewPropertyType.String) }
          onTextFieldChange={ this.props.onValueChange }
        />
      </div>
    );
  }

  /**
   * Render text view typeface editor
   */
  private renderTypeface = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing(2) }}>
        <Typography
          style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
          variant="h6"
        >
          { strings.layoutEditor.textView.typeface }:
        </Typography>
        <GenericPropertyTextField
          textFieldId={ LayoutTextViewPropKeys.Typeface }
          textFieldType="text"
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.Typeface, PageLayoutViewPropertyType.String) }
          onTextFieldChange={ this.props.onValueChange }
        />
      </div>
    );
  }

  /**
   * Render text view gravity editor
   */
  private renderTextViewGravity = () => {
    return (
      <div>
        <Typography variant="h6">{ strings.layoutEditor.textView.textGravity }</Typography>
        <GravityEditor
          property={ getProperty(this.props.pageLayoutView, LayoutTextViewPropKeys.Gravity, PageLayoutViewPropertyType.String) }
          onSingleValueChange={ this.props.onValueChange }
        />
      </div>
    );
  }
}

export default (withStyles(styles)(TextViewEditor));