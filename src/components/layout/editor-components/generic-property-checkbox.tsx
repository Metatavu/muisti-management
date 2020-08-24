import * as React from "react";
import { PageLayoutViewProperty } from "../../../generated/client";
import { WithStyles, withStyles, Checkbox } from "@material-ui/core";
import styles from "../../../styles/add-device-editor";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;

  /**
   * On checkbox change handler
   */
  onCheckboxChange: (propertyToUpdate: PageLayoutViewProperty) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for layout checkbox
 */
class GenericPropertyCheckbox extends React.Component<Props, State> {

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
    const { property } = this.props;
    return (
      <Checkbox
        checked={ property.value === "true" }
        onChange={ this.onCheckboxChange }
        name={ property.name }
      />
    );
  }

  /**
   * Handle checkbox value change
   *
   * @param event react change event
   * @param checked checkbox value
   */
  private onCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const { property, onCheckboxChange } = this.props;

    const propertyToUpdate = { ...property } as PageLayoutViewProperty;
    propertyToUpdate.value = String(checked);
    onCheckboxChange(propertyToUpdate);
  }

}


export default (withStyles(styles)(GenericPropertyCheckbox));