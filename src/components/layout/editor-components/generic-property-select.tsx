import * as React from "react";
import { ExhibitionDevice, ScreenOrientation, DeviceModel, PageLayoutViewPropertyType, PageLayoutViewProperty } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, Typography, Grid } from "@material-ui/core";
import styles from "../../../styles/add-device-editor";
import { ReduxActions, ReduxState } from "../../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { LayoutWidthValues, LayoutHeightValues, LayoutGravityValuePairs } from "../editor-constants/values";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;
  selectItemType: typeof LayoutWidthValues | typeof LayoutHeightValues | typeof LayoutGravityValuePairs;

  /**
   * On select change handler
   */
  onSelectChange: (propertyToUpdate: PageLayoutViewProperty) => void;
}

/**
 * Interface representing component state
 */
interface State {
  itemKeyList: string[];
  itemValueList: string[];
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
      itemKeyList: [],
      itemValueList: []
    };
  }

  public componentDidMount = () => {
    const { selectItemType } = this.props;
    const values = enumValues(selectItemType);
    const keys = enumKeys(selectItemType);

    this.setState({
      itemKeyList : keys,
      itemValueList: values
    });
  }

  /**
   * Component render method
   */
  public render() {
    const { property } = this.props;
    return (
      <Select
        fullWidth
        // labelId={  }
        id={ property.name }
        onChange={ this.handleSelectChange }
        name={ property.name }
        value={ property.value }
      >
        { this.getSelectItems() }
      </Select>
    );
  }

  private handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { onSelectChange, property } = this.props;

    const value = event.target.value as string;

    if (!value) {
      return;
    }

    const propertyToUpdate = property;
    property.value = value;
    console.log(propertyToUpdate);
    onSelectChange(propertyToUpdate);
  }

  /**
   * Generate select items
   */
  private getSelectItems = () => {
    const { itemKeyList, itemValueList } = this.state;
    return itemKeyList.map((key, index) => {
      return <MenuItem key={ key } value={ itemValueList[index] }>{ key }</MenuItem>;
    });
  }
}
  
function enumKeys<T>(enumObject: T) {
  return Object.keys(enumObject);
}

function enumValues<T>(enumObject: T) {
  return Object.values(enumObject);
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