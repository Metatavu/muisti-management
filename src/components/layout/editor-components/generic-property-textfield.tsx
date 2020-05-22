import * as React from "react";
import { PageLayoutViewProperty } from "../../../generated/client";
import { WithStyles, withStyles, TextField } from "@material-ui/core";
import styles from "../../../styles/add-device-editor";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;
  textFieldType: string;
  textFieldId: string;
  textFieldUnit?: string;

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
    const { property, textFieldType, textFieldId, textFieldUnit } = this.props;
    return (
      <TextField
        fullWidth
        variant="filled"
        type={ textFieldType }
        name={ textFieldId }
        value={ textFieldUnit && property.value.includes(textFieldUnit) ? property.value.substring(0, property.value.length - 2) : property.value }
        onChange={ this.handleTextFieldChange }
      />
    );
  }

  /**
   * Handle text field value change
   * @param event react change event
   */
  private handleTextFieldChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { property, onTextFieldChange, textFieldUnit } = this.props;

    let value = event.target.value as string;

    if (!value) {
      return;
    }
    if (textFieldUnit) {
      value = value + textFieldUnit;
    }

    const propertyToUpdate = { ...property } as PageLayoutViewProperty;
    propertyToUpdate.value = value;
    onTextFieldChange(propertyToUpdate);
  }

}


export default (withStyles(styles)(GenericPropertyTextField));