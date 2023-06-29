import { cleanEnv, bool, str, url, num } from "envalid";
import { StaticConfig } from "../types";

/**
 * Validates that environment variables are in place and have correct form
 */
const env = cleanEnv(import.meta.env, {
  VITE_KEYCLOAK_URL: url(),
  VITE_KEYCLOAK_CLIENT_ID: str(),
  VITE_KEYCLOAK_REALM: str(),
  VITE_API_BASE_PATH: url(),
  VITE_CDN_BASE_PATH: url(),
  VITE_USER_CONTENT_UPLOAD_URL: url(),
  VITE_MQTT_SECURE: bool(),
  VITE_MQTT_HOST: str(),
  VITE_MQTT_PORT: num(),
  VITE_MQTT_PATH: str(),
  VITE_MQTT_PREFIX: str(),
  VITE_MQTT_USERNAME: str(),
  VITE_MQTT_PASSWORD: str(),
  VITE_NEW_VISITOR_ANTENNA: str(),
  VITE_RESET_VISITOR_VARIABLES_ANTENNA: str(),
  VITE_VISITOR_MANAGEMENT_ANTENNAS: str(),
  VITE_VISITOR_SESSION_TIME: num(),
  VITE_DIAGNOSTICS_TAG_ZERO_DELAY: num(),
  VITE_DIAGNOSTICS_TAG_REMOVE_DELAY: num()
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
        url: env.VITE_KEYCLOAK_URL,
        realm: env.VITE_KEYCLOAK_REALM,
        clientId: env.VITE_KEYCLOAK_CLIENT_ID
      },
      apiBasePath: env.VITE_API_BASE_PATH,
      cdnBasePath: env.VITE_CDN_BASE_PATH,
      userContentUploadUrl: env.VITE_USER_CONTENT_UPLOAD_URL,
      mqttConfig: {
        secure: env.VITE_MQTT_SECURE,
        host: env.VITE_MQTT_HOST,
        port: env.VITE_MQTT_PORT,
        path: env.VITE_MQTT_PATH,
        prefix: env.VITE_MQTT_PREFIX,
        userName: env.VITE_MQTT_USERNAME,
        password: env.VITE_MQTT_PASSWORD,
        newVisitorAntenna: env.VITE_NEW_VISITOR_ANTENNA,
        resetVisitorVariableAntenna: env.VITE_RESET_VISITOR_VARIABLES_ANTENNA,
        visitorManagementAntennas: env.VITE_VISITOR_MANAGEMENT_ANTENNAS.split("||"),
        sessionTime: env.VITE_VISITOR_SESSION_TIME
      },
      diagnostics: {
        tagZeroDelay: env.VITE_DIAGNOSTICS_TAG_ZERO_DELAY,
        tagRemoveDelay: env.VITE_DIAGNOSTICS_TAG_REMOVE_DELAY
      }
    };
  };
}
