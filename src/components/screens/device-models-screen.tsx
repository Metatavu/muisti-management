import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { DeviceModel } from "../../generated/client";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../generic/basic-layout";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  deviceModels: DeviceModel[];
}

/**
 * Component state
 */
interface State {
  loading: boolean;
}

/**
 * Component for device models screen
 */
export class DeviceModelsScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;

    if (this.state.loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ strings.layout.title }
        breadcrumbs={ [] }
        actionBarButtons={ actionBarButtons }
      >
        <div className={ classes.cardView }>
          { this.renderDeviceModelsCardsList() }
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders device models as card list
   */
  private renderDeviceModelsCardsList = () => {
    const { deviceModels } = this.props;
    const cardMenuOptions = this.getCardMenuOptions();
    const cards = deviceModels.map(deviceModel => {
      const deviceModelId = deviceModel.id;
      if (!deviceModelId) {
        return null;
      }

      return (
        <CardItem
          key={ deviceModel.id }
          title={ `${deviceModel.manufacturer} ${deviceModel.model}` }
          onClick={ () => this.onCardClick(deviceModelId) }
          cardMenuOptions={ cardMenuOptions }
          status={ "" }
        />
      );
    });

    return (
      <CardList title={ "" }>
        { cards }
      </CardList>
    );
  }

  /**
   * Get card menu options
   *
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.setStatus,
      action: this.setStatus
    }];
  }

  /**
   * Event handler for card click
   */
  private onCardClick = (deviceModelId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/${deviceModelId}`);
  }

  /**
   * Set status handler
   */
  private setStatus = () => {
    alert(strings.comingSoon);
    return;
  }

  /**
   * Get action buttons
   * 
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.dashboard.devices.newDevice, action: () => null }
    ] as ActionButton[];
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken,
    deviceModels: state.devices.deviceModels
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DeviceModelsScreen));