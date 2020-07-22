import { GroupContentVersionsAction } from '../actions/groupContentVersions';
import { SET_SELECTED_GROUP_CONTENT_VERSIONS } from '../constants/actionTypes';
import { Reducer } from "redux";
import { GroupContentVersion } from '../generated/client';

/**
 * GroupContentVersions state
 */
interface GroupContentVersionsState {
  selectedGroupContentVersion?: GroupContentVersion;
}

/**
 * Initial group content versions state
 */
const initialState: GroupContentVersionsState = {
  selectedGroupContentVersion: undefined
};

/**
 * Redux reducer for group content versions
 *
 * @param storeState store state of group content versions
 * @param action action of group content versions
 */
// eslint-disable-next-line max-len
export const groupContentVersionsReducer: Reducer<GroupContentVersionsState, GroupContentVersionsAction> = (state: GroupContentVersionsState = initialState, action: GroupContentVersionsAction): GroupContentVersionsState => {
  switch (action.type) {
    case SET_SELECTED_GROUP_CONTENT_VERSIONS:
      return {
        ...state,
        selectedGroupContentVersion: action.groupContentVersion
      };
    default:
      return state;
  }
}