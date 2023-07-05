import { PageLayoutViewProperty } from "../../../generated/client";
import strings from "../../../localization/strings";
import styles from "../../../styles/add-device-editor";
import {
  LayoutGravityValuePairs,
  LayoutHeightValues,
  LayoutWidthValues,
  LinearLayoutOrientationValues,
  SelectedTabIndicatorGravityValues,
  TabGravityValues,
  TextViewTextAlignValues,
  TextViewTextStyleValues
} from "../editor-constants/values";
import { MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  tooltip?: string;
  property: PageLayoutViewProperty;
  selectItemType:
    | typeof LayoutWidthValues
    | typeof LayoutHeightValues
    | typeof LayoutGravityValuePairs
    | typeof TextViewTextStyleValues
    | typeof TextViewTextAlignValues
    | typeof LinearLayoutOrientationValues
    | typeof TabGravityValues
    | typeof SelectedTabIndicatorGravityValues;

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
 * Component for generic layout editor select
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

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { selectItemType } = this.props;
    const values = enumValues(selectItemType);
    const keys = enumKeys(selectItemType);

    this.setState({
      itemKeyList: keys,
      itemValueList: values
    });
  };

  /**
   * Component render method
   */
  public render() {
    const { property, tooltip } = this.props;
    return (
      <Select
        title={tooltip}
        id={property.name}
        onChange={this.handleSelectChange}
        name={property.name}
        value={property.value || "undefined"}
      >
        {this.renderNoSelection()}
        {this.getSelectItems()}
      </Select>
    );
  }

  /**
   * Renders no selection item
   */
  private renderNoSelection = () => {
    return (
      <MenuItem key={"undefined"} value={"undefined"}>
        {strings.generic.undefined}
      </MenuItem>
    );
  };

  /**
   * Handle select value change
   *
   * @param event react change event
   */
  private handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { onSelectChange, property } = this.props;
    const value = event.target.value as string;
    const propertyToUpdate = property;
    property.value = value !== "undefined" ? value : "";
    onSelectChange(propertyToUpdate);
  };

  /**
   * Generate select items
   */
  private getSelectItems = () => {
    const { itemKeyList, itemValueList } = this.state;
    return itemKeyList.map((key, index) => {
      return (
        <MenuItem key={key} value={itemValueList[index]}>
          {key}
        </MenuItem>
      );
    });
  };
}

/**
 * Get any enum keys
 *
 * @param enumObject enum object
 */
function enumKeys<T>(enumObject: T) {
  return Object.keys(enumObject);
}

/**
 * Get any enum values
 *
 * @param enumObject enum object
 */
function enumValues<T>(enumObject: T) {
  return Object.values(enumObject);
}

export default withStyles(styles)(GenericPropertySelect);
