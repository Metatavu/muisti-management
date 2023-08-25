import {
  ExhibitionPageResource,
  ExhibitionPageResourceType,
  LayoutType,
  PageLayout,
  PageLayoutViewHtml,
  PageResourceMode
} from "../generated/client";
import { TreeObject } from "../types";

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
  export const getResourceId = (resourcePath: string | undefined | null) =>
    resourcePath?.replace("@resources/", "");

  /**
   * Returns the resource path from a resource id
   *
   * @param resourceId resource id
   * @returns resource path
   */
  export const getResourcePath = (resourceId: string | undefined | null) =>
    resourceId ? `@resources/${resourceId}` : undefined;

  /**
   * Returns the resource based on a resource path
   *
   * @param resources resources
   * @param resourcePath resource path
   * @returns resource or null if not found
   */
  export const getResource = (
    resources: ExhibitionPageResource[] | undefined,
    resourcePath: string | undefined | null
  ) => {
    if (!resources || !resourcePath) return;
    return resources.find((resource) => resource.id === getResourceId(resourcePath)) || null;
  };

  /**
   * Returns the resource data based on a resource path
   *
   * @param resources resources
   * @param resourcePath resource path
   * @returns resource data or null if not found
   */
  export const getResourceData = (
    resources: ExhibitionPageResource[] | undefined,
    resourcePath: string | undefined | null
  ) => {
    const resource = getResource(resources, resourcePath);
    return resource?.data;
  };

  /**
   * Extracts layout resource ids from given html string
   *
   * @param html html string
   * @returns found resource ids
   */
  export const extractResourceIds = (html: string) =>
    html
      .match(/@resources\/[a-zA-Z0-9-]{1,}/gm)
      ?.map((match) => match.replace("@resources/", "")) ?? [];

  /**
   * Returns default resources for given layout. If resources are missing from default resources, they are added.
   *
   * @param layout layout
   * @returns layout default resources
   */
  export const getDefaultResources = (layout: PageLayout): ExhibitionPageResource[] => {
    if (layout.layoutType === LayoutType.Html) {
      const layoutData = layout.data as PageLayoutViewHtml;
      const defaultResources = layout.defaultResources || [];
      const resourceIds = HtmlResourceUtils.extractResourceIds(layoutData.html);

      return resourceIds.map((resourceId) => {
        return (
          defaultResources.find((resource) => resource.id === resourceId) || {
            id: resourceId,
            data: "",
            mode: PageResourceMode.Static,
            type: ExhibitionPageResourceType.Html
          }
        );
      });
    } else {
      throw new Error(`Unsupported layout type ${layout.layoutType}`);
    }
  };

  /**
   * Extracts resource ids from given tree object
   *
   * @param treeObject tree object
   * @returns resource ids found in tree object
   */
  export const getTreeObjectResourceIds = (treeObject: TreeObject) => {
    const elementClone = treeObject.element.cloneNode(false) as HTMLElement;

    for (const childNode of treeObject.element.childNodes) {
      if (childNode.nodeType === Node.TEXT_NODE) {
        elementClone.appendChild(childNode.cloneNode());
      }
    }

    return extractResourceIds(elementClone.outerHTML);
  };
}

export default HtmlResourceUtils;
