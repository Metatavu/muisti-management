import { SubLayoutsAction } from "../actions/subLayouts";
import { SET_SUB_LAYOUTS, SET_SELECTED_SUB_LAYOUT } from "../constants/actionTypes";
import { Reducer } from "redux";
import { SubLayout } from "../generated/client";

/**
 * Sub layouts state
 */
interface SubLayoutsState {
  subLayouts: SubLayout[];
  selectedSubLayout?: SubLayout;
}

/**
 * Initial sub layouts state
 */
const initialState: SubLayoutsState = {
  subLayouts: [],
  selectedSubLayout: undefined
};

/**
 * Redux reducer for sub layouts
 *
 * @param storeState store state of layouts
 * @param action action of layouts
 */
// eslint-disable-next-line max-len
export const subLayoutsReducer: Reducer<SubLayoutsState, SubLayoutsAction> = (
  state: SubLayoutsState = initialState,
  action: SubLayoutsAction
): SubLayoutsState => {
  switch (action.type) {
    case SET_SUB_LAYOUTS:
      return {
        ...state,
        subLayouts: action.subLayouts
      };
    case SET_SELECTED_SUB_LAYOUT:
      return {
        ...state,
        selectedSubLayout: action.subLayout
      };
    default:
      return state;
  }
};
