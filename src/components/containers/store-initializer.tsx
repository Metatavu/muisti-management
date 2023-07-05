import { setDeviceModels } from "../../actions/devices";
import { setExhibitions } from "../../actions/exhibitions";
import { setLayouts } from "../../actions/layouts";
import { setSubLayouts } from "../../actions/subLayouts";
import Api from "../../api/api";
import { DeviceModel, Exhibition, PageLayout, SubLayout } from "../../generated/client";
import { ReduxActions, ReduxState } from "../../store";
import { AccessToken } from "../../types";
import ErrorDialog from "../generic/error-dialog";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Component props
 */
interface Props {
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions?: Exhibition[];
  layouts?: PageLayout[];
  subLayouts?: SubLayout[];
  deviceModels: DeviceModel[];
  setExhibitions: typeof setExhibitions;
  setLayouts: typeof setLayouts;
  setSubLayouts: typeof setSubLayouts;
  setDeviceModels: typeof setDeviceModels;
  children: React.ReactNode;
}

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
   * Component did mount life cycle event
   */
  public componentDidMount = async () => {
    try {
      const { accessToken } = this.props;
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      const layoutsApi = Api.getPageLayoutsApi(accessToken);
      const subLayoutsApi = Api.getSubLayoutsApi(accessToken);
      const deviceModelsApi = Api.getDeviceModelsApi(accessToken);

      const [exhibitions, layouts, subLayouts, deviceModels] = await Promise.all([
        exhibitionsApi.listExhibitions(),
        layoutsApi.listPageLayouts({}),
        subLayoutsApi.listSubLayouts(),
        deviceModelsApi.listDeviceModels()
      ]);

      this.props.setExhibitions(exhibitions);
      this.props.setLayouts(layouts);
      this.props.setSubLayouts(subLayouts);
      this.props.setDeviceModels(deviceModels);
    } catch (e) {
      this.setState({
        error: e
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { exhibitions, layouts, subLayouts, deviceModels, children } = this.props;
    if (this.state.error) {
      return (
        <ErrorDialog error={this.state.error} onClose={() => this.setState({ error: undefined })} />
      );
    }

    return exhibitions && layouts && subLayouts && deviceModels ? children : null;
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
    subLayouts: state.subLayouts.subLayouts,
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
    setSubLayouts: (subLayouts: SubLayout[]) => dispatch(setSubLayouts(subLayouts)),
    setDeviceModels: (deviceModels: DeviceModel[]) => dispatch(setDeviceModels(deviceModels))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreInitializer);
