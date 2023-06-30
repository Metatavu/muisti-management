import styles from "../../styles/components/generic/toolbar";
import { ActionButton } from "../../types";
import { Button } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

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
  return <>{buttons.map((button) => renderToolbarButton(button))}</>;
};

/**
 * Renders single toolbar button
 *
 * @param button button data
 */
const renderToolbarButton = (button: ActionButton) => {
  return (
    <Button
      key={button.name}
      variant="contained"
      disableElevation
      disabled={button.disabled}
      color="primary"
      onClick={button.action}
    >
      {button.name}
    </Button>
  );
};

export default withStyles(styles)(ActionBar);
