import { AuthAction } from "../actions/auth";
import { DevicesAction } from "../actions/devices";
import { ExhibitionsAction } from "../actions/exhibitions";
import { LayoutsAction } from "../actions/layouts";
import { SubLayoutsAction } from "../actions/subLayouts";
import { authReducer } from "../reducers/auth";
import { devicesReducer } from "../reducers/devices";
import { exhibitionsReducer } from "../reducers/exhibitions";
import { layoutsReducer } from "../reducers/layouts";
import { subLayoutsReducer } from "../reducers/subLayouts";
import { combineReducers } from "redux";

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
