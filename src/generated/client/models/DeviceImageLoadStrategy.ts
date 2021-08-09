/* tslint:disable */
/* eslint-disable */
/**
 * Muisti API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * Defines how device handles image loading.  * MEMORY - Devices loads all images to memory. This is faster but requires more memory * DISK - Device prescales images and serves then from disk. This is not as fast as serving images from memory but it does not require that much memory. 
 * @export
 * @enum {string}
 */
export enum DeviceImageLoadStrategy {
    MEMORY = 'MEMORY',
    DISK = 'DISK'
}

export function DeviceImageLoadStrategyFromJSON(json: any): DeviceImageLoadStrategy {
    return DeviceImageLoadStrategyFromJSONTyped(json, false);
}

export function DeviceImageLoadStrategyFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeviceImageLoadStrategy {
    return json as DeviceImageLoadStrategy;
}

export function DeviceImageLoadStrategyToJSON(value?: DeviceImageLoadStrategy | null): any {
    return value as any;
}
