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
export enum PageLayoutWidgetType {
    TextView = 'TextView',
    FlowTextView = 'FlowTextView',
    Button = 'Button',
    ImageView = 'ImageView',
    PlayerView = 'PlayerView',
    MediaView = 'MediaView',
    LinearLayout = 'LinearLayout',
    FrameLayout = 'FrameLayout',
    RelativeLayout = 'RelativeLayout'
}

export function PageLayoutWidgetTypeFromJSON(json: any): PageLayoutWidgetType {
    return PageLayoutWidgetTypeFromJSONTyped(json, false);
}

export function PageLayoutWidgetTypeFromJSONTyped(json: any, ignoreDiscriminator: boolean): PageLayoutWidgetType {
    return json as PageLayoutWidgetType;
}

export function PageLayoutWidgetTypeToJSON(value?: PageLayoutWidgetType | null): any {
    return value as any;
}

