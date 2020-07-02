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
    PageLayoutViewProperty,
    PageLayoutViewPropertyFromJSON,
    PageLayoutViewPropertyFromJSONTyped,
    PageLayoutViewPropertyToJSON,
    PageLayoutWidgetType,
    PageLayoutWidgetTypeFromJSON,
    PageLayoutWidgetTypeFromJSONTyped,
    PageLayoutWidgetTypeToJSON,
} from './';

/**
 * 
 * @export
 * @interface PageLayoutView
 */
export interface PageLayoutView {
    /**
     * 
     * @type {string}
     * @memberof PageLayoutView
     */
    id: string;
    /**
     * 
     * @type {PageLayoutWidgetType}
     * @memberof PageLayoutView
     */
    widget: PageLayoutWidgetType;
    /**
     * 
     * @type {Array<PageLayoutViewProperty>}
     * @memberof PageLayoutView
     */
    properties: Array<PageLayoutViewProperty>;
    /**
     * 
     * @type {Array<PageLayoutView>}
     * @memberof PageLayoutView
     */
    children: Array<PageLayoutView>;
}

export function PageLayoutViewFromJSON(json: any): PageLayoutView {
    return PageLayoutViewFromJSONTyped(json, false);
}

export function PageLayoutViewFromJSONTyped(json: any, ignoreDiscriminator: boolean): PageLayoutView {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'widget': PageLayoutWidgetTypeFromJSON(json['widget']),
        'properties': ((json['properties'] as Array<any>).map(PageLayoutViewPropertyFromJSON)),
        'children': ((json['children'] as Array<any>).map(PageLayoutViewFromJSON)),
    };
}

export function PageLayoutViewToJSON(value?: PageLayoutView | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'widget': PageLayoutWidgetTypeToJSON(value.widget),
        'properties': ((value.properties as Array<any>).map(PageLayoutViewPropertyToJSON)),
        'children': ((value.children as Array<any>).map(PageLayoutViewToJSON)),
    };
}


