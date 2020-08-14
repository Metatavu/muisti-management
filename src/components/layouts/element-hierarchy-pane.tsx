import * as React from "react";

import { WithStyles, withStyles, IconButton } from "@material-ui/core";
import styles from "../../styles/components/generic/element-hierarchy-pane";
import OpenIcon from "@material-ui/icons/ChevronLeftSharp";
import CloseIcon from "@material-ui/icons/ChevronRightSharp";
import classNames from "classnames";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
  width?: number;
}

/**
 * Interface representing component state
 */
interface State {
}

const minimizedWidth = 50;

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
      open: true
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    this.setState({
      open: true
    });
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, width } = this.props;
    return (
      <div className={ classes.root } style={{ width: width ? width : 320 }}>
        <div style={{ minWidth: width }} className={ classes.container }>
          <div className={ classes.header }>
            <h3>{ this.props.title }</h3>
          </div>
          <div className={ classes.content }>
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ElementSettingsPane);