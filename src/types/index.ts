import { KeycloakInstance } from "keycloak-js";

/**
 * Redux store state
 */
export interface StoreState {
  accessToken?: AccessToken,
  keycloak?: KeycloakInstance
}

/**
 * Interface describing an access token
 */
export interface AccessToken {
  token: string,
  userId: string
}