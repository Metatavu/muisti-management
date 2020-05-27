import { ExhibitionsAction } from '../actions/exhibitions';
import { SET_SELECTED_EXHIBITION, SET_EXHIBITIONS, SET_SELECTED_ROOM } from '../constants/actionTypes';
import { Reducer } from "redux";
import { Exhibition, ExhibitionRoom } from '../generated/client';

/**
 * Exhibitions state
 */
interface ExhibitionsState {
  selectedExhibition?: Exhibition;
  exhibitions: Exhibition[];
  selectedRoom?: ExhibitionRoom;
}

/**
 * Initial exhibitions state
 */
const initialState: ExhibitionsState = {
  selectedExhibition: undefined,
  exhibitions: [],
  selectedRoom: undefined
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
    case SET_SELECTED_ROOM:
      return {
        ...state,
        selectedRoom: action.room
      }
    default:
      return state;
  }
}