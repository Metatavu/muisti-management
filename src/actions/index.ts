import * as constants from '../constants';
import { KeycloakInstance } from 'keycloak-js';

/**
 * Access token update data
 */
export interface Login {
  type: constants.LOGIN,
  keycloak: KeycloakInstance
}

/**
 * Actions
 */
export type AppAction =  Login;

/**
 * Store update method for access token
 * 
 * @param accessToken access token
 */
export function login(keycloak: KeycloakInstance): Login {
  return {
    type: constants.LOGIN,
    keycloak: keycloak
  }
}