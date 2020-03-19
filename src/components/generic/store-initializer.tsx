import * as React from "react";

import { connect } from "react-redux";
import { ReduxState, ReduxActions } from "../../store";
import { Dispatch } from "redux";
import { setExhibitions } from "../../actions/exhibitions";
import { setLayouts } from "../../actions/layouts";
import { setDevices } from "../../actions/devices";

import { AccessToken } from "../../types"
import ErrorDialog from "./error-dialog";
import { KeycloakInstance } from "keycloak-js";
import { Exhibition, PageLayout, ExhibitionDevice } from "../../generated/client";
import Api from "../../api/api";


/**
 * Component props
 */
interface Props {
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions?: Exhibition[];
  layouts?: PageLayout[];
  setExhibitions: typeof setExhibitions;
  setLayouts: typeof setLayouts;
  setDevices: typeof setDevices;
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

      const [ exhibitions, layouts ] = await Promise.all([
        exhibitionsApi.listExhibitions(),
        layoutsApi.listPageLayouts()
      ]);

      this.props.setExhibitions(exhibitions);
      this.props.setLayouts(layouts);
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

    return this.props.exhibitions && this.props.layouts ? this.props.children : null;
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
    layouts: state.layouts.layouts
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
    setDevices: (devices: ExhibitionDevice[]) => dispatch(setDevices(devices))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreInitializer);