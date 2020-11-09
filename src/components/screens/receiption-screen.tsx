import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { DeviceModel } from "../../generated/client";
import { AccessToken } from '../../types';
import strings from "../../localization/strings";
import BasicLayout from "../layouts/basic-layout";
import { setDeviceModels } from "../../actions/devices";
import TagListener from "../generic/tag-listener";
import MqttListener from "../generic/mqtt-listener";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  formError: boolean;
  error?: Error;
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
      formError: false,
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

    const antenna = process.env.REACT_APP_NEW_VISITOR_ANTENNA;
    if (!antenna) {
      return null;
    }
    
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ strings.device.title }
        breadcrumbs={ [] }
        error={ this.state.error }
        noBackButton
      >
        <MqttListener onError={ this.onMqttError }>
          { mqtt => (
            <TagListener threshold={ 75 } mqtt={ mqtt } antenna={ antenna }>
              { tag => (
                <div> 
                  <p> { tag } </p>
                </div>
              )}
            </TagListener>
          )}
        </MqttListener>
      </BasicLayout>
    );
  }

  private onMqttError = (error: Error) => {
    this.setState({
      error: error
    });
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
    setDeviceModels: (deviceModels: DeviceModel[]) => dispatch(setDeviceModels(deviceModels))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DeviceModelsScreen));
