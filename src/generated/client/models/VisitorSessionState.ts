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
 * 
 * @export
 * @enum {string}
 */
export enum VisitorSessionState {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETE = 'COMPLETE'
}

export function VisitorSessionStateFromJSON(json: any): VisitorSessionState {
    return VisitorSessionStateFromJSONTyped(json, false);
}

export function VisitorSessionStateFromJSONTyped(json: any, ignoreDiscriminator: boolean): VisitorSessionState {
    return json as VisitorSessionState;
}

export function VisitorSessionStateToJSON(value?: VisitorSessionState | null): any {
    return value as any;
}
