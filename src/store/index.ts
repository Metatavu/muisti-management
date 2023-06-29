import { combineReducers } from "redux";
import { exhibitionsReducer } from "../reducers/exhibitions";
import { ExhibitionsAction } from "../actions/exhibitions";
import { authReducer } from "../reducers/auth";
import { AuthAction } from "../actions/auth";
import { devicesReducer } from "../reducers/devices";
import { DevicesAction } from "../actions/devices";
import { layoutsReducer } from "../reducers/layouts";
import { LayoutsAction } from "../actions/layouts";
import { subLayoutsReducer } from "../reducers/subLayouts";
import { SubLayoutsAction } from "../actions/subLayouts";

/**
 * Root reducer that wraps all Redux reducers
 */
export const rootReducer = combineReducers({
  auth: authReducer,
  exhibitions: exhibitionsReducer,
  devices: devicesReducer,
  layouts: layoutsReducer,
  subLayouts: subLayoutsReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions =
  | ExhibitionsAction
  | AuthAction
  | DevicesAction
  | LayoutsAction
  | SubLayoutsAction;
