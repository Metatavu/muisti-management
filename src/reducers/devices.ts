import { DevicesAction } from "../actions/devices";
import { SET_DEVICES, SET_DEVICE_GROUPS, SET_DEVICE_MODELS } from "../constants/actionTypes";
import { DeviceModel, ExhibitionDevice, ExhibitionDeviceGroup } from "../generated/client";
import { Reducer } from "redux";

/**
 * Devices state
 */
interface DevicesState {
  devices: ExhibitionDevice[];
  deviceGroups: ExhibitionDeviceGroup[];
  deviceModels: DeviceModel[];
}

/**
 * Initial devices state
 */
const initialState: DevicesState = {
  devices: [],
  deviceGroups: [],
  deviceModels: []
};

/**
 * Redux reducer for devices
 *
 * @param storeState store state of devices
 * @param action action of devices
 */
// eslint-disable-next-line max-len
export const devicesReducer: Reducer<DevicesState, DevicesAction> = (
  state: DevicesState = initialState,
  action: DevicesAction
): DevicesState => {
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
      };
    case SET_DEVICE_MODELS:
      return {
        ...state,
        deviceModels: action.deviceModels
      };
    default:
      return state;
  }
};
