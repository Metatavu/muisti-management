import * as actionTypes from "../constants/actionTypes";
import { DeviceModel, ExhibitionDevice, ExhibitionDeviceGroup } from "../generated/client";
import { ActionCreator } from "redux";

/**
 * Interface for set devices action type
 */
export interface SetDevicesAction {
  type: actionTypes.SET_DEVICES;
  devices: ExhibitionDevice[];
}

/**
 * Interface for set device groups action type
 */
export interface SetDeviceGroupsAction {
  type: actionTypes.SET_DEVICE_GROUPS;
  deviceGroups: ExhibitionDeviceGroup[];
}

/**
 * Interface for set device models action type
 */
export interface SetDeviceModelsAction {
  type: actionTypes.SET_DEVICE_MODELS;
  deviceModels: DeviceModel[];
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
export const setDeviceGroups: ActionCreator<SetDeviceGroupsAction> = (
  deviceGroups: ExhibitionDeviceGroup[]
) => {
  return {
    type: actionTypes.SET_DEVICE_GROUPS,
    deviceGroups: deviceGroups
  };
};

/**
 * Function for dispatching device models
 *
 * @param deviceModels device models being dispatched
 */
export const setDeviceModels: ActionCreator<SetDeviceModelsAction> = (
  deviceModels: DeviceModel[]
) => {
  return {
    type: actionTypes.SET_DEVICE_MODELS,
    deviceModels: deviceModels
  };
};

export type DevicesAction = SetDevicesAction | SetDeviceGroupsAction | SetDeviceModelsAction;
