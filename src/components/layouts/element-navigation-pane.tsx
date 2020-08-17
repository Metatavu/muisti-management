import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/element-navigation-pane";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Panel title (optional)
   */
  title?: string;
  /**
   * Panel width (optional)
   *
   * default: 320px
   */
  width?: number;
}

/**
 * Interface representing component state
 */
interface State {
}

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
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, title, width, children } = this.props;

    return (
      <div className={ classes.root } style={{ width: width ? width : 320 }}>
        <div className={ classes.container }>
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

export default withStyles(styles)(ElementNavigationPane);