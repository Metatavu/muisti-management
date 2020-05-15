import * as React from "react";
import { ExhibitionDevice, ScreenOrientation, DeviceModel, PageLayoutViewPropertyType, PageLayoutViewProperty } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, Typography, Grid } from "@material-ui/core";
import styles from "../../../styles/add-device-editor";
import { ReduxActions, ReduxState } from "../../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { LayoutWidthValues, LayoutHeightValues } from "../editor-constants/values";
import { SketchPicker, ColorChangeHandler, ColorResult } from 'react-color';


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
  onColorChange: (propertyToUpdate: PageLayoutViewProperty) => void;
}

/**
 * Interface representing component state
 */
interface State {
  showColorPicker: boolean;
}

/**
 * Component for add device editor
 */
class GenericPropertySelect extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      showColorPicker: false
    };
  }

  public componentDidMount = () => {
  }

  /**
   * Component render method
   */
  public render() {
    const { property } = this.props;
    const { showColorPicker } = this.state;
    return (
      <>
        <div style={{ width: "50px", height: "50px", backgroundColor: property.value }} onClick={ this.onColorBoxClick }></div>
        { showColorPicker && 
          <SketchPicker
            color={ property.value }
            onChangeComplete={ this.handleChangeComplete }
          />
        }
    </>
  );
  }

  private handleChangeComplete = (color: ColorResult) => {
    const { onColorChange, property } = this.props;
    const propertyToUpdate = property;
    property.value = color.hex;
    onColorChange(propertyToUpdate);
  };

  private onColorBoxClick = () => {
    this.setState({
      showColorPicker: !this.state.showColorPicker
    });
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GenericPropertySelect));