import { ExhibitionsAction } from "../actions/exhibitions";
import { SET_EXHIBITIONS, SET_SELECTED_EXHIBITION } from "../constants/actionTypes";
import { Exhibition } from "../generated/client";
import { Reducer } from "redux";

/**
 * Exhibitions state
 */
interface ExhibitionsState {
  selectedExhibition?: Exhibition;
  exhibitions: Exhibition[];
}

/**
 * Initial exhibitions state
 */
const initialState: ExhibitionsState = {
  selectedExhibition: undefined,
  exhibitions: []
};

/**
 * Redux reducer for exhibitions
 *
 * @param storeState store state of exhibitions
 * @param action action of exhibitions
 */
export const exhibitionsReducer: Reducer<ExhibitionsState, ExhibitionsAction> = (
  state: ExhibitionsState = initialState,
  action: ExhibitionsAction
): ExhibitionsState => {
  switch (action.type) {
    case SET_SELECTED_EXHIBITION:
      return {
        ...state,
        selectedExhibition: action.exhibition
      };
    case SET_EXHIBITIONS:
      return {
        ...state,
        exhibitions: action.exhibitions
      };
    default:
      return state;
  }
};
