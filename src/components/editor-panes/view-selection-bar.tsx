import * as React from "react";

import { WithStyles, withStyles, IconButton } from "@material-ui/core";
import styles from "../../styles/view-selection-bar";
import { ViewQuiltRounded, CheckBoxOutlineBlank, TabUnselected } from "@material-ui/icons";

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
 * Component for view selection bar
 */
class ViewSelectionBar extends React.Component<Props, State> {

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
        <div className={ classes.buttonGroup }>
          <IconButton>
            <ViewQuiltRounded />
          </IconButton>
          <IconButton>
            <CheckBoxOutlineBlank />
          </IconButton>
          <IconButton>
            <TabUnselected />
          </IconButton>
        </div>
        { this.props.children }
      </div>
    );
  }
}

export default withStyles(styles)(ViewSelectionBar);