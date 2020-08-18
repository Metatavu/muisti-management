import * as React from "react";

import { connect } from "react-redux";
import { ReduxState, ReduxActions } from "../../store";
import { login } from "../../actions/auth";

import { AccessToken } from "../../types";
import ErrorDialog from "../generic/error-dialog";
import { KeycloakInstance } from "keycloak-js";
import Keycloak from "keycloak-js";

/**
 * Component props
 */
interface Props {
  accessToken?: AccessToken;
  onLogin: (keycloak: KeycloakInstance) => void;
}

/**
 * Component state
 */
interface State {
  error?: Error;
}

/**
 * Component for keeping authentication token fresh
 */
class AccessTokenRefresh extends React.Component<Props, State> {

  private keycloak: KeycloakInstance;
  private timer?: any;

  /**
   * Constructor
   *
   * @param props props
   */
  constructor(props: Props) {
    super(props);

    this.keycloak = Keycloak({
      url: process.env.REACT_APP_KEYCLOAK_URL,
      realm: process.env.REACT_APP_KEYCLOAK_REALM || "",
      clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || ""
    });

    this.state = {

    };
  }

  /**
   * Component did mount life cycle event
   */
  public componentDidMount = async () => {
    const auth = await this.keycloakInit();

    if (!auth) {
      window.location.reload();
    } else {
      const { token, tokenParsed } = this.keycloak;

      if (this.keycloak && tokenParsed && tokenParsed.sub && token) {
        this.keycloak.loadUserProfile();
        this.props.onLogin(this.keycloak);
      }

      this.refreshAccessToken();

      this.timer = setInterval(() => {
        this.refreshAccessToken();
      }, 1000 * 60);
    }
  }

  /**
   * Component will unmount life cycle event
   */
  public componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  /**
   * Component render method
   */
  public render() {
    if (this.state.error) {
      return <ErrorDialog error={ this.state.error } onClose={ () => this.setState({ error: undefined }) } />;
    }

    return this.props.accessToken ? this.props.children : null;
  }

  /**
   * Refreshes access token
   */
  private refreshAccessToken() {
    try {
      const refreshed = this.keycloak.updateToken(70);
      if (refreshed) {
        const { token, tokenParsed } = this.keycloak;

        if (tokenParsed && tokenParsed.sub && token) {
          this.props.onLogin(this.keycloak);
        }
      }
    } catch (e) {
      this.setState({
        error: e
      });
    }
  }

  /**
   * Initializes Keycloak client
   */
  private keycloakInit = () => {
    return new Promise(resolve => {
      this.keycloak.init({ onLoad: "login-required", checkLoginIframe: false }).success(resolve);
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
    accessToken: state.auth.accessToken
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: React.Dispatch<ReduxActions>) {
  return {
    onLogin: (keycloak: KeycloakInstance) => dispatch(login(keycloak))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccessTokenRefresh);