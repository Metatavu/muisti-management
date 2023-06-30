import styles from "../../styles/components/generic/element-hierarchy-pane";
import { Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
  width?: number;
}

/**
 * Component for element settings pane
 */
class ElementSettingsPane extends React.Component<Props, {}> {
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
  };

  /**
   * Render basic layout
   */
  public render() {
    const { classes, width } = this.props;
    return (
      <div className={classes.root} style={{ width: width ? width : 400 }}>
        <div style={{ minWidth: width }} className={classes.container}>
          <div className={classes.header}>
            <Typography variant="h3">{this.props.title}</Typography>
          </div>
          <div className={classes.content}>{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ElementSettingsPane);
