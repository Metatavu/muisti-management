import styles from "../../styles/element-contents-pane";
import { Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Panel title
   */
  title?: string;
  children: React.ReactNode;
}

const ElementContentsPane: React.FC<Props> = ({
  title,
  classes,
  children
}) => {
  return <div className={classes.root}>
    <div className={classes.container}>
      {title && <div className={classes.header}>
        <Typography variant="h3">{title}</Typography>
      </div>}
      <div className={classes.content}>{children}</div>
    </div>
  </div>;
};

export default withStyles(styles)(ElementContentsPane);
