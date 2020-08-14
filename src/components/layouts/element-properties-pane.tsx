import * as React from "react";

import CloseIcon from "@material-ui/icons/ChevronLeftSharp";
import OpenIcon from "@material-ui/icons/ChevronRightSharp";
import { WithStyles, withStyles, IconButton } from "@material-ui/core";
import styles from "../../styles/element-properties-pane";
import classNames from "classnames";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Panel title (optional)
   */
  title?: string;
  /**
   * Set panel open/closed
   */
  open?: boolean;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for element properties pane
 */
class ElementPropertiesPane extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const {
      classes,
      title,
      open,
      children
    } = this.props;

    return (
      <div className={ classes.root } style={{ width: open ? 320 : 0 }}>
        <div className={ classNames( classes.container, this.props.open ? "" : "closed" ) }>
          { title &&
            <div className={ classes.header }>
              <h3>{ title }</h3>
            </div>
          }
          <div className={ classes.content }>
            { children }
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ElementPropertiesPane);