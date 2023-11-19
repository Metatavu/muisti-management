import { cleanEnv, str, url, num } from "envalid";
import { StaticConfig } from "../types";

/**
 * Validates that environment variables are in place and have correct form
 */
const env = cleanEnv(process.env, {
  REACT_APP_KEYCLOAK_URL: url(),
  REACT_APP_KEYCLOAK_CLIENT_ID: str(),
  REACT_APP_KEYCLOAK_REALM: str(),
  REACT_APP_API_BASE_PATH: url(),
  REACT_APP_CDN_BASE_PATH: url(),
  REACT_APP_USER_CONTENT_UPLOAD_URL: url(),
  REACT_APP_MQTT_URLS: str(),
  REACT_APP_MQTT_PREFIX: str(),
  REACT_APP_MQTT_USERNAME: str(),
  REACT_APP_MQTT_PASSWORD: str(),
  REACT_APP_NEW_VISITOR_ANTENNA: str(),
  REACT_APP_RESET_VISITOR_VARIABLES_ANTENNA: str(),
  REACT_APP_VISITOR_MANAGEMENT_ANTENNAS: str(),
  REACT_APP_VISITOR_SESSION_TIME: num(),
  REACT_APP_DIAGNOSTICS_TAG_ZERO_DELAY: num(),
  REACT_APP_DIAGNOSTICS_TAG_REMOVE_DELAY: num()
});

/**
 * Class for software configuration
 */
export class Config {

  /**
   * Get static application configuration
   *
   * @returns static application configuration
   */
  public static getConfig = (): StaticConfig => {
    return {
      keycloakConfig: {
        url: env.REACT_APP_KEYCLOAK_URL,
        realm: env.REACT_APP_KEYCLOAK_REALM,
        clientId: env.REACT_APP_KEYCLOAK_CLIENT_ID
      },
      apiBasePath: env.REACT_APP_API_BASE_PATH,
      cdnBasePath: env.REACT_APP_CDN_BASE_PATH,
      userContentUploadUrl: env.REACT_APP_USER_CONTENT_UPLOAD_URL,
      mqttConfig: {
        urls: env.REACT_APP_MQTT_URLS.split(","),
        prefix: env.REACT_APP_MQTT_PREFIX,
        userName: env.REACT_APP_MQTT_USERNAME,
        password: env.REACT_APP_MQTT_PASSWORD,
        newVisitorAntenna: env.REACT_APP_NEW_VISITOR_ANTENNA,
        resetVisitorVariableAntenna: env.REACT_APP_RESET_VISITOR_VARIABLES_ANTENNA,
        visitorManagementAntennas: env.REACT_APP_VISITOR_MANAGEMENT_ANTENNAS.split("||"),
        sessionTime: env.REACT_APP_VISITOR_SESSION_TIME
      },
      diagnostics: {
        tagZeroDelay: env.REACT_APP_DIAGNOSTICS_TAG_ZERO_DELAY,
        tagRemoveDelay: env.REACT_APP_DIAGNOSTICS_TAG_REMOVE_DELAY
      }
    };
  }
}