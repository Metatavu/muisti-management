import { PageLayoutViewProperty } from "../../../generated/client";
import styles from "../../../styles/components/layout-screen/margin-padding-editor";
import { LayoutMarginPropKeys, LayoutPaddingPropKeys } from "../editor-constants/keys";
import LinkIcon from "@mui/icons-material/Link";
import UnLinkIcon from "@mui/icons-material/LinkOff";
import { Button, TextField } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  properties: PageLayoutViewProperty[];
  itemKey: string;

  /**
   * On singe page layout view property change handler
   * @param propertyToUpdate property to update
   */
  onSingleValueChange: (propertyToUpdate: PageLayoutViewProperty) => void;

  /**
   * On multiple page layout view property change handler
   * @param propertyToUpdate list of properties to update
   */
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
 * Component for editing layout margins and paddings
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
      controllingType: props.itemKey === "layout_padding" ? "padding" : "margin"
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, itemKey } = this.props;
    const { valuesLinked, controllingType } = this.state;

    return (
      <div
        className={
          itemKey === "layout_padding" ? classes.paddingContainer : classes.marginContainer
        }
        key={itemKey}
      >
        <div
          className={
            itemKey === "layout_padding"
              ? classes.paddingInnerContainer
              : classes.marginInnerContainer
          }
        >
          <div className={classes.topRow}>
            {this.renderTextField(
              controllingType === "padding"
                ? LayoutPaddingPropKeys.LayoutPaddingTop
                : LayoutMarginPropKeys.LayoutMarginTop
            )}
          </div>
          <div className={classes.middleRow}>
            {this.renderTextField(
              controllingType === "padding"
                ? LayoutPaddingPropKeys.LayoutPaddingLeft
                : LayoutMarginPropKeys.LayoutMarginLeft
            )}
            <Button
              className={classes.toggleLink}
              disableElevation
              variant="contained"
              color="inherit"
              onClick={this.onLinkValuesClick}
            >
              {valuesLinked ? <LinkIcon color="secondary" /> : <UnLinkIcon color="primary" />}
            </Button>
            {this.renderTextField(
              controllingType === "padding"
                ? LayoutPaddingPropKeys.LayoutPaddingRight
                : LayoutMarginPropKeys.LayoutMarginRight
            )}
          </div>
          <div className={classes.bottomRow}>
            {this.renderTextField(
              controllingType === "padding"
                ? LayoutPaddingPropKeys.LayoutPaddingBottom
                : LayoutMarginPropKeys.LayoutMarginBottom
            )}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render text field
   *
   * @param propertyName name of the property
   */
  private renderTextField = (propertyName: string) => {
    const { classes } = this.props;
    const { valuesLinked } = this.state;
    const foundProperty = this.getPropertyToDisplay(propertyName);

    if (!foundProperty) {
      return <div />;
    }

    return (
      <TextField
        className={classes.input}
        fullWidth={false}
        id="outlined-basic"
        name={foundProperty.name}
        variant="standard"
        type="number"
        value={foundProperty.value.substring(0, foundProperty.value.length - 2)}
        onChange={valuesLinked ? this.onLinkedTextFieldChange : this.onTextFieldChange}
      />
    );
  };

  /**
   * Handler when linked value changed is enabled
   *
   * @param event react change event
   */
  private onLinkedTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onMultipleValueChange, properties } = this.props;
    const key = event.target.name;
    const value = event.target.value;
    if (!key) {
      return;
    }
    const propertiesToUpdate: PageLayoutViewProperty[] = [];
    properties.forEach((prop) => {
      const propertyToUpdate = prop;
      propertyToUpdate.value = (value || 0) + "px";
      propertiesToUpdate.push(propertyToUpdate);
    });

    onMultipleValueChange(propertiesToUpdate);
  };

  /**
   * Handler when linked value changed is disabled (single filed is updated)
   *
   * @param event react change event
   */
  private onTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onSingleValueChange, properties } = this.props;

    const key = event.target.name;
    const value = event.target.value;
    if (!key) {
      return;
    }

    const propertyToUpdate = properties.find((prop) => prop.name === key);
    if (!propertyToUpdate) {
      return;
    }
    propertyToUpdate.value = (value || 0) + "px";
    onSingleValueChange(propertyToUpdate);
  };

  /**
   * On link values click handler
   */
  private onLinkValuesClick = () => {
    this.setState({
      valuesLinked: !this.state.valuesLinked
    });
  };

  /**
   * Get property to display handler
   *
   * @param propertyName property name (key) to find
   * @returns found page layout view property of undefined
   */
  private getPropertyToDisplay = (propertyName: string): PageLayoutViewProperty | undefined => {
    const { properties } = this.props;
    return properties.find((property) => property.name === propertyName);
  };
}

export default withStyles(styles)(MarginPaddingEditor);
