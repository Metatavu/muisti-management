import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/element-timeline-pane";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for element timeline pane
 */
class ElementTimelinePane extends React.Component<Props, State> {

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
      <div className={ classes.root }>
        { this.props.children }
      </div>
    );
  }

}

export default withStyles(styles)(ElementTimelinePane);
