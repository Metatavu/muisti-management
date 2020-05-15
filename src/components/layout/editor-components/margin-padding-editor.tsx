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
import { LayoutPaddingPropKeys, LayoutMarginPropKeys } from "../editor-constants/keys";

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
  controllingType: string;
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
      valuesLinked: false,
      controllingType: (props.itemKey === "layout_padding" ? "padding" : "margin")
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
    const { valuesLinked, controllingType } = this.state;
    if (properties.length !== 4) {
      return (<div/>);
    }

    return (
      <div className={ itemKey === "layout_padding" ? classes.paddingContainer : classes.marginContainer } key={ itemKey }>
        <div className={ itemKey === "layout_padding" ? classes.paddingInnerContainer : classes.marginInnerContainer } >
          <div className={ classes.topRow }>
            { this.renderTextField(controllingType === "padding" ? LayoutPaddingPropKeys.LayoutPaddingTop : LayoutMarginPropKeys.LayoutMarginTop) }
          </div>
          <div className={ classes.middleRow }>
          { this.renderTextField(controllingType === "padding" ? LayoutPaddingPropKeys.LayoutPaddingLeft : LayoutMarginPropKeys.LayoutMarginLeft) }
          <Button className={ classes.toggleLink } disableElevation variant="contained" color="inherit" onClick={ this.onLinkValuesClick }>
            { valuesLinked ? <LinkIcon color="secondary" /> : <UnLinkIcon color="primary" /> }
          </Button>
          { this.renderTextField(controllingType === "padding" ? LayoutPaddingPropKeys.LayoutPaddingRight : LayoutMarginPropKeys.LayoutMarginRight) }
          </div>
          <div className={ classes.bottomRow }>
          { this.renderTextField(controllingType === "padding" ? LayoutPaddingPropKeys.LayoutPaddingBottom : LayoutMarginPropKeys.LayoutMarginBottom) }
          </div>
        </div>
      </div>
    );
  }

  private renderTextField = (propertyName: string) => {
    const { classes } = this.props;
    const { valuesLinked } = this.state;
    const foundProperty = this.getPropertyToDisplay(propertyName);

    if (!foundProperty) {
      return (
        <div/>
      );
    }

    return (
      <TextField
        className={ classes.input }
        id="outlined-basic"
        name={ foundProperty.name }
        variant="standard"
        type="number"
        value={ foundProperty.value.substring(0, foundProperty.value.length - 2) }
        onChange={ valuesLinked ? this.onLinkedTextFieldChange : this.onTextFieldChange }
      />
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

  private getPropertyToDisplay = (propertyName: string): PageLayoutViewProperty | undefined => {
    const { properties } = this.props;
    return properties.find(property => property.name === propertyName);
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