import * as actionTypes from "../constants/actionTypes";
import { Exhibition } from "../generated/client";
import { ActionCreator } from "redux";

/**
 * Interface for set selected exhibition action type
 */
export interface SetSelectedExhibitionAction {
  type: actionTypes.SET_SELECTED_EXHIBITION;
  exhibition: Exhibition;
}

/**
 * Interface for set exhibitions action type
 */
export interface SetExhibitionsAction {
  type: actionTypes.SET_EXHIBITIONS;
  exhibitions: Exhibition[];
}

/**
 * Function for dispatching selected exhibition
 *
 * @param exhibition exhibition being dispatched
 */
export const setSelectedExhibition: ActionCreator<SetSelectedExhibitionAction> = (
  exhibition: Exhibition
) => {
  return {
    type: actionTypes.SET_SELECTED_EXHIBITION,
    exhibition: exhibition
  };
};

/**
 * Function for dispatching exhibitions
 *
 * @param exhibitions exhibitions being dispatched
 */
export const setExhibitions: ActionCreator<SetExhibitionsAction> = (exhibitions: Exhibition[]) => {
  return {
    type: actionTypes.SET_EXHIBITIONS,
    exhibitions: exhibitions
  };
};

export type ExhibitionsAction = SetSelectedExhibitionAction | SetExhibitionsAction;
