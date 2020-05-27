import * as React from "react";

import { withStyles, WithStyles, Menu, MenuItem, IconButton } from "@material-ui/core";
import styles from "../../../styles/card-list";
import MenuIcon from '@material-ui/icons/Menu';
import { CardMenuOption } from "../../../types";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  cardMenuOptions: CardMenuOption[];
  icon?: JSX.Element;
}

/**
 * Component state
 */
interface State {
  open: boolean;
}

/**
 * Generic card item component
 */
class CardMenuButton extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false
    };
  }
  
  /**
   * Component render method
   */
  public render() {
    const { cardMenuOptions, icon } = this.props;
    const { open } = this.state;
    const optionMenuItems = cardMenuOptions.map(option => {
      const { name, action } = option;
      const onClick = (event: React.MouseEvent<HTMLElement>) => {
        action();
        this.toggleMenu(event);
      };

      return (
        <MenuItem onClick={ onClick }>
          { name }
        </MenuItem>
      );
    });

    return (
      <>
        <IconButton onClick={ this.toggleMenu }>
          { icon || <MenuIcon/> }
        </IconButton>
        <Menu open={ open } onClose={ this.toggleMenu }>
          { optionMenuItems }
        </Menu>
      </>
    );
  }

  /**
   * Toggle menu handler
   */
  private toggleMenu = (event: React.MouseEvent<HTMLElement>) => {
    this.setState({ open: !this.state.open });
    event.stopPropagation();
  }
}

export default withStyles(styles)(CardMenuButton);