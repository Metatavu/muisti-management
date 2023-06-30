import * as actionTypes from "../constants/actionTypes";
import { PageLayout } from "../generated/client";
import { ActionCreator } from "redux";

/**
 * Interface for set layouts action type
 */
export interface SetLayoutsAction {
  type: actionTypes.SET_LAYOUTS;
  layouts: PageLayout[];
}

/**
 * Interface for set selected layout action type
 */
export interface SetSelectedLayoutAction {
  type: actionTypes.SET_SELECTED_LAYOUT;
  layout: PageLayout;
}

/**
 * Function for dispatching layouts
 *
 * @param layouts layouts being dispatched
 */
export const setLayouts: ActionCreator<SetLayoutsAction> = (layouts: PageLayout[]) => {
  return {
    type: actionTypes.SET_LAYOUTS,
    layouts: layouts
  };
};

/**
 * Function for dispatching selected layout
 *
 * @param selectedLayout Selected layout being dispatched
 */
export const setSelectedLayout: ActionCreator<SetSelectedLayoutAction> = (layout: PageLayout) => {
  return {
    type: actionTypes.SET_SELECTED_LAYOUT,
    layout: layout
  };
};

export type LayoutsAction = SetLayoutsAction | SetSelectedLayoutAction;
