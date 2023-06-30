import { PageLayoutViewProperty } from "../../../generated/client";
import strings from "../../../localization/strings";
import styles from "../../../styles/components/layout-screen/gravity-editor";
import ArrowIcon from "@mui/icons-material/ArrowBack";
import GravityIcon from "@mui/icons-material/OpenWith";
import CenterIcon from "@mui/icons-material/VerticalAlignCenter";
import { Button } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import classNames from "classnames";
import * as React from "react";

import theme from "../../../styles/theme";
import {
  LayoutGravityValuePairs,
  SelectedTabIndicatorGravityValues,
  TabGravityValues
} from "../editor-constants/values";
import GenericPropertySelect from "./generic-property-select";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  property: PageLayoutViewProperty;
  gravityOptions?: typeof TabGravityValues | typeof SelectedTabIndicatorGravityValues;

  /**
   * On singe page layout view property change handler
   * @param propertyToUpdate property to update
   */
  onSingleValueChange: (propertyToUpdate: PageLayoutViewProperty) => void;
}

/**
 * Component for editing layout gravities
 */
class GravityEditor extends React.Component<Props, {}> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, property, gravityOptions } = this.props;

    if (gravityOptions) {
      return (
        <div style={{ display: "flex" }}>
          <div
            style={{
              marginTop: theme.spacing(2),
              marginLeft: theme.spacing(4),
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <GravityIcon style={{ marginRight: theme.spacing(2) }} />
              <GenericPropertySelect
                tooltip={strings.layoutEditor.commonComponents.layoutGravityTooltip}
                property={property}
                onSelectChange={this.props.onSingleValueChange}
                selectItemType={gravityOptions}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: "flex" }}>
        <div className={classes.gravitySelector} key={property.name + "-grid"}>
          <div className={classes.topRow}>
            {this.renderGravityButton(LayoutGravityValuePairs.LeftTop, {
              transform: "rotate(45deg)"
            } as React.CSSProperties)}
            {this.renderGravityButton(LayoutGravityValuePairs.Top, {
              transform: "rotate(90deg)"
            } as React.CSSProperties)}
            {this.renderGravityButton(LayoutGravityValuePairs.RightTop, {
              transform: "rotate(135deg)"
            } as React.CSSProperties)}
          </div>
          <div className={classes.middleRow}>
            {this.renderGravityButton(LayoutGravityValuePairs.LeftCenter)}
            <Button
              className={classNames(
                classes.button,
                property.value === LayoutGravityValuePairs.Center ? "selected" : ""
              )}
              onClick={() => this.onGravityClick(LayoutGravityValuePairs.Center)}
            >
              <CenterIcon />
            </Button>
            {this.renderGravityButton(LayoutGravityValuePairs.RightCenter, {
              transform: "rotate(180deg)"
            } as React.CSSProperties)}
          </div>
          <div className={classes.bottomRow}>
            {this.renderGravityButton(LayoutGravityValuePairs.LeftBottom, {
              transform: "rotate(-45deg)"
            } as React.CSSProperties)}
            {this.renderGravityButton(LayoutGravityValuePairs.Bottom, {
              transform: "rotate(-90deg)"
            } as React.CSSProperties)}
            {this.renderGravityButton(LayoutGravityValuePairs.RightBottom, {
              transform: "rotate(-135deg)"
            } as React.CSSProperties)}
          </div>
        </div>
        <div
          style={{
            marginTop: theme.spacing(2),
            marginLeft: theme.spacing(4),
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <GravityIcon style={{ marginRight: theme.spacing(2) }} />
            <GenericPropertySelect
              property={property}
              onSelectChange={this.props.onSingleValueChange}
              selectItemType={LayoutGravityValuePairs}
            />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render gravity button
   *
   * @param value current property value
   * @param cssProp css property for rotating the arrow icon
   */
  private renderGravityButton = (value: string, cssProp?: React.CSSProperties) => {
    const { classes, property } = this.props;
    return (
      <Button
        title={strings.layoutEditor.commonComponents.layoutGravityTooltip}
        className={classNames(classes.button, property.value === value ? "selected" : "")}
        onClick={() => this.onGravityClick(value)}
      >
        <ArrowIcon style={cssProp} />
      </Button>
    );
  };

  /**
   * On gravity icon click handler
   *
   * @param value button element value
   */
  private onGravityClick = (value: string) => {
    const { onSingleValueChange, property } = this.props;

    if (!value) {
      return;
    }

    const alreadySelected = value === property.value;
    const propertyToUpdate = property;
    propertyToUpdate.value = !alreadySelected ? value : "";
    onSingleValueChange(propertyToUpdate);
  };
}

export default withStyles(styles)(GravityEditor);
