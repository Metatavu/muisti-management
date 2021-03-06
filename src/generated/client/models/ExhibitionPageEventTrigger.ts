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
    ExhibitionPageEvent,
    ExhibitionPageEventFromJSON,
    ExhibitionPageEventFromJSONTyped,
    ExhibitionPageEventToJSON,
} from './';

/**
 * 
 * @export
 * @interface ExhibitionPageEventTrigger
 */
export interface ExhibitionPageEventTrigger {
    /**
     * 
     * @type {string}
     * @memberof ExhibitionPageEventTrigger
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ExhibitionPageEventTrigger
     */
    name: string;
    /**
     * 
     * @type {Array<ExhibitionPageEvent>}
     * @memberof ExhibitionPageEventTrigger
     */
    events?: Array<ExhibitionPageEvent>;
    /**
     * 
     * @type {number}
     * @memberof ExhibitionPageEventTrigger
     */
    delay?: number;
    /**
     * 
     * @type {string}
     * @memberof ExhibitionPageEventTrigger
     */
    clickViewId?: string;
    /**
     * Name of triggering device group event
     * @type {string}
     * @memberof ExhibitionPageEventTrigger
     */
    deviceGroupEvent?: string;
    /**
     * 
     * @type {string}
     * @memberof ExhibitionPageEventTrigger
     */
    keyUp?: string;
    /**
     * 
     * @type {string}
     * @memberof ExhibitionPageEventTrigger
     */
    keyDown?: string;
    /**
     * 
     * @type {Array<ExhibitionPageEventTrigger>}
     * @memberof ExhibitionPageEventTrigger
     */
    next?: Array<ExhibitionPageEventTrigger>;
}

export function ExhibitionPageEventTriggerFromJSON(json: any): ExhibitionPageEventTrigger {
    return ExhibitionPageEventTriggerFromJSONTyped(json, false);
}

export function ExhibitionPageEventTriggerFromJSONTyped(json: any, ignoreDiscriminator: boolean): ExhibitionPageEventTrigger {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'events': !exists(json, 'events') ? undefined : ((json['events'] as Array<any>).map(ExhibitionPageEventFromJSON)),
        'delay': !exists(json, 'delay') ? undefined : json['delay'],
        'clickViewId': !exists(json, 'clickViewId') ? undefined : json['clickViewId'],
        'deviceGroupEvent': !exists(json, 'deviceGroupEvent') ? undefined : json['deviceGroupEvent'],
        'keyUp': !exists(json, 'keyUp') ? undefined : json['keyUp'],
        'keyDown': !exists(json, 'keyDown') ? undefined : json['keyDown'],
        'next': !exists(json, 'next') ? undefined : ((json['next'] as Array<any>).map(ExhibitionPageEventTriggerFromJSON)),
    };
}

export function ExhibitionPageEventTriggerToJSON(value?: ExhibitionPageEventTrigger | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'events': value.events === undefined ? undefined : ((value.events as Array<any>).map(ExhibitionPageEventToJSON)),
        'delay': value.delay,
        'clickViewId': value.clickViewId,
        'deviceGroupEvent': value.deviceGroupEvent,
        'keyUp': value.keyUp,
        'keyDown': value.keyDown,
        'next': value.next === undefined ? undefined : ((value.next as Array<any>).map(ExhibitionPageEventTriggerToJSON)),
    };
}


