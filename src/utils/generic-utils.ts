export default class GenericUtils {

  /**
   * Get any enum keys
   *
   * @param enumObject enum object
   */
  public static enumKeys<T>(enumObject: T) {
    return Object.keys(enumObject);
  }

  /**
   * Get any enum values
   *
   * @param enumObject enum object
   */
  public static enumValues<T>(enumObject: T) {
    return Object.values(enumObject);
  }

}