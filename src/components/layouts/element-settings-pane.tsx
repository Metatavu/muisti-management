import * as React from "react";

import { WithStyles, withStyles, Typography } from "@material-ui/core";
import styles from "../../styles/components/generic/element-settings-pane";
import MenuIcon from "@material-ui/icons/Menu";
import classNames from "classnames";
import MenuButton from "../generic/menu-button";
import { ActionButton } from "../../types";

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
    <div
      className={ classes.root }
      style={{ width: open ? width : minimizedWidth }}
    >
      <div className={ classes.btnContainer }>
        { menuOptions &&
          <MenuButton
            icon={ actionIcon ?? <MenuIcon /> }
            menuOptions={ menuOptions }
          />
        }
      </div>
      <div
        style={{ minWidth: width }}
        className={ classNames(classes.container, { "closed": !open }) }
      >
        <div className={ classes.header }>
          <Typography variant="h3">
            { title }
          </Typography>
        </div>
        <div className={ classes.content }>
          { children }
        </div>
      </div>
    </div>
  );
}

export default withStyles(styles)(ElementSettingsPane);