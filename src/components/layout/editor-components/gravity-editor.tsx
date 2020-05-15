import * as React from "react";
import { PageLayoutViewProperty } from "../../../generated/client";
import { WithStyles, withStyles, Button, TextField } from "@material-ui/core";
import styles from "../../../styles/gravity-editor";
import { ReduxActions, ReduxState } from "../../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import classNames from "classnames";

import ArrowIcon from '@material-ui/icons/ArrowLeft';
import CenterIcon from '@material-ui/icons/VerticalAlignCenter';

import HorizontalIcon from '@material-ui/icons/SwapHoriz';
import VerticalIcon from '@material-ui/icons/SwapVert';
import theme from "../../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;

  /**
   * On select change handler
   * @param key property key
   * @param value property value
   */
  onSingleValueChange: (propertyToUpdate: PageLayoutViewProperty) => void;

}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for add device editor
 */
class GravityEditor extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  public componentDidMount = () => {}

  public componentDidUpdate = (prevProps: Props) => {}

  /**
   * Component render method
   */
  public render() {
    const { classes, property } = this.props;

    return (
      <div style={{ display: "flex" }}>
        <div className={ classes.gravitySelector } key={ property.name + "-grid" }>
          <div className={ classes.topRow }>
            <Button className={ classNames( classes.button, "selected" ) }><ArrowIcon style={{ transform: "rotate(45deg)" }} /></Button>
            <Button className={ classes.button }><ArrowIcon style={{ transform: "rotate(90deg)" }} /></Button>
            <Button className={ classes.button }><ArrowIcon style={{ transform: "rotate(135deg)" }} /></Button>
          </div>
          <div className={ classes.middleRow }>
            <Button className={ classes.button }><ArrowIcon /></Button>
            <Button className={ classes.button }><CenterIcon /></Button>
            <Button className={ classes.button }><ArrowIcon style={{ transform: "rotate(180deg)" }} /></Button>
          </div>
          <div className={ classes.bottomRow }>
            <Button className={ classes.button }><ArrowIcon style={{ transform: "rotate(-45deg)" }} /></Button>
            <Button className={ classes.button }><ArrowIcon style={{ transform: "rotate(-90deg)" }} /></Button>
            <Button className={ classes.button }><ArrowIcon style={{ transform: "rotate(-135deg)" }} /></Button>
          </div>
        </div>
        <div style={{ marginLeft: theme.spacing(4), marginTop: theme.spacing(2) }}>
          <div style={{ display: "flex", marginBottom: theme.spacing(4) }}>
            <HorizontalIcon />
            {/* Select tähän */}
          </div>
          <div style={{ display: "flex" }}>
            <VerticalIcon />
            {/* Select tähän */}
          </div>
        </div>
      </div>
    );
  }

  private onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onSingleValueChange, property } = this.props;

    const key = event.target.name;
    const value = event.target.value;
    if (!key || !value) {
      return;
    }

    const propertyToUpdate = property;
    propertyToUpdate.value = value;
    onSingleValueChange(propertyToUpdate);
  }
}


/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return { };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GravityEditor));