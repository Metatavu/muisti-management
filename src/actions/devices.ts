import { ActionCreator } from "redux";
import * as actionTypes from "../constants/actionTypes";
import { ExhibitionDevice, ExhibitionDeviceGroup } from "../generated/client";

/**
 * Interface for set devices action type
 */
export interface SetDevicesAction {
  type: actionTypes.SET_DEVICES;
  devices: ExhibitionDevice[];
}

/**
 * Interface for set devices action type
 */
export interface SetDeviceGroupsAction {
  type: actionTypes.SET_DEVICE_GROUPS;
  deviceGroups: ExhibitionDeviceGroup[];
}

/**
 * Function for dispatching devices
 *
 * @param devices devices being dispatched
 */
export const setDevices: ActionCreator<SetDevicesAction> = (devices: ExhibitionDevice[]) => {
  return {
    type: actionTypes.SET_DEVICES,
    devices: devices
  };
};

/**
 * Function for dispatching device groups
 *
 * @param devices device groups being dispatched
 */
export const setDeviceGroups: ActionCreator<SetDeviceGroupsAction> = (deviceGroups: ExhibitionDeviceGroup[]) => {
  return {
    type: actionTypes.SET_DEVICE_GROUPS,
    deviceGroups: deviceGroups
  };
};

export type DevicesAction =  SetDevicesAction | SetDeviceGroupsAction;