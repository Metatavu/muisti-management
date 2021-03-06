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
import {
    ExhibitionPageResourceType,
    ExhibitionPageResourceTypeFromJSON,
    ExhibitionPageResourceTypeFromJSONTyped,
    ExhibitionPageResourceTypeToJSON,
    PageResourceMode,
    PageResourceModeFromJSON,
    PageResourceModeFromJSONTyped,
    PageResourceModeToJSON,
} from './';

/**
 * 
 * @export
 * @interface ExhibitionPageResource
 */
export interface ExhibitionPageResource {
    /**
     * 
     * @type {string}
     * @memberof ExhibitionPageResource
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ExhibitionPageResource
     */
    data: string;
    /**
     * 
     * @type {PageResourceMode}
     * @memberof ExhibitionPageResource
     */
    mode?: PageResourceMode;
    /**
     * 
     * @type {ExhibitionPageResourceType}
     * @memberof ExhibitionPageResource
     */
    type: ExhibitionPageResourceType;
}

export function ExhibitionPageResourceFromJSON(json: any): ExhibitionPageResource {
    return ExhibitionPageResourceFromJSONTyped(json, false);
}

export function ExhibitionPageResourceFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExhibitionPageResource {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'data': json['data'],
        'mode': !exists(json, 'mode') ? undefined : PageResourceModeFromJSON(json['mode']),
        'type': ExhibitionPageResourceTypeFromJSON(json['type']),
    };
}

export function ExhibitionPageResourceToJSON(value?: ExhibitionPageResource | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'data': value.data,
        'mode': PageResourceModeToJSON(value.mode),
        'type': ExhibitionPageResourceTypeToJSON(value.type),
    };
}


