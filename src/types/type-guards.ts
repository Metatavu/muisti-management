import { DeviceModelDataProperty } from ".";
import { DeviceModelCapabilities } from "../generated/client";
import {
  DeviceModelDimensionsData,
  DeviceModelDisplayMetricsData
} from "./device-model-string-data";

/**
 * Checks if DeviceModelData property is type of DeviceModelDimensionsData
 * @param property property
 */
export const isTypeOfDeviceModelDimensionsData = (
  property: DeviceModelDataProperty
): property is DeviceModelDimensionsData => {
  return (property as DeviceModelDimensionsData).deviceDepth !== undefined;
};

/**
 * Checks if DeviceModelData property is type of DeviceModelDisplayMetricsData
 * @param property property
 */
export const isTypeOfDeviceModelDisplayMetricsData = (
  property: DeviceModelDataProperty
): property is DeviceModelDisplayMetricsData => {
  return (property as DeviceModelDisplayMetricsData).density !== undefined;
};

/**
 * Checks if DeviceModelData property is type of DeviceModelCapabilities
 * @param property property
 */
export const isTypeOfDeviceModelCapabilitiesData = (
  property: DeviceModelDataProperty
): property is DeviceModelCapabilities => {
  return (property as DeviceModelCapabilities).touch !== undefined;
};
