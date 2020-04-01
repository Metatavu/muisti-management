import * as React from "react";

import { Button, Grid, IconButton, WithStyles, withStyles } from '@material-ui/core';
import classNames from "classnames";
import styles from "../../styles/selection-group";
/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Icon for the first option
   */
  firstOptionIcon?: React.ReactElement,
  /**
   * Text for the first option
   */
  firstOptionText?: string,
  /**
   * Icon for the second option
   */
  secondOptionIcon?: React.ReactElement,
  /**
   * Text for the first option
   */
  secondOptionText?: string,
  /**
   * First element selection
   */
  firstOptionSelected?: boolean,
  /**
   * Second element selection
   */
  secondOptionSelected?: boolean,
  /**
   * First element click handler
   */
  onFirstOptionClick: () => void,
  /**
   * Second element click handler
   */
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
      <Grid container className={ classes.root } xs={ 6 } spacing={ 1 } justify="space-between">
        <Grid item xs={ 6 }>
          <Button 
            startIcon={ firstOptionIcon ? firstOptionIcon : "" }
            className={ classNames( classes.button, !firstOptionText ? "no-text": "", firstOptionSelected ? "selected" : "" ) }
            onClick={() => onFirstOptionClick() } >
            { firstOptionText }
          </Button>
        </Grid>
        <Grid item xs={ 6 }>
          <Button 
            startIcon={ secondOptionIcon ? secondOptionIcon : "" }
            className={ classNames( classes.button, !secondOptionText ? "no-text": "", secondOptionSelected ? "selected" : "" ) }
            onClick={() => onSecondOptionClick() } >
            { secondOptionText }
          </Button>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SelectionGroup);