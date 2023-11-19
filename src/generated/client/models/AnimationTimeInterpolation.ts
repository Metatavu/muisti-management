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
export enum AnimationTimeInterpolation {
    Acceleratedecelerate = 'acceleratedecelerate',
    Accelerate = 'accelerate',
    Anticipate = 'anticipate',
    Anticipateovershoot = 'anticipateovershoot',
    Bounce = 'bounce',
    Decelerate = 'decelerate',
    Linear = 'linear',
    Overshoot = 'overshoot'
}

export function AnimationTimeInterpolationFromJSON(json: any): AnimationTimeInterpolation {
    return AnimationTimeInterpolationFromJSONTyped(json, false);
}

export function AnimationTimeInterpolationFromJSONTyped(json: any, ignoreDiscriminator: boolean): AnimationTimeInterpolation {
    return json as AnimationTimeInterpolation;
}

export function AnimationTimeInterpolationToJSON(value?: AnimationTimeInterpolation | null): any {
    return value as any;
}
