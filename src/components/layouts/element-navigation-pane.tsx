import * as React from "react";

import CloseIcon from "@material-ui/icons/ChevronLeftSharp";
import OpenIcon from "@material-ui/icons/ChevronRightSharp";
import { WithStyles, withStyles, IconButton } from "@material-ui/core";
import styles from "../../styles/element-navigation-pane";
import classNames from "classnames";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
}

/**
 * Interface representing component state
 */
interface State {
  open: boolean;
}

const minWidth = 320;
const minimizedWidth = 50;

/**
 * Component for element navigation pane
 */
class ElementNavigationPane extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      open: true
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes } = this.props;

    return (
      <div className={ classes.root } style={{ width: this.state.open ? minWidth : minimizedWidth }}>
        <div className={ classes.btnContainer }>
          <IconButton size="small" edge="start" onClick={ this.onToggleClick }>
            { this.state.open ? <CloseIcon /> : <OpenIcon /> }
          </IconButton>
        </div>
        <div className={ classNames( classes.container, this.state.open ? "" : "closed" ) }>
          <div className={ classes.header }>
            <h3>{ this.props.title }</h3>
          </div>
          <div className={ classes.content }>
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }

  /**
   * Handle toggle panel
   */
  private onToggleClick = () => {
    this.setState({
      open: !this.state.open
    });
  }
}

export default withStyles(styles)(ElementNavigationPane);