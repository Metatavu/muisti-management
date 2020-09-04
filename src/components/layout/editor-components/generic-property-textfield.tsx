import * as React from "react";
import { PageLayoutViewProperty } from "../../../generated/client";
import { WithStyles, withStyles, TextField } from "@material-ui/core";
import styles from "../../../styles/add-device-editor";
import AndroidUtils from "../../../utils/android-utils";
import DisplayMetrics from "../../../types/display-metrics";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;
  textFieldType: string;
  textFieldId: string;
  textFieldUnit?: string;
  disabled?: boolean;
  displayMetrics?: DisplayMetrics;

  /**
   * On text field change handler
   */
  onTextFieldChange: (propertyToUpdate: PageLayoutViewProperty) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for generic layout editor select
 */
class GenericPropertyTextField extends React.Component<Props, State> {

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
    const { property, textFieldType, textFieldId, textFieldUnit, disabled, displayMetrics } = this.props;

    return (
      <TextField
        disabled={ disabled }
        variant="filled"
        fullWidth
        type={ textFieldType }
        name={ textFieldId }
        value={ displayMetrics ? this.convertTextFieldUnit(property.value) : property.value }
        onChange={ this.handleTextFieldChange }
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
      if (!displayMetrics) {
        throw new Error("displayMetrics was undefined");
      }
      const px = parseFloat(value);
      const dp = AndroidUtils.convertPixelsToDp(displayMetrics, px, 1);
      value = `${dp}dp`;
    }

    const propertyToUpdate = { ...property } as PageLayoutViewProperty;
    propertyToUpdate.value = value;
    onTextFieldChange(propertyToUpdate);
  }

  /**
   * Converts textfield units to units used by the preview
   *
   * @param value string
   */
  private convertTextFieldUnit = (value: string) => {
    const { displayMetrics } = this.props;

    if (!displayMetrics) {
      throw new Error("displayMetrics is undefined");
    }

    const dp = parseFloat(value.substring(0, value.length - 2));
    const px = AndroidUtils.convertDpToPixel(displayMetrics, dp, 1);
    return px;
  }

}


export default (withStyles(styles)(GenericPropertyTextField));