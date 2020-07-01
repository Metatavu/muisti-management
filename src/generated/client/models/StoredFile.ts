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
 * 
 * @export
 * @interface StoredFile
 */
export interface StoredFile {
    /**
     * 
     * @type {string}
     * @memberof StoredFile
     */
    readonly id?: string;
    /**
     * 
     * @type {string}
     * @memberof StoredFile
     */
    readonly uri: string;
    /**
     * 
     * @type {string}
     * @memberof StoredFile
     */
    readonly contentType: string;
    /**
     * 
     * @type {string}
     * @memberof StoredFile
     */
    fileName: string;
}

export function StoredFileFromJSON(json: any): StoredFile {
    return StoredFileFromJSONTyped(json, false);
}

export function StoredFileFromJSONTyped(json: any, ignoreDiscriminator: boolean): StoredFile {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'uri': json['uri'],
        'contentType': json['contentType'],
        'fileName': json['fileName'],
    };
}

export function StoredFileToJSON(value?: StoredFile | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'fileName': value.fileName,
    };
}

