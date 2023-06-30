import * as actionTypes from "../constants/actionTypes";
import { SubLayout } from "../generated/client";
import { ActionCreator } from "redux";

/**
 * Interface for set sub layouts action type
 */
export interface SetSubLayoutsAction {
  type: actionTypes.SET_SUB_LAYOUTS;
  subLayouts: SubLayout[];
}

/**
 * Interface for set selected sub layout action type
 */
export interface SetSelectedSubLayoutAction {
  type: actionTypes.SET_SELECTED_SUB_LAYOUT;
  subLayout: SubLayout;
}

/**
 * Function for dispatching sub layouts
 *
 * @param subLayouts sub layouts being dispatched
 */
export const setSubLayouts: ActionCreator<SetSubLayoutsAction> = (subLayouts: SubLayout[]) => {
  return {
    type: actionTypes.SET_SUB_LAYOUTS,
    subLayouts: subLayouts
  };
};

/**
 * Function for dispatching selected sub layout
 *
 * @param selectedLayout Selected layout being dispatched
 */
export const setSelectedSubLayout: ActionCreator<SetSelectedSubLayoutAction> = (
  subLayout: SubLayout
) => {
  return {
    type: actionTypes.SET_SELECTED_SUB_LAYOUT,
    subLayout: subLayout
  };
};

export type SubLayoutsAction = SetSubLayoutsAction | SetSelectedSubLayoutAction;
