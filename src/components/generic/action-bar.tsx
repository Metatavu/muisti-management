import styles from "../../styles/components/generic/top-bar";
import { ActionButton } from "../../types";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
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
  /**
   * Renders single toolbar button
   *
   * @param button button data
   */
  const renderToolbarButton = (button: ActionButton) => {
    if (button.selectAction) {
      if (!button.options || !button.value || button.disabled) return;

      const { options } = button;

      return (
        <TextField
          style={{ minWidth: 80 }}
          key={button.name}
          select
          disabled={button.disabled}
          color="primary"
          onChange={button.selectAction}
          label={button.name}
          value={button.value}
        >
          {
            options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))
          }
        </TextField >
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

  return (
    <Stack direction="row" spacing={1} mr={2} alignItems="center">
      {buttons.map((button) => renderToolbarButton(button))}
    </Stack>
  );
};

export default withStyles(styles)(ActionBar);
