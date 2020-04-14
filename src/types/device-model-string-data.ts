import { DeviceModelCapabilities } from "../generated/client";

export interface DeviceModelDisplayMetricsData {
  heightPixels: string;
  widthPixels: string;
  density: string;
  xdpi: string;
  ydpi: string;
}

export interface DeviceModelDimensionsData {
  deviceWidth: string;
  deviceHeight: string;
  deviceDepth: string;
  screenWidth: string;
  screenHeight: string;
}

export interface DeviceModelData {
  manufacturer: string;
  model: string;
  dimensions: DeviceModelDimensionsData;
  displayMetrics: DeviceModelDisplayMetricsData;
  capabilities: DeviceModelCapabilities;
}