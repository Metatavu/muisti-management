import * as React from "react";

import { Typography, Card, withStyles, WithStyles, CardHeader, CardContent } from "@material-ui/core";
import styles from "../../../styles/components/generic/card/card-item";
import CardMenuButton from "./card-menu-button";
import { ActionButton } from "../../../types";
import classNames from "classnames";

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
   * Card item size
   *
   * default: small
   */
  size?: "small" | "large";

  /**
   * Card item selection
   *
   */
  selected?: boolean;

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
    const { classes, cardMenuOptions, title, subtitle, status, size, selected } = this.props;
    console.log(selected)

    return (
      <Card
        elevation={ 5 }
        variant="elevation"
        className={ classNames(`${size === "large" ? classes.largeCard : classes.card } ${ selected ? "selected" : "" }`) }
        onClick={ this.props.onClick }
      >
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