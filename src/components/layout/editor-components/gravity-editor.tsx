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

import GravityIcon from '@material-ui/icons/OpenWith';
import theme from "../../../styles/theme";
import { LayoutGravityValues, LayoutGravityValuePairs } from "../editor-constants/values";
import GenericPropertySelect from "./generic-property-select";

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
            { this.renderGravityButton(LayoutGravityValuePairs.LeftTop, { transform: "rotate(45deg)" } as React.CSSProperties) }
            { this.renderGravityButton(LayoutGravityValuePairs.Top, { transform: "rotate(90deg)" } as React.CSSProperties) }
            { this.renderGravityButton(LayoutGravityValuePairs.RightTop, { transform: "rotate(135deg)" } as React.CSSProperties) }
          </div>
          <div className={ classes.middleRow }>
            { this.renderGravityButton(LayoutGravityValuePairs.LeftCenter) }
            <Button
              className={ classNames( classes.button, property.value === LayoutGravityValuePairs.Center ? "selected" : "") }
              onClick={ () => this.onGravityClick(LayoutGravityValuePairs.Center) }
            >
              <CenterIcon />
            </Button>
            { this.renderGravityButton(LayoutGravityValuePairs.RightCenter, { transform: "rotate(180deg)" } as React.CSSProperties) }
          </div>
          <div className={ classes.bottomRow }>
            { this.renderGravityButton(LayoutGravityValuePairs.LeftBottom, { transform: "rotate(-45deg)" } as React.CSSProperties) }
            { this.renderGravityButton(LayoutGravityValuePairs.Bottom, { transform: "rotate(-90deg)" } as React.CSSProperties) }
            { this.renderGravityButton(LayoutGravityValuePairs.RightBottom, { transform: "rotate(-135deg)" } as React.CSSProperties) }
          </div>
        </div>
        <div style={{ marginTop: theme.spacing(2), marginLeft: theme.spacing(4), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex" }}>
            <GravityIcon />
            <GenericPropertySelect
              property={ property }
              onSelectChange={ this.props.onSingleValueChange }
              selectItemType={ LayoutGravityValuePairs }
            />
          </div>
        </div>
      </div>
    );
  }

  private renderGravityButton = (value: string, cssProp?: React.CSSProperties ) => {
    const { classes, property } = this.props;
    return (
      <Button
        className={ classNames( classes.button, property.value === value ? "selected" : "") }
        onClick={ () => this.onGravityClick(value) }
      >
        <ArrowIcon style={ cssProp } />
      </Button>
    );
  }

  private onGravityClick = (value: string) => {
    const { onSingleValueChange, property } = this.props;

    if (!value) {
      return;
    }

    const propertyToUpdate = property;
    propertyToUpdate.value = value;
    console.log(propertyToUpdate);
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