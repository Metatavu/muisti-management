import * as React from "react";
import { PageLayoutViewProperty } from "../../../generated/client";
import { WithStyles, withStyles, MenuItem, Select } from "@material-ui/core";
import styles from "../../../styles/add-device-editor";
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
        id={ property.name }
        onChange={ this.handleSelectChange }
        name={ property.name }
        value={ property.value }
      >
        { this.getSelectItems() }
      </Select>
    );
  }

  /**
   * Handle select value change
   * @param event react change event
   */
  private handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { onSelectChange, property } = this.props;

    const value = event.target.value as string;

    if (!value) {
      return;
    }

    const propertyToUpdate = property;
    property.value = value;
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

/**
 * Get any enum keys
 * @param enumObject enum object
 */
function enumKeys<T>(enumObject: T) {
  return Object.keys(enumObject);
}

/**
 * Get any enum values
 * @param enumObject enum object
 */
function enumValues<T>(enumObject: T) {
  return Object.values(enumObject);
}

export default (withStyles(styles)(GenericPropertySelect));