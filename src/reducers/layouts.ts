import { LayoutsAction } from "../actions/layouts";
import { SET_LAYOUTS, SET_SELECTED_LAYOUT } from "../constants/actionTypes";
import { PageLayout } from "../generated/client";
import { Reducer } from "redux";

/**
 * Layouts state
 */
interface LayoutsState {
  layouts: PageLayout[];
  selectedLayout?: PageLayout;
}

/**
 * Initial layouts state
 */
const initialState: LayoutsState = {
  layouts: [],
  selectedLayout: undefined
};

/**
 * Redux reducer for layouts
 *
 * @param storeState store state of layouts
 * @param action action of layouts
 */
export const layoutsReducer: Reducer<LayoutsState, LayoutsAction> = (
  state: LayoutsState = initialState,
  action: LayoutsAction
): LayoutsState => {
  switch (action.type) {
    case SET_LAYOUTS:
      return {
        ...state,
        layouts: action.layouts
      };
    case SET_SELECTED_LAYOUT:
      return {
        ...state,
        selectedLayout: action.layout
      };
    default:
      return state;
  }
};
