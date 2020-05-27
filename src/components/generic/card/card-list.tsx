import * as React from "react";

import { Typography, withStyles, WithStyles, List } from "@material-ui/core";
import styles from "../../../styles/card-list";
import theme from "../../../styles/theme";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
}

/**
 * Component state
 */
interface State {

}

/**
 * Generic card list component
 */
class CardList extends React.Component<Props, State> {

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
   * Component render method
   */
  public render() {
    const { title } = this.props;

    return (
      <>
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ title }</Typography>
        <List>
          { this.props.children }
        </List>
      </>
    );
  }
}

export default withStyles(styles)(CardList);