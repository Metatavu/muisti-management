import { ExhibitionAction } from '../actions/exhibition';
import { SET_EXHIBITION } from '../constants/actionTypes';
import { Reducer } from "redux";
import { Exhibition } from '../generated/client';

/**
 * Exhibition state
 */
interface ExhibitionState {
  exhibition?: Exhibition
}

/**
 * Initial exhibition state
 */
const initialState: ExhibitionState = {
  exhibition: undefined
}

/**
 * Redux reducer for exhibition
 * 
 * @param storeState store state of exhibition
 * @param action action of exhibition
 */
export const exhibitionReducer: Reducer<ExhibitionState, ExhibitionAction> = (state: ExhibitionState = initialState, action: ExhibitionAction): ExhibitionState => {
  switch (action.type) {
    case SET_EXHIBITION:
      return {
        ...state,
        exhibition: action.exhibition
      };
    default:
      return state;
  }
}