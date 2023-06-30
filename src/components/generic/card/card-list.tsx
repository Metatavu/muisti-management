import styles from "../../../styles/components/generic/card/card-list";
import theme from "../../../styles/theme";
import { Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  title?: string;
  subtitle?: string;

  /**
   * Set the height automatic, use if you have multiple card list in same view
   * NOTE: Remember to wrap both in overflowing component!
   */
  autoHeight?: boolean;
  children: React.ReactNode;
}

/**
 * Generic card list component
 */
class CardList extends React.Component<Props, {}> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, title, subtitle, autoHeight, children } = this.props;

    return (
      <div className={autoHeight ? classes.cardViewAutoHeight : classes.cardView}>
        {title && (
          <Typography style={{ marginBottom: theme.spacing(subtitle ? 1 : 2) }} variant="h2">
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="body1">
            {subtitle}
          </Typography>
        )}
        <div className={classes.cardList}>{this.props.children}</div>
      </div>
    );
  }
}

export default withStyles(styles)(CardList);
