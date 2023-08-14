import styles from "../../styles/components/generic/toolbar";
import { ActionButton } from "../../types";
import { Button, MenuItem, TextField } from "@mui/material";
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
  if (button.isSelect) {
    if (!button.options || !button.value || !button.selectAction) return;

    const { options } = button;

    return (
      <TextField
        key={button.name}
        select
        disabled={button.disabled}
        color="primary"
        onChange={button.selectAction}
        label={button.name}
        value={button.value}
        fullWidth
        sx={{ marginRight: "10px" }}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

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
