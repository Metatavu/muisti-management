import styles from "../../styles/components/generic/element-settings-pane";
import { ActionButton } from "../../types";
import MenuButton from "../generic/menu-button";
import MenuIcon from "@mui/icons-material/Menu";
import { Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import classNames from "classnames";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Panel title
   */
  title: string;
  /**
   * Panel width
   */
  width: number;
  /**
   * Toggle panel open/closed
   */
  open: boolean;
  /**
   * Icon for action button
   */
  actionIcon?: JSX.Element;
  /**
   * List of available menu options
   */
  menuOptions?: ActionButton[];
  children: React.ReactNode;
}

const minimizedWidth = 0;

/**
 * Component for element settings pane
 *
 * @param props component properties
 */
const ElementSettingsPane: React.FC<Props> = ({
  children,
  classes,
  title,
  width,
  open,
  actionIcon,
  menuOptions
}) => {
  return (
    <div className={classes.root} style={{ width: open ? width : minimizedWidth }}>
      <div className={classes.btnContainer}>
        {menuOptions && <MenuButton icon={actionIcon ?? <MenuIcon />} menuOptions={menuOptions} />}
      </div>
      <div style={{ minWidth: width }} className={classNames(classes.container, { closed: !open })}>
        <div className={classes.header}>
          <Typography variant="h3">{title}</Typography>
        </div>
        <div className={classes.content}>{children}</div>
      </div>
    </div>
  );
};

export default withStyles(styles)(ElementSettingsPane);
