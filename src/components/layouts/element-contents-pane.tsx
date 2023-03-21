import * as React from "react";

import { Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import styles from "../../styles/element-contents-pane";


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
              <Typography variant="h3">{ title }</Typography>
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