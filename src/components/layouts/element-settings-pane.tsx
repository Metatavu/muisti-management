import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
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
   * Handler for action button click
   */
  onActionClick?: () => void;
  /**
   * List of available menu options
   */
  menuOptions?: ActionButton[];
}

/**
 * Interface representing component state
 */
interface State {}

const minimizedWidth = 0;

/**
 * Component for element settings pane
 */
class ElementSettingsPane extends React.Component<Props, State> {

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
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    this.setState({
      open: true
    });
  }

  /**
   * Render panel
   */
  public render() {
    const { classes, width, open, actionIcon, menuOptions } = this.props;
    return (
      <div className={ classes.root } style={{ width: open ? width : minimizedWidth }}>
        <div className={ classes.btnContainer }>
          { menuOptions &&
            <MenuButton
              icon={ actionIcon ? actionIcon : <MenuIcon /> }
              menuOptions={ menuOptions }
            />
          }
        </div>
        <div style={{ minWidth: width }} className={ classNames( classes.container, open ? "" : "closed" ) }>
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
}

export default withStyles(styles)(ElementSettingsPane);