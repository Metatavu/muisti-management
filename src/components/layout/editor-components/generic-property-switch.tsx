import { PageLayoutViewProperty } from "../../../generated/client";
import styles from "../../../styles/add-device-editor";
import { Grid, Switch } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;
  switchId: string;
  switchOptions: string[];
  disabled?: boolean;

  /**
   * On switch change handler
   */
  onSwitchChange: (propertyToUpdate: PageLayoutViewProperty) => void;
}

/**
 * Component for generic layout editor switch
 */
class GenericPropertySwitch extends React.Component<Props, {}> {
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
    const { property, switchId, disabled, switchOptions } = this.props;

    if (switchOptions.length < 2) {
      return null;
    }

    return (
      <Grid component="label" container alignItems="center" spacing={1}>
        <Grid item>{switchOptions[0]}</Grid>
        <Grid item>
          <Switch
            disabled={disabled}
            name={switchId}
            value={property.value === switchOptions[0]}
            onChange={this.handleSwitchChange}
          />
        </Grid>
        <Grid item>{switchOptions[1]}</Grid>
      </Grid>
    );
  }

  /**
   * Handle switch value change
   *
   * @param event react change event
   * @param checked switch value
   */
  private handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const { property, switchOptions, onSwitchChange } = this.props;

    const value = checked ? switchOptions[1] : switchOptions[0];
    const propertyToUpdate = { ...property } as PageLayoutViewProperty;
    propertyToUpdate.value = value;
    onSwitchChange(propertyToUpdate);
  };
}

export default withStyles(styles)(GenericPropertySwitch);
