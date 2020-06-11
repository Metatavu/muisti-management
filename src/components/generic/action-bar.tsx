import * as React from "react";

import { ActionButton } from "../../types";
import { WithStyles, withStyles, Button, Grid } from "@material-ui/core";
import styles from "../../styles/components/generic/toolbar";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  buttons: ActionButton[];
}

/**
 * Functional component for generic toolbar
 *
 * @param props component props
 */
const ActionBar: React.FC<Props> = ({ buttons }) => {
  return (
    <Grid
      container
      spacing={ 2 }
      justify="flex-end"
      alignContent="center"
    >
      { buttons.map(button => renderToolbarButton(button)) }
    </Grid>
  );
};

/**
 * Renders single toolbar button
 * 
 * @param button button data
 */
const renderToolbarButton = (button: ActionButton) => {
  return (
    <Grid item key={ button.name }>
      <Button
        variant="contained"
        disableElevation
        color="primary"
        onClick={ button.action }
      >
        { button.name }
      </Button>
    </Grid>
  );
};


export default withStyles(styles)(ActionBar);