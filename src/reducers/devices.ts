import { DevicesAction } from '../actions/devices';
import { SET_DEVICES, SET_DEVICE_GROUPS } from '../constants/actionTypes';
import { Reducer } from "redux";
import { ExhibitionDevice, ExhibitionDeviceGroup } from '../generated/client';

/**
 * Devices state
 */
interface DevicesState {
  devices: ExhibitionDevice[];
  deviceGroups: ExhibitionDeviceGroup[];
}

/**
 * Initial devices state
 */
const initialState: DevicesState = {
  devices: [],
  deviceGroups: []
}

/**
 * Redux reducer for devices
 *
 * @param storeState store state of devices
 * @param action action of devices
 */
// eslint-disable-next-line max-len
export const devicesReducer: Reducer<DevicesState, DevicesAction> = (state: DevicesState = initialState, action: DevicesAction): DevicesState => {
  switch (action.type) {
    case SET_DEVICES:
      return {
        ...state,
        devices: action.devices
      };
    case SET_DEVICE_GROUPS:
      return {
        ...state,
        deviceGroups: action.deviceGroups
      }
    default:
      return state;
  }
}