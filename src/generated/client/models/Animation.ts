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
export enum Animation {
    Fade = 'fade',
    Morph = 'morph'
}

export function AnimationFromJSON(json: any): Animation {
    return AnimationFromJSONTyped(json, false);
}

export function AnimationFromJSONTyped(json: any, ignoreDiscriminator: boolean): Animation {
    return json as Animation;
}

export function AnimationToJSON(value?: Animation | null): any {
    return value as any;
}

