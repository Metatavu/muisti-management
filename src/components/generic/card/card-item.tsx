import * as React from "react";

import { Typography, Card, withStyles, WithStyles, CardHeader, CardContent, Button } from "@material-ui/core";
import styles from "../../../styles/components/generic/card/card-item";
import MenuButton from "../menu-button";
import { ActionButton } from "../../../types";
import classNames from "classnames";
import { GroupContentVersionStatus } from "../../../generated/client";

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
   * Card context info
   */
  context?: JSX.Element;

  /**
   * Card item status
   */
  status?: string | GroupContentVersionStatus;

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
  menuOptions: ActionButton[];

  /**
   * Handler for card click
   */
  onClick: () => void;

  /**
   * Handler for card action click
   */
  onActionClick?: () => void;
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
    const { classes, menuOptions, title, subtitle, context, status, size, selected } = this.props;

    return (
      <div className={ classes.cardWrapper }>
        <Card
          elevation={ 5 }
          variant="elevation"
          className={ classNames(`${ size === "large" ? classes.largeCard : classes.card } ${ selected ? "selected" : "" }`) }
          onClick={ this.props.onClick }
          >
          <CardHeader
            titleTypographyProps={{ variant: "h3" }}
            action={
              <MenuButton
                menuOptions={ menuOptions }
              />
            }
            title={ title }
            subheader={ subtitle }
            />
          <CardContent>
            { context }
            { status &&
              <Typography variant="h5" className={ classes.status }>
                { status }
              </Typography>
            }
          </CardContent>
        </Card>
        <div className={ classNames(`${ classes.cardActionArea } ${ selected ? "visible" : "" }`) }>
          <Button onClick={ this.props.onActionClick } variant="outlined">Avaa Timeline</Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(CardItem);