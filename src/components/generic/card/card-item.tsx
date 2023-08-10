import { ContentVersionStatus } from "../../../generated/client";
import strings from "../../../localization/strings";
import styles from "../../../styles/components/generic/card/card-item";
import { ActionButton } from "../../../types";
import MenuButton from "../menu-button";
import { Button, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import classNames from "classnames";
import * as React from "react";

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
  status?: string | ContentVersionStatus;

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
  menuOptions?: ActionButton[];

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
 * Generic card item component
 */
class CardItem extends React.Component<Props, {}> {
  /**
   * Component render method
   */
  public render() {
    const { classes, menuOptions, title, subtitle, context, status, size, selected } = this.props;

    return (
      <div className={classes.cardWrapper}>
        <Card
          elevation={5}
          variant="elevation"
          className={classNames(
            `${size === "large" ? classes.largeCard : classes.card} ${selected ? "selected" : ""}`
          )}
          onClick={this.props.onClick}
        >
          <CardHeader
            titleTypographyProps={{ variant: "h3" }}
            action={menuOptions && <MenuButton menuOptions={menuOptions} />}
            title={title}
            subheader={subtitle}
          />
          <CardContent>
            {context}
            {status && (
              <Typography variant="h5" className={classes.status}>
                {status}
              </Typography>
            )}
          </CardContent>
        </Card>
        <div className={classNames(`${classes.cardActionArea} ${selected ? "visible" : ""}`)}>
          <Button onClick={this.props.onActionClick} variant="outlined">
            {strings.contentEditor.open}
          </Button>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(CardItem);
