import * as React from "react";

import { WithStyles, withStyles, Typography } from '@material-ui/core';
import styles from "../../styles/floor-plan";

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
class FloorPlan extends React.Component<Props, State> {

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
   * Render basic layout
   */
  public render() {
    const { classes } = this.props;
    
    return (
      <div className={ classes.root }>
        <Typography>Olen lattialoinen</Typography>
      </div>
    );
  }
}

export default withStyles(styles)(FloorPlan);