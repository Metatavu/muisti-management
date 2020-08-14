import * as React from "react";

import CloseIcon from "@material-ui/icons/ChevronLeftSharp";
import OpenIcon from "@material-ui/icons/ChevronRightSharp";
import { WithStyles, withStyles, IconButton } from "@material-ui/core";
import styles from "../../styles/element-contents-pane";
import classNames from "classnames";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Panel title
   */
  title?: string;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for element contents pane
 */
class ElementContentsPane extends React.Component<Props, State> {

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
    const { classes, title } = this.props;

    return (
      <div className={ classes.root }>
        <div className={ classes.container }>
          { title &&
            <div className={ classes.header }>
              <h3>{ title }</h3>
            </div>
          }
          <div className={ classes.content }>
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ElementContentsPane);