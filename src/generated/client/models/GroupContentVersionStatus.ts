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
 * Content version status
 * @export
 * @enum {string}
 */
export enum GroupContentVersionStatus {
    Notstarted = 'notstarted',
    Inprogress = 'inprogress',
    Ready = 'ready'
}

export function GroupContentVersionStatusFromJSON(json: any): GroupContentVersionStatus {
    return GroupContentVersionStatusFromJSONTyped(json, false);
}

export function GroupContentVersionStatusFromJSONTyped(json: any, ignoreDiscriminator: boolean): GroupContentVersionStatus {
    return json as GroupContentVersionStatus;
}

export function GroupContentVersionStatusToJSON(value?: GroupContentVersionStatus | null): any {
    return value as any;
}
