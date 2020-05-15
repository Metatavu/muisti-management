import * as React from "react";
import { ExhibitionDevice, ScreenOrientation, DeviceModel, PageLayoutViewProperty, PageLayoutViewPropertyType } from "../../../generated/client";
import strings from "../../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, Typography, Grid, Button } from "@material-ui/core";
import styles from "../../../styles/margin-padding-editor";
import { ReduxActions, ReduxState } from "../../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import LinkIcon from '@material-ui/icons/Link';
import UnLinkIcon from '@material-ui/icons/LinkOff';

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  properties: PageLayoutViewProperty[];
  itemKey: string;

  /**
   * On select change handler
   * @param key property key
   * @param value property value
   */
  onSingleValueChange: (propertyToUpdate: PageLayoutViewProperty) => void;
  onMultipleValueChange: (propertiesToUpdate: PageLayoutViewProperty[]) => void;

}

/**
 * Interface representing component state
 */
interface State {
  valuesLinked: boolean;
}

/**
 * Component for add device editor
 */
class MarginPaddingEditor extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      valuesLinked: false
    };
  }

  public componentDidMount = () => {
  }

  public componentDidUpdate = (prevProps: Props) => {

    if (prevProps.properties !== this.props.properties) {
      console.log(this.props.properties)
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, properties, itemKey } = this.props;
    const { valuesLinked } = this.state;
    console.log(properties)
    if (properties.length !== 4) {
      return (<div/>);
    }
    // const gridItems = properties.map(property => {
    //   return (
    //     <div key={ property.name }>
    //       <TextField
    //         className={ classes.input }
    //         id="outlined-basic"
    //         name={ property.name }
    //         variant="outlined"
    //         type="number"
    //         value={ property.value.substring(0, property.value.length - 2) }
    //         onChange={ valuesLinked ? this.onLinkedTextFieldChange : this.onTextFieldChange }
    //       />
    //     </div>
    //   );
    // });
    return (
      <div className={ itemKey === "layout_padding" ? classes.paddingContainer : classes.marginContainer } key={ itemKey }>
        <div className={ itemKey === "layout_padding" ? classes.paddingInnerContainer : classes.marginInnerContainer } >
          <div className={ classes.topRow }>
            <TextField
              className={ classes.input }
              id="outlined-basic"
              name={ properties[0].name }
              variant="standard"
              type="number"
              value={ properties[0].value.substring(0, properties[0].value.length - 2) }
              onChange={ valuesLinked ? this.onLinkedTextFieldChange : this.onTextFieldChange }
            />
          </div>
          <div className={ classes.middleRow }>
          <TextField
              className={ classes.input }
              id="outlined-basic"
              name={ properties[1].name }
              variant="standard"
              type="number"
              value={ properties[1].value.substring(1, properties[1].value.length - 2) }
              onChange={ valuesLinked ? this.onLinkedTextFieldChange : this.onTextFieldChange }
            />
          <Button className={ classes.toggleLink } disableElevation variant="contained" color="inherit" onClick={ this.onLinkValuesClick }>
            { valuesLinked ? <LinkIcon color="secondary" /> : <UnLinkIcon color="primary" /> }
          </Button>
          <TextField
              className={ classes.input }
              id="outlined-basic"
              name={ properties[2].name }
              variant="standard"
              type="number"
              value={ properties[2].value.substring(2, properties[2].value.length - 2) }
              onChange={ valuesLinked ? this.onLinkedTextFieldChange : this.onTextFieldChange }
            />
          </div>
          <div className={ classes.bottomRow }>
          <TextField
              className={ classes.input }
              id="outlined-basic"
              name={ properties[3].name }
              variant="standard"
              type="number"
              value={ properties[3].value.substring(3, properties[3].value.length - 2) }
              onChange={ valuesLinked ? this.onLinkedTextFieldChange : this.onTextFieldChange }
            />
          </div>
        </div>
      </div>
    );
  }

  private onLinkedTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onMultipleValueChange, properties } = this.props;
    const key = event.target.name;
    const value = event.target.value;
    if (!key || !value) {
      return;
    }
    const propertiesToUpdate: PageLayoutViewProperty[] = [];
    properties.forEach(prop => {
      const propertyToUpdate = prop;
      propertyToUpdate.value = value + "dp";
      propertiesToUpdate.push(propertyToUpdate);
    });

    onMultipleValueChange(propertiesToUpdate);
  }

  private onTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onSingleValueChange, properties } = this.props;

    const key = event.target.name;
    const value = event.target.value;
    if (!key || !value) {
      return;
    }

    const propertyToUpdate = properties.find(prop => prop.name === key);
    if (!propertyToUpdate) {
      return;
    }
    propertyToUpdate.value = value + "dp";
    onSingleValueChange(propertyToUpdate);
  }

  private onLinkValuesClick = () => {
    this.setState({
      valuesLinked: !this.state.valuesLinked
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MarginPaddingEditor));