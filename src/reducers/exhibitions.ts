import { ExhibitionsAction } from '../actions/exhibitions';
import { SET_SELECTED_EXHIBITION, SET_EXHIBITIONS } from '../constants/actionTypes';
import { Reducer } from "redux";
import { Exhibition } from '../generated/client';

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
}

/**
 * Redux reducer for exhibitions
 *
 * @param storeState store state of exhibitions
 * @param action action of exhibitions
 */
// eslint-disable-next-line max-len
export const exhibitionsReducer: Reducer<ExhibitionsState, ExhibitionsAction> = (state: ExhibitionsState = initialState, action: ExhibitionsAction): ExhibitionsState => {
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
      }
    default:
      return state;
  }
}