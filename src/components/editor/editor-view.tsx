import styles from "../../styles/editor-view";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
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
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {};

  /**
   * Render basic layout
   */
  public render() {
    const { classes } = this.props;

    return <div className={classes.root}>{this.props.children}</div>;
  }
}

export default withStyles(styles)(EditorView);
