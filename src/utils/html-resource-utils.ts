import { ExhibitionPageResource } from "../generated/client";

/**
 * Utility functions for handling html resources
 */
namespace HtmlResourceUtils {

  /**
   * Returns the resource id from a resource path
   * 
   * @param resourcePath resource path
   * @returns resource id
   */
  export const getResourceId = (resourcePath: string | undefined | null) => resourcePath?.replace("@resources/", "");

  /**
   * Returns the resource path from a resource id
   * 
   * @param resourceId resource id
   * @returns resource path
   */
  export const getResourcePath = (resourceId: string | undefined | null) => resourceId ? `@resources/${resourceId}` : undefined;

  /**
   * Returns the resource based on a resource path
   * 
   * @param resources resources
   * @param resourcePath resource path
   * @returns resource or null if not found
   */
  export const getResource = (resources: ExhibitionPageResource[] | undefined, resourcePath: string | undefined | null) => {
    if (!resources || !resourcePath) return;
    return resources.find((resource) => resource.id === getResourceId(resourcePath)) || null;
  }

  /**
   * Returns the resource data based on a resource path
   * 
   * @param resources resources
   * @param resourcePath resource path
   * @returns resource data or null if not found
   */
  export const getResourceData = (resources: ExhibitionPageResource[] | undefined, resourcePath: string | undefined | null) => {
    const resource = getResource(resources, resourcePath);
    return resource?.data || null;
  }

}

export default HtmlResourceUtils;