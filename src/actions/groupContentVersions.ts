import { ActionCreator } from "redux";
import * as actionTypes from "../constants/actionTypes";
import { GroupContentVersion } from "../generated/client";

/**
 * Interface for set selected group content version action type
 */
export interface SetSelectedGroupContentVersionAction {
  type: actionTypes.SET_SELECTED_GROUP_CONTENT_VERSIONS;
  groupContentVersion?: GroupContentVersion;
}

/**
 * Function for dispatching selected group content version
 *
 * @param groupContentVersion group content version being dispatched
 */
export const setSelectedGroupContentVersion: ActionCreator<SetSelectedGroupContentVersionAction> = (groupContentVersion?: GroupContentVersion) => {
  return {
    type: actionTypes.SET_SELECTED_GROUP_CONTENT_VERSIONS,
    groupContentVersion: groupContentVersion
  };
};

export type GroupContentVersionsAction = SetSelectedGroupContentVersionAction;