import * as React from "react";

import { Button, Grid, IconButton, WithStyles, withStyles } from '@material-ui/core';
import classNames from "classnames";
import styles from "../../styles/selection-group";
/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  firstOptionIcon?: React.ReactElement,
  firstOptionText?: string,
  secondOptionIcon?: React.ReactElement,
  secondOptionText?: string,
  firstOptionSelected?: boolean,
  secondOptionSelected?: boolean,
  onFirstOptionClick: () => void,
  onSecondOptionClick: () => void
}

/**
 * Interface representing component state
 */
interface State {

}

/**
 * React custom selection component
 */
class SelectionGroup extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = { };
  }

  /** 
   * Component render method
   */
  public render() {
    const {
      classes,
      firstOptionIcon,
      firstOptionText,
      firstOptionSelected,
      secondOptionIcon,
      secondOptionText,
      secondOptionSelected,
      onFirstOptionClick,
      onSecondOptionClick
    } = this.props;
    return (
      <Grid container className={ classes.root } xs={ 6 } justify="space-between">
        {
          firstOptionText &&
          <Grid item xs={ 6 }>
            <Button className={ classNames( classes.button, firstOptionSelected ? "selected" : "" ) } variant="contained" onClick={() => onFirstOptionClick() } >
              { firstOptionText }
            </Button>
          </Grid>
        }
        {
          secondOptionText &&
          <Grid item xs={ 6 }>
            <Button className={ classNames( classes.button, secondOptionSelected ? "selected" : "" ) } variant="contained" onClick={() => onSecondOptionClick() } >
              { secondOptionText }
            </Button>
          </Grid>
        }
        {
          firstOptionIcon &&
          <Grid item xs={ 6 }>
            <IconButton className={ classNames( classes.button, firstOptionSelected ? "selected" : "" ) } onClick={() => onFirstOptionClick() } >
              { firstOptionIcon }
            </IconButton>
          </Grid>
        }
        {
          secondOptionIcon &&
          <Grid item xs={ 6 }>
            <IconButton className={ classNames( classes.button, secondOptionSelected ? "selected" : "" ) } onClick={() => onSecondOptionClick() } >
              { secondOptionIcon }
            </IconButton>
          </Grid>
        }
      </Grid>
    );
  }
}

export default withStyles(styles)(SelectionGroup);