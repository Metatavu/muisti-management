import { ActionCreator } from "redux";
import * as actionTypes from "../constants/actionTypes";
import { Exhibition, ExhibitionRoom } from "../generated/client";

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
 * Interface for set selected room action type
 */
export interface SetSelectedRoomAction {
  type: actionTypes.SET_SELECTED_ROOM;
  room: ExhibitionRoom;
}

/**
 * Function for dispatching selected exhibition
 *
 * @param exhibition exhibition being dispatched
 */
export const setSelectedExhibition: ActionCreator<SetSelectedExhibitionAction> = (exhibition: Exhibition) => {
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

/**
 * Function for dispatching selected room
 *
 * @param room room being dispatched
 */
export const setSelectedRoom: ActionCreator<SetSelectedRoomAction> = (room: ExhibitionRoom) => {
  return {
    type: actionTypes.SET_SELECTED_ROOM,
    room: room
  };
};

export type ExhibitionsAction = SetSelectedExhibitionAction | SetExhibitionsAction | SetSelectedRoomAction;