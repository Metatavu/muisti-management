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
    ExhibitionPageEventActionType,
    ExhibitionPageEventActionTypeFromJSON,
    ExhibitionPageEventActionTypeFromJSONTyped,
    ExhibitionPageEventActionTypeToJSON,
    ExhibitionPageEventProperty,
    ExhibitionPageEventPropertyFromJSON,
    ExhibitionPageEventPropertyFromJSONTyped,
    ExhibitionPageEventPropertyToJSON,
} from './';

/**
 * 
 * @export
 * @interface ExhibitionPageEvent
 */
export interface ExhibitionPageEvent {
    /**
     * 
     * @type {ExhibitionPageEventActionType}
     * @memberof ExhibitionPageEvent
     */
    action: ExhibitionPageEventActionType;
    /**
     * 
     * @type {Array<ExhibitionPageEventProperty>}
     * @memberof ExhibitionPageEvent
     */
    properties: Array<ExhibitionPageEventProperty>;
}

export function ExhibitionPageEventFromJSON(json: any): ExhibitionPageEvent {
    return ExhibitionPageEventFromJSONTyped(json, false);
}

export function ExhibitionPageEventFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExhibitionPageEvent {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'action': ExhibitionPageEventActionTypeFromJSON(json['action']),
        'properties': ((json['properties'] as Array<any>).map(ExhibitionPageEventPropertyFromJSON)),
    };
}

export function ExhibitionPageEventToJSON(value?: ExhibitionPageEvent | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'action': ExhibitionPageEventActionTypeToJSON(value.action),
        'properties': ((value.properties as Array<any>).map(ExhibitionPageEventPropertyToJSON)),
    };
}


