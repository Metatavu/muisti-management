import * as React from "react";

import { Typography, Card, withStyles, WithStyles, Grid } from "@material-ui/core";
import styles from "../../../styles/card-item";
import CardMenuButton from "./card-menu-button";
import { CardMenuOption } from "../../../types";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {

  /**
   * Card title
   */
  title: string;

  /**
   * Exhibition status
   */
  status: string;

  /**
   * List of available menu options
   */
  cardMenuOptions: CardMenuOption[];

  /**
   * Handler for card click
   */
  onClick: () => void;
}

/**
 * Component state
 */
interface State {

}

/**
 * Generic card item component
 */
class CardItem extends React.Component<Props, State> {

  /**
   * Component render method
   */
  public render() {
    const { classes, cardMenuOptions, title, status } = this.props;

    return (
      <div className={ classes.cardItem } onClick={ this.props.onClick }>
        <Card elevation={ 10 } variant="outlined" className={ classes.card }>
          <Grid container>
            <Typography variant="subtitle1" className={ classes.cardTitle }>
              { title }
            </Typography>
            <CardMenuButton
              cardMenuOptions={ cardMenuOptions }
            />
          </Grid>
          <Typography variant="h3" className={ classes.cardTitle }>
            { status }
          </Typography>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(CardItem);