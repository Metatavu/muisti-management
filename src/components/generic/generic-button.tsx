import styles from "../../styles/components/generic/generic-button";
import { Button, PropTypes } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  text?: string;
  color?: PropTypes.Color;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * React generic button functional component
 */
const GenericButton: React.FC<Props> = (props: Props) => (
  <Button
    disableElevation
    variant="contained"
    color={props.color}
    disabled={props.disabled}
    onClick={props.onClick}
    startIcon={props.icon}
    className={props.classes.button}
    style={props.style}
  >
    {props.text}
  </Button>
);

export default withStyles(styles)(GenericButton);
