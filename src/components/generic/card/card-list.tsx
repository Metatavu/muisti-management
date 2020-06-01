import * as React from "react";

import { Typography, withStyles, WithStyles } from "@material-ui/core";
import styles from "../../../styles/generic/card-list/card-list";
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
    const { classes, title } = this.props;

    return (
      <>
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h2">{ title }</Typography>
        <div className={ classes.cardList }>
          { this.props.children }
        </div>
      </>
    );
  }
}

export default withStyles(styles)(CardList);