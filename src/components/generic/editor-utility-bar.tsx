import React from "react";
import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/components/generic/content-utility-bar";
import { History } from "history";
import { ActionButton } from "../../types";
import ActionBar from "./action-list";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles>  {
  history: History;
  actionBarButtons?: ActionButton[];
}

/**
 * Functional component for editor utility bar
 * 
 * @param classes classes from props
 * @param actionBarButtons action bar buttons from props
 */
const EditorUtilityBar: React.FC<Props> = ({ classes, actionBarButtons }) => {
  return (
    <div className={ classes.toolbar }>
      <ActionBar buttons={ actionBarButtons || [] } />
    </div>
  );
}

export default withStyles(styles)(EditorUtilityBar);
