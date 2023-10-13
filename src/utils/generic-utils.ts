namespace GenericUtils {
  /**
   * Get any enum keys
   *
   * @param enumObject enum object
   */
  export const enumKeys = <T extends {}>(enumObject: T) => {
    return Object.keys(enumObject);
  };

  /**
   * Get any enum values
   *
   * @param enumObject enum object
   */
  export const enumValues = <T extends {}>(enumObject: T) => {
    return Object.values(enumObject);
  };

  /**
   * Returns an array of distinct values
   *
   * @param array Array to get distinct values from
   * @returns Array of distinct values
   */
  export const distinctArray = <T,>(array: T[]) => [...new Set(array)];

  /**
   * Returns whether logged in user is a developer
   *
   * @param keycloak Keycloak instance
   * @returns Whether logged in user is a developer
   */
  export const isDeveloper = (keycloak: Keycloak.KeycloakInstance) =>
    keycloak.hasRealmRole("developer");
}

export default GenericUtils;
