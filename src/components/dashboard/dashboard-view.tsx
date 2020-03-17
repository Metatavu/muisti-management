import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/dashboard-layout";

import { History } from "history";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for dashboard view
 */
class DashboardView extends React.Component<Props, State> {

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
    const { classes } = this.props;
    
    return (
      <div className={ classes.root }>
        <header className={ classes.header }>
        </header>
        <div className={ classes.navigation }>
          <div className={ classes.userElement }>
              <div className={ classes.userAvatar }>TR</div>
              <h3>Timo</h3>
          </div>
          <div className={ classes.navigationContent }>
            { this.props.children }
          </div>
        </div>
        <div className={ classes.content }>
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(DashboardView);