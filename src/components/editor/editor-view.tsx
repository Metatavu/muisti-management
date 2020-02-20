import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/editor-view";

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
 * Component for editor view
 */
class EditorView extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = () => {

  }

  /**
   * Render basic layout
   */
  public render() {
    return (
      <div>
      </div>
    );
  }
}

export default withStyles(styles)(EditorView);