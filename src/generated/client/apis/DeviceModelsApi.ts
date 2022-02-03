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


import * as runtime from '../runtime';
import {
    DeviceModel,
    DeviceModelFromJSON,
    DeviceModelToJSON,
} from '../models';

export interface CreateDeviceModelRequest {
    deviceModel: DeviceModel;
}

export interface DeleteDeviceModelRequest {
    deviceModelId: string;
}

export interface FindDeviceModelRequest {
    deviceModelId: string;
}

export interface UpdateDeviceModelRequest {
    deviceModel: DeviceModel;
    deviceModelId: string;
}

/**
 * no description
 */
export class DeviceModelsApi extends runtime.BaseAPI {

    /**
     * Creates new exhibition device model
     * Create a device model
     */
    async createDeviceModelRaw(requestParameters: CreateDeviceModelRequest): Promise<runtime.ApiResponse<DeviceModel>> {
        if (requestParameters.deviceModel === null || requestParameters.deviceModel === undefined) {
            throw new runtime.RequiredError('deviceModel','Required parameter requestParameters.deviceModel was null or undefined when calling createDeviceModel.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("bearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/deviceModels`,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: DeviceModelToJSON(requestParameters.deviceModel),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => DeviceModelFromJSON(jsonValue));
    }

    /**
     * Creates new exhibition device model
     * Create a device model
     */
    async createDeviceModel(requestParameters: CreateDeviceModelRequest): Promise<DeviceModel> {
        const response = await this.createDeviceModelRaw(requestParameters);
        return await response.value();
    }

    /**
     * Delets exhibition device model.
     * Deletes device model.
     */
    async deleteDeviceModelRaw(requestParameters: DeleteDeviceModelRequest): Promise<runtime.ApiResponse<void>> {
        if (requestParameters.deviceModelId === null || requestParameters.deviceModelId === undefined) {
            throw new runtime.RequiredError('deviceModelId','Required parameter requestParameters.deviceModelId was null or undefined when calling deleteDeviceModel.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("bearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/deviceModels/{deviceModelId}`.replace(`{${"deviceModelId"}}`, encodeURIComponent(String(requestParameters.deviceModelId))),
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delets exhibition device model.
     * Deletes device model.
     */
    async deleteDeviceModel(requestParameters: DeleteDeviceModelRequest): Promise<void> {
        await this.deleteDeviceModelRaw(requestParameters);
    }

    /**
     * Finds a device model by id
     * Find a device model
     */
    async findDeviceModelRaw(requestParameters: FindDeviceModelRequest): Promise<runtime.ApiResponse<DeviceModel>> {
        if (requestParameters.deviceModelId === null || requestParameters.deviceModelId === undefined) {
            throw new runtime.RequiredError('deviceModelId','Required parameter requestParameters.deviceModelId was null or undefined when calling findDeviceModel.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("bearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/deviceModels/{deviceModelId}`.replace(`{${"deviceModelId"}}`, encodeURIComponent(String(requestParameters.deviceModelId))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => DeviceModelFromJSON(jsonValue));
    }

    /**
     * Finds a device model by id
     * Find a device model
     */
    async findDeviceModel(requestParameters: FindDeviceModelRequest): Promise<DeviceModel> {
        const response = await this.findDeviceModelRaw(requestParameters);
        return await response.value();
    }

    /**
     * List exhibition device models
     * List device models
     */
    async listDeviceModelsRaw(): Promise<runtime.ApiResponse<Array<DeviceModel>>> {
        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("bearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/deviceModels`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DeviceModelFromJSON));
    }

    /**
     * List exhibition device models
     * List device models
     */
    async listDeviceModels(): Promise<Array<DeviceModel>> {
        const response = await this.listDeviceModelsRaw();
        return await response.value();
    }

    /**
     * Updates device model.
     * Updates device model.
     */
    async updateDeviceModelRaw(requestParameters: UpdateDeviceModelRequest): Promise<runtime.ApiResponse<DeviceModel>> {
        if (requestParameters.deviceModel === null || requestParameters.deviceModel === undefined) {
            throw new runtime.RequiredError('deviceModel','Required parameter requestParameters.deviceModel was null or undefined when calling updateDeviceModel.');
        }

        if (requestParameters.deviceModelId === null || requestParameters.deviceModelId === undefined) {
            throw new runtime.RequiredError('deviceModelId','Required parameter requestParameters.deviceModelId was null or undefined when calling updateDeviceModel.');
        }

        const queryParameters: runtime.HTTPQuery = {};

        const headerParameters: runtime.HTTPHeaders = {};

        headerParameters['Content-Type'] = 'application/json';

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = typeof token === 'function' ? token("bearerAuth", []) : token;

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const response = await this.request({
            path: `/v1/deviceModels/{deviceModelId}`.replace(`{${"deviceModelId"}}`, encodeURIComponent(String(requestParameters.deviceModelId))),
            method: 'PUT',
            headers: headerParameters,
            query: queryParameters,
            body: DeviceModelToJSON(requestParameters.deviceModel),
        });

        return new runtime.JSONApiResponse(response, (jsonValue) => DeviceModelFromJSON(jsonValue));
    }

    /**
     * Updates device model.
     * Updates device model.
     */
    async updateDeviceModel(requestParameters: UpdateDeviceModelRequest): Promise<DeviceModel> {
        const response = await this.updateDeviceModelRaw(requestParameters);
        return await response.value();
    }

}
