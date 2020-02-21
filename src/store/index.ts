import { combineReducers } from "redux";
import { exhibitionReducer } from "../reducers/exhibition";
import { ExhibitionAction } from "../actions/exhibition";
import { authReducer } from "../reducers/auth";
import { AuthAction } from "../actions/auth";

/**
 * Root reducer that wraps all Redux reducers
 */
export const rootReducer = combineReducers({
    auth: authReducer,
    exhibition: exhibitionReducer
});

export type ReduxState = ReturnType<typeof rootReducer>;

export type ReduxActions = ExhibitionAction | AuthAction;