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

import { exists, mapValues } from '../runtime';
/**
 * Describes device display information
 * @export
 * @interface DeviceModelDisplayMetrics
 */
export interface DeviceModelDisplayMetrics {
    /**
     * 
     * @type {number}
     * @memberof DeviceModelDisplayMetrics
     */
    heightPixels?: number;
    /**
     * 
     * @type {number}
     * @memberof DeviceModelDisplayMetrics
     */
    widthPixels?: number;
    /**
     * 
     * @type {number}
     * @memberof DeviceModelDisplayMetrics
     */
    density?: number;
    /**
     * 
     * @type {number}
     * @memberof DeviceModelDisplayMetrics
     */
    xdpi?: number;
    /**
     * 
     * @type {number}
     * @memberof DeviceModelDisplayMetrics
     */
    ydpi?: number;
}

export function DeviceModelDisplayMetricsFromJSON(json: any): DeviceModelDisplayMetrics {
    return DeviceModelDisplayMetricsFromJSONTyped(json, false);
}

export function DeviceModelDisplayMetricsFromJSONTyped(json: any, ignoreDiscriminator: boolean): DeviceModelDisplayMetrics {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'heightPixels': !exists(json, 'heightPixels') ? undefined : json['heightPixels'],
        'widthPixels': !exists(json, 'widthPixels') ? undefined : json['widthPixels'],
        'density': !exists(json, 'density') ? undefined : json['density'],
        'xdpi': !exists(json, 'xdpi') ? undefined : json['xdpi'],
        'ydpi': !exists(json, 'ydpi') ? undefined : json['ydpi'],
    };
}

export function DeviceModelDisplayMetricsToJSON(value?: DeviceModelDisplayMetrics | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'heightPixels': value.heightPixels,
        'widthPixels': value.widthPixels,
        'density': value.density,
        'xdpi': value.xdpi,
        'ydpi': value.ydpi,
    };
}

