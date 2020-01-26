import { AppAction } from '../actions';
import { StoreState, AccessToken } from '../types';
import { LOGIN } from '../constants';

/**
 * Redux reducer
 * 
 * @param storeState store state 
 * @param action action
 * @returns changed store state
 */
export function reducer(storeState: StoreState, action: AppAction): StoreState {
  switch (action.type) {
    case LOGIN:
      const keycloak = action.keycloak;
      const { token, tokenParsed } = keycloak;
      const accessToken: AccessToken | undefined = tokenParsed && tokenParsed.sub && token ? {
        token: token,
        userId: tokenParsed.sub
      } : undefined;

      return { ...storeState, keycloak: keycloak, accessToken: accessToken };
    default:
      return storeState;
  }
}