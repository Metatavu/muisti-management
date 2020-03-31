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
 * MQTT notification message about exhibition visitor session creation. This is actually not part of REST API spec but a realtime notification via MQTT channel
 * @export
 * @interface MqttExhibitionVisitorSessionCreate
 */
export interface MqttExhibitionVisitorSessionCreate {
    /**
     * 
     * @type {string}
     * @memberof MqttExhibitionVisitorSessionCreate
     */
    readonly id: string;
    /**
     * Id of exhibition this visitor session belongs to
     * @type {string}
     * @memberof MqttExhibitionVisitorSessionCreate
     */
    readonly exhibitionId: string;
}

export function MqttExhibitionVisitorSessionCreateFromJSON(json: any): MqttExhibitionVisitorSessionCreate {
    return MqttExhibitionVisitorSessionCreateFromJSONTyped(json, false);
}

export function MqttExhibitionVisitorSessionCreateFromJSONTyped(json: any, ignoreDiscriminator: boolean): MqttExhibitionVisitorSessionCreate {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'exhibitionId': json['exhibitionId'],
    };
}

export function MqttExhibitionVisitorSessionCreateToJSON(value?: MqttExhibitionVisitorSessionCreate | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
    };
}

