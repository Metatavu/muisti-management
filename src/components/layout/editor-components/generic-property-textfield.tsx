import { PageLayoutViewProperty } from "../../../generated/client";
import styles from "../../../styles/add-device-editor";
import DisplayMetrics from "../../../types/display-metrics";
import AndroidUtils from "../../../utils/android-utils";
import { TextField } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;
  textFieldType: string;
  textFieldId: string;
  textFieldUnit?: string;
  disabled?: boolean;
  displayMetrics: DisplayMetrics;
  tooltip?: string;
  label?: string;

  /**
   * On text field change handler
   */
  onTextFieldChange: (propertyToUpdate: PageLayoutViewProperty) => void;
}

/**
 * Component for generic layout editor select
 */
class GenericPropertyTextField extends React.Component<Props, {}> {
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
    const { property, textFieldType, textFieldId, disabled, textFieldUnit, tooltip, label } =
      this.props;

    return (
      <TextField
        label={label}
        title={tooltip}
        disabled={disabled}
        type={textFieldType}
        name={textFieldId}
        value={textFieldUnit ? this.convertTextFieldUnit(property.value) : property.value}
        onChange={this.handleTextFieldChange}
      />
    );
  }

  /**
   * Handle text field value change
   * @param event react change event
   */
  private handleTextFieldChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { property, onTextFieldChange, textFieldUnit, displayMetrics } = this.props;

    let value = event.target.value as string;

    if (value && textFieldUnit) {
      const px = parseFloat(value);
      const dp = AndroidUtils.convertPixelsToDp(displayMetrics, px, 1);
      value = `${dp}dp`;
    }

    const propertyToUpdate = { ...property } as PageLayoutViewProperty;
    propertyToUpdate.value = value;
    onTextFieldChange(propertyToUpdate);
  };

  /**
   * Converts textfield units to units used by the preview
   *
   * @param value string
   * @returns dp converted to px
   */
  private convertTextFieldUnit = (value: string): number => {
    const { displayMetrics } = this.props;
    const dp = parseFloat(value.substring(0, value.length - 2));
    const px = AndroidUtils.convertDpToPixel(displayMetrics, dp, 1);
    return px;
  };
}

export default withStyles(styles)(GenericPropertyTextField);
