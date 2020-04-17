import * as React from "react";

import { Button, Grid, WithStyles, withStyles } from '@material-ui/core';
import classNames from "classnames";
import styles from "../../styles/selection-group";
/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Options
   */
  options: SelectOptions;
  /**
   * Selected index
   */
  selectedIndex: number;
  /**
   * Click handler
   *
   * @param optionIndex selected index
   */
  onChange: (optionIndex: number) => void;
}

/**
 * Interface representing component options
 */
export interface SelectOptions {
  data: OptionData[];
}

/**
 * Interface representing component optionData
 */
export interface OptionData {
  icon?: React.ReactElement;
  text?: string;
}

/**
 * React custom selection component
 */
const SelectionGroup: React.FC<Props> = (props: Props) => {
  return (
    <Grid
      container
      className={ props.classes.root }
      spacing={ 1 }
      justify="space-between"
    >
      {
        props.options.data.map((dataItem, index) => {
          return (
            <Grid item xs={ 6 }>
              <Button
                startIcon={ dataItem.icon }
                className={ classNames( props.classes.button, !dataItem.text ? "no-text": "", props.selectedIndex === index ? "selected" : "" ) }
                onClick={() => props.onChange(index) }
              >
                { dataItem.text }
              </Button>
            </Grid>
          );
        })
      }
    </Grid>
  );
}

export default withStyles(styles)(SelectionGroup);