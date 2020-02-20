import { ActionCreator } from "redux";
import * as actionTypes from "../constants/actionTypes";
import { Exhibition } from "../generated/client";

/**
 * Interface for device action type
 */
export interface SetExhibitionAction {
  type: actionTypes.SET_EXHIBITION,
  exhibition: Exhibition
}

/**
 * Function for dispatching customers
 *
 * @param device device being dispatched
 */
export const setExhibition: ActionCreator<SetExhibitionAction> = (exhibition: Exhibition) => {
  return {
    type: actionTypes.SET_EXHIBITION,
    exhibition: exhibition
  };
};

export type ExhibitionAction = SetExhibitionAction;