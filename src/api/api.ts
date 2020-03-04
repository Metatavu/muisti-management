import { Configuration, ExhibitionsApi, ExhibitionRoomsApi, ExhibitionPageLayoutsApi, ExhibitionPagesApi } from "../generated/client";
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
   * Gets initialized exhibition rooms api
   * 
   * @param token access token
   */
  public static getExhibitionRoomsApi(accessToken: AccessToken) {
    return new ExhibitionRoomsApi(Api.getConfiguration(accessToken));
  }

  /**
   * Gets initialized exhibition page layouts api
   * 
   * @param token access token
   */
  public static getExhibitionPageLayoutsApi(accessToken: AccessToken) {
    return new ExhibitionPageLayoutsApi(Api.getConfiguration(accessToken));
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
   * Gets api configuration
   * 
   * @param token acess token
   */
  private static getConfiguration(accessToken: AccessToken) {
    return new Configuration({
      basePath: process.env.REACT_APP_API_BASE_PATH,
      accessToken: accessToken.token
    });
  }

}