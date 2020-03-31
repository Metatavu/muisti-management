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
 * MQTT notification message about exhibition page update. This is actually not part of REST API spec but a realtime notification via MQTT channel
 * @export
 * @interface MqttExhibitionPageUpdate
 */
export interface MqttExhibitionPageUpdate {
    /**
     * 
     * @type {string}
     * @memberof MqttExhibitionPageUpdate
     */
    readonly id?: string;
    /**
     * Id of exhibition this page belongs to
     * @type {string}
     * @memberof MqttExhibitionPageUpdate
     */
    readonly exhibitionId?: string;
}

export function MqttExhibitionPageUpdateFromJSON(json: any): MqttExhibitionPageUpdate {
    return MqttExhibitionPageUpdateFromJSONTyped(json, false);
}

export function MqttExhibitionPageUpdateFromJSONTyped(json: any, ignoreDiscriminator: boolean): MqttExhibitionPageUpdate {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'exhibitionId': !exists(json, 'exhibitionId') ? undefined : json['exhibitionId'],
    };
}

export function MqttExhibitionPageUpdateToJSON(value?: MqttExhibitionPageUpdate | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
    };
}

