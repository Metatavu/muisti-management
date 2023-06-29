import { DeviceModelCapabilities } from "../generated/client";

/**
 * Interface describing device model display metrics data as string values
 */
export interface DeviceModelDisplayMetricsData {
  heightPixels: string;
  widthPixels: string;
  density: string;
  xdpi: string;
  ydpi: string;
}

/**
 * Interface describing device model dimensions data as string values
 */
export interface DeviceModelDimensionsData {
  deviceWidth: string;
  deviceHeight: string;
  deviceDepth: string;
  screenWidth: string;
  screenHeight: string;
}

/**
 * Interface describing device model data as string values
 */
export interface DeviceModelData {
  manufacturer: string;
  model: string;
  dimensions: DeviceModelDimensionsData;
  displayMetrics: DeviceModelDisplayMetricsData;
  capabilities: DeviceModelCapabilities;
}
