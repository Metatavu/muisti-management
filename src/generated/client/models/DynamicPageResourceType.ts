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
export enum DynamicPageResourceType {
    Switch = 'switch',
    Substitute = 'substitute'
}

export function DynamicPageResourceTypeFromJSON(json: any): DynamicPageResourceType {
    return DynamicPageResourceTypeFromJSONTyped(json, false);
}

export function DynamicPageResourceTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): DynamicPageResourceType {
    return json as DynamicPageResourceType;
}

export function DynamicPageResourceTypeToJSON(value?: DynamicPageResourceType | null): any {
    return value as any;
}

