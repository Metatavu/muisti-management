import { Config } from "../constants/configuration";
import {
  Configuration,
  ContentVersionsApi,
  DeviceModelsApi,
  DevicesApi,
  ExhibitionDeviceGroupsApi,
  ExhibitionDevicesApi,
  ExhibitionFloorsApi,
  ExhibitionPagesApi,
  ExhibitionRoomsApi,
  ExhibitionsApi,
  PageLayoutsApi,
  RfidAntennasApi,
  StoredFilesApi,
  SubLayoutsApi,
  VisitorSessionsApi,
  VisitorVariablesApi,
  VisitorsApi
} from "../generated/client";
import { AccessToken } from "../types";

/**
 * Utility class for loading api with predefined configuration
 */
export default class Api {
  /**
   * Gets initialized exhibitions api
   *
   * @param token access token
   */
  public static getExhibitionsApi(accessToken: AccessToken) {
    return new ExhibitionsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition content versions api
   *
   * @param token access token
   */
  public static getContentVersionsApi(accessToken: AccessToken) {
    return new ContentVersionsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition floors api
   *
   * @param token access token
   */
  public static getExhibitionFloorsApi(accessToken: AccessToken) {
    return new ExhibitionFloorsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition rooms api
   *
   * @param token access token
   */
  public static getExhibitionRoomsApi(accessToken: AccessToken) {
    return new ExhibitionRoomsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition devices api
   *
   * @param token access token
   */
  public static getExhibitionDevicesApi(accessToken: AccessToken) {
    return new ExhibitionDevicesApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized rfid antennas api
   *
   * @param token access token
   */
  public static getRfidAntennasApi(accessToken: AccessToken) {
    return new RfidAntennasApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition device groups api
   *
   * @param token access token
   */
  public static getExhibitionDeviceGroupsApi(accessToken: AccessToken) {
    return new ExhibitionDeviceGroupsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition device models api
   *
   * @param token access token
   */
  public static getDeviceModelsApi(accessToken: AccessToken) {
    return new DeviceModelsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition page layouts api
   *
   * @param token access token
   */
  public static getPageLayoutsApi(accessToken: AccessToken) {
    return new PageLayoutsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized sub layouts api
   *
   * @param token access token
   */
  public static getSubLayoutsApi(accessToken: AccessToken) {
    return new SubLayoutsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition pages api
   *
   * @param token access token
   */
  public static getExhibitionPagesApi(accessToken: AccessToken) {
    return new ExhibitionPagesApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized stored files api
   *
   * @param token access token
   */
  public static getStoredFilesApi(accessToken: AccessToken) {
    return new StoredFilesApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized visitors api
   *
   * @param token access token
   */
  public static getVisitorsApi(accessToken: AccessToken) {
    return new VisitorsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized visitor variables api
   *
   * @param accessToken access token
   */
  public static getVisitorVariablesApi(accessToken: AccessToken) {
    return new VisitorVariablesApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized visitor sessions api
   *
   * @param accessToken access token
   */
  public static getVisitorSessionsApi(accessToken: AccessToken) {
    return new VisitorSessionsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized devices api
   *
   * @param accessToken access token
   */
  public static getDevicesApi(accessToken: AccessToken) {
    return new DevicesApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets api configuration
   *
   * @param token acess token
   */
  private static getConfiguration(accessToken: AccessToken) {
    return new Configuration({
      basePath: Config.getConfig().apiBasePath,
      accessToken: accessToken.token
    });
  }
}
