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
 * 
 * @export
 * @interface SystemMemory
 */
export interface SystemMemory {
    /**
     * 
     * @type {string}
     * @memberof SystemMemory
     */
    readonly freeMemory?: string;
    /**
     * 
     * @type {string}
     * @memberof SystemMemory
     */
    readonly availableProcessors?: string;
    /**
     * 
     * @type {string}
     * @memberof SystemMemory
     */
    readonly maxMemory?: string;
}

export function SystemMemoryFromJSON(json: any): SystemMemory {
    return SystemMemoryFromJSONTyped(json, false);
}

export function SystemMemoryFromJSONTyped(json: any, ignoreDiscriminator: boolean): SystemMemory {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'freeMemory': !exists(json, 'freeMemory') ? undefined : json['freeMemory'],
        'availableProcessors': !exists(json, 'availableProcessors') ? undefined : json['availableProcessors'],
        'maxMemory': !exists(json, 'maxMemory') ? undefined : json['maxMemory'],
    };
}

export function SystemMemoryToJSON(value?: SystemMemory | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
    };
}

