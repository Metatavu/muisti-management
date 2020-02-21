import * as React from "react";

import { WithStyles, withStyles, Drawer } from "@material-ui/core";
import styles from "../../styles/element-settings-pane";

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
        <div className={ classes.panelContent }>
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ElementSettingsPane);