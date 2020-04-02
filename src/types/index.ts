import { ExhibitionPageResource, DeviceModelCapabilities, DeviceModelDimensions, DeviceModelDisplayMetrics } from "../generated/client";

/**
 * Interface describing an access token
 */
export interface AccessToken {
  token: string;
  userId: string;
}

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
}

/**
 * Union type for device model sub properties
 */
export type DeviceSubProperty = DeviceModelDimensions | DeviceModelDisplayMetrics | DeviceModelCapabilities;

/**
 * Union type for keys of device model sub properties
 */
export type DeviceSubPropertyKey = keyof DeviceModelDimensions | keyof DeviceModelDisplayMetrics | keyof DeviceModelCapabilities;