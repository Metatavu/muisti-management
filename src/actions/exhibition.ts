import { ActionCreator } from "redux";
import * as actionTypes from "../constants/actionTypes";
import { Exhibition } from "../generated/client";

/**
 * Interface for exhibition action type
 */
export interface SetExhibitionAction {
  type: actionTypes.SET_EXHIBITION,
  exhibition: Exhibition
}

/**
 * Function for dispatching exhibitions
 *
 * @param exhibition exhibition being dispatched
 */
export const setExhibition: ActionCreator<SetExhibitionAction> = (exhibition: Exhibition) => {
  return {
    type: actionTypes.SET_EXHIBITION,
    exhibition: exhibition
  };
};

export type ExhibitionAction = SetExhibitionAction;