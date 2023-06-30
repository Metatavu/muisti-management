import styles from "../../styles/components/generic/menu-button";
import theme from "../../styles/theme";
import { ActionButton } from "../../types";
import MenuIcon from "@mui/icons-material/Menu";
import {
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  menuOptions: ActionButton[];
  icon?: JSX.Element;
}

/**
 * Generic menu button component
 */
const MenuButton: React.FC<Props> = (props) => {
  const { menuOptions, icon } = props;
  const [open, setOpen] = React.useState(false);

  const anchorRef = React.useRef<HTMLButtonElement>(null);
  const prevOpen = React.useRef(open);

  /**
   * Hook for setting menu open state
   */
  React.useEffect(() => {
    prevOpen.current = open;
  }, [open]);

  /**
   * Handler for toggle menu
   */
  const handleToggle = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setOpen((prevOpen) => !prevOpen);
    event.stopPropagation();
  };

  /**
   * Handler for close menu
   * @param event
   */
  const handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }

    setOpen(false);
  };

  const optionMenuItems = menuOptions.map((option) => {
    const { name, action } = option;
    const onClick = (event: React.MouseEvent<HTMLElement>) => {
      action();
      handleClose(event);
      event.stopPropagation();
    };

    return (
      <MenuItem key={name} onClick={onClick}>
        {name}
      </MenuItem>
    );
  });

  return (
    <>
      <IconButton onClick={handleToggle} ref={anchorRef} size="large">
        {icon || <MenuIcon />}
      </IconButton>
      <Popper
        open={open}
        role={undefined}
        anchorEl={anchorRef.current}
        placement="bottom-end"
        transition
        disablePortal
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "right top" }}>
            <Paper elevation={5} style={{ borderRadius: theme.shape.borderRadius }}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList autoFocusItem={open}>{optionMenuItems}</MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};

export default withStyles(styles)(MenuButton);
