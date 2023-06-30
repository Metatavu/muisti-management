import { AuthAction } from "../actions/auth";
import { LOGIN, LOGOUT } from "../constants/actionTypes";
import { AccessToken } from "../types";
import { KeycloakInstance } from "keycloak-js";

/**
 * Redux auth state
 */
export interface AuthState {
  accessToken?: AccessToken;
  keycloak?: KeycloakInstance;
}

/**
 * Initial exhibition state
 */
const initialState: AuthState = {
  accessToken: undefined,
  keycloak: undefined
};

/**
 * Redux reducer for authorization
 *
 * @param authState auth state
 * @param authAction auth action
 * @returns changed auth state
 */
export function authReducer(authState: AuthState = initialState, action: AuthAction): AuthState {
  switch (action.type) {
    case LOGIN:
      const keycloak = action.keycloak;
      const { token, tokenParsed } = keycloak;
      const accessToken: AccessToken | undefined =
        tokenParsed && tokenParsed.sub && token
          ? {
              token: token,
              userId: tokenParsed.sub
            }
          : undefined;

      return { ...authState, keycloak: keycloak, accessToken: accessToken };
    case LOGOUT:
      return { ...authState, keycloak: undefined, accessToken: undefined };
    default:
      return authState;
  }
}
