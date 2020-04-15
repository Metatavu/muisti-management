// eslint-disable-next-line max-len
import { ExhibitionPageResource, DeviceModelCapabilities, ExhibitionPage, Exhibition, ExhibitionContentVersion, ExhibitionFloor, ExhibitionRoom, ExhibitionDevice } from "../generated/client";
import { DeviceModelDimensionsData, DeviceModelDisplayMetricsData } from "./device-model-string-data";

/**
 * Interface describing an access token
 */
export interface AccessToken {
  token: string;
  userId: string;
};

/**
 * Map of resources with id as a key
 */
export type ResourceMap = { [key: string]: ExhibitionPageResource };

/**
 * JSON Lint parse error hash object
 */
export interface JsonLintParseErrorHash {
  loc: {
    "first_line": number;
    "first_column": number;
    "last_line": number;
    "last_column": number;
  };
};

/**
 * Union type for device model data sub properties
 */
export type DeviceModelDataProperty = DeviceModelDimensionsData | DeviceModelDisplayMetricsData | DeviceModelCapabilities;

/**
 * Union type for keys of device model data sub properties
 */
export type DeviceModelDataSubPropertyKey = keyof DeviceModelDimensionsData | keyof DeviceModelDisplayMetricsData | keyof DeviceModelCapabilities;

/**
 * Enum for physical event trigger button values
 */
export enum PhysicalButton {
  BUTTON_1 = "1",
  BUTTON_2 = "2",
  BUTTON_3 = "3",
  BUTTON_4 = "4",
  BUTTON_5 = "5",
  BUTTON_6 = "6",
  BUTTON_7 = "7",
  BUTTON_8 = "8",
  BUTTON_9 = "9"
};

/**
 * Interface for a single physical event trigger button
 */
export interface PhysicalButtonData {
  name: string;
  value: PhysicalButton;
};

/**
 * Interface describing exhibition element in exhibition editor
 */
export interface ExhibitionElement {
  data: Exhibition | ExhibitionContentVersion | ExhibitionFloor | ExhibitionRoom | ExhibitionDevice | ExhibitionPage;
  type: ExhibitionElementType;
}

/**
 * Enum for different exhibition element types
 */
export enum ExhibitionElementType {
  EXHIBITION = "EXHIBITION",
  CONTENT_VERSION = "CONTENT_VERSION",
  FLOOR = "FLOOR",
  ROOM = "ROOM",
  DEVICE = "DEVICE",
  PAGE = "PAGE"
}