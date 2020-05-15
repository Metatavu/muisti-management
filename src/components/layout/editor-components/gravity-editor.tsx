import * as React from "react";
import { ExhibitionDevice, ScreenOrientation, DeviceModel, PageLayoutViewProperty, PageLayoutViewPropertyType } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, Typography, Grid, Button } from "@material-ui/core";
import styles from "../../../styles/gravity-editor";
import { ReduxActions, ReduxState } from "../../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import LinkIcon from '@material-ui/icons/Link';

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

  public componentDidMount = () => {
  }

  public componentDidUpdate = (prevProps: Props) => {
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, property } = this.props;

    return (
      <div className={ classes.gravitySelector } key={ property.name + "-grid" }>
        <div className={ classes.topRow }>
          <Button className={ classes.button }>TL</Button>
          <Button className={ classes.button }>TC</Button>
          <Button className={ classes.button }>TR</Button>
        </div>
        <div className={ classes.middleRow }>
          <Button className={ classes.button }>CL</Button>
          <Button className={ classes.button }>CC</Button>
          <Button className={ classes.button }>CR</Button>
        </div>
        <div className={ classes.bottomRow }>
          <Button className={ classes.button }>BL</Button>
          <Button className={ classes.button }>BC</Button>
          <Button className={ classes.button }>BR</Button>
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