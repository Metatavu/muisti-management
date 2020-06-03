import * as React from "react";

import { connect } from "react-redux";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { setExhibitions } from "../../actions/exhibitions";
import { setLayouts } from "../../actions/layouts";
import { setDeviceModels } from "../../actions/devices";

import { AccessToken } from "../../types"
import ErrorDialog from "../generic/error-dialog";
import { KeycloakInstance } from "keycloak-js";
import { Exhibition, PageLayout, DeviceModel } from "../../generated/client";
import Api from "../../api/api";


/**
 * Component props
 */
interface Props {
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions?: Exhibition[];
  layouts?: PageLayout[];
  deviceModels: DeviceModel[];
  setExhibitions: typeof setExhibitions;
  setLayouts: typeof setLayouts;
  setDeviceModels: typeof setDeviceModels;
};

/**
 * Component state
 */
interface State {
  error?: Error;
}

/**
 * Component for fetching initial data
 */
class StoreInitializer extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props props
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component did mount life-cycle event
   */
  public componentDidMount = async () => {
    try {
      const { accessToken } = this.props;
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      const layoutsApi = Api.getPageLayoutsApi(accessToken);
      const deviceModelsApi = Api.getDeviceModelsApi(accessToken);

      const [ exhibitions, layouts, deviceModels ] = await Promise.all([
        exhibitionsApi.listExhibitions(),
        layoutsApi.listPageLayouts({}),
        deviceModelsApi.listDeviceModels()
      ]);

      this.props.setExhibitions(exhibitions);
      this.props.setLayouts(layouts);
      this.props.setDeviceModels(deviceModels);
    } catch (e) {
      this.setState({
        error: e
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    if (this.state.error) {
      return <ErrorDialog error={ this.state.error } onClose={ () => this.setState({ error: undefined }) } />
    }

    return (
      this.props.exhibitions &&
      this.props.layouts &&
      this.props.deviceModels ?
      this.props.children : null
    );
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    accessToken: state.auth.accessToken as AccessToken,
    keycloak: state.auth.keycloak as KeycloakInstance,
    exhibitions: state.exhibitions.exhibitions,
    layouts: state.layouts.layouts,
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
    setExhibitions: (exhibitions: Exhibition[]) => dispatch(setExhibitions(exhibitions)),
    setLayouts: (layouts: PageLayout[]) => dispatch(setLayouts(layouts)),
    setDeviceModels: (deviceModels: DeviceModel[]) => dispatch(setDeviceModels(deviceModels))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreInitializer);