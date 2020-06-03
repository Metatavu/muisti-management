import * as React from "react";

import { Typography, Card, withStyles, WithStyles, CardHeader, CardContent } from "@material-ui/core";
import styles from "../../../styles/components/generic/card/card-item";
import CardMenuButton from "./card-menu-button";
import { ActionButton } from "../../../types";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {

  /**
   * Card title
   */
  title: string;

  /**
   * Card subtitle
   */
  subtitle?: string;

  /**
   * Card item status
   */
  status?: string;

  /**
   * List of available menu options
   */
  cardMenuOptions: ActionButton[];

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
    const { classes, cardMenuOptions, title, subtitle, status } = this.props;

    return (
      <Card elevation={ 5 } variant="elevation" className={ classes.card } onClick={ this.props.onClick }>
        <CardHeader
          titleTypographyProps={{ variant: "h3" }}
          action={
            <CardMenuButton
              cardMenuOptions={ cardMenuOptions }
            />
          }
          title={ title }
          subheader={ subtitle }
        />
        <CardContent>
          { status &&
            <Typography variant="h5" className={ classes.status }>
              { status }
            </Typography>
          }
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(CardItem);