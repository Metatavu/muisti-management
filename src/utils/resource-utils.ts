import { ExhibitionPageResource, PageLayoutView, PageLayoutViewProperty, ExhibitionPageResourceType } from "../generated/client";

export interface PageResourceCache {
  resources: ExhibitionPageResource[];
  widgetIds: Map<string, string>;
}

/**
 * Utility class for resources
 */
export default class ResourceUtils {

  /**
   * Returns a custom resource holder object that contains all page layout resources and
   * map of resource ID's mapped by widget UUID
   *
   * @param layoutView layout view
   * @returns custom resource holder
   */
  public static getResourcesFromLayoutData = (layoutView: PageLayoutView): PageResourceCache => {
    const foundResources: ExhibitionPageResource[] = [];
    let ids: Map<string, string> = new Map();

    const resourceProperties = layoutView.properties.filter(property => property.value.startsWith("@resources/"));
    resourceProperties.forEach(property => {
      const resource = translateLayoutPropertyToResource(property, layoutView);
      if (resource) {
        const splitPropertyValue = property.value.split("/");
        if (splitPropertyValue.length < 2) {
          return;
        }

        const id = splitPropertyValue[1];
        ids.set(layoutView.id, id);
        foundResources.push(resource);
      }
    });

    const { children } = layoutView;
    if (children && children.length) {
      children.forEach(child => {
        const childResources = ResourceUtils.getResourcesFromLayoutData(child);
        foundResources.push(...childResources.resources);
        ids = new Map([...Array.from(ids.entries()), ...Array.from(childResources.widgetIds.entries())]);
      });
    }
    const custom: PageResourceCache = {
      resources: foundResources,
      widgetIds: ids
    };
    return custom;
  }
}

/**
 * Translates layout property to resource
 *
 * @param property page layout view property
 * @param layoutView page layout view containing the property
 * @returns exhibition page resource
 */
function translateLayoutPropertyToResource(property: PageLayoutViewProperty, layoutView: PageLayoutView): ExhibitionPageResource | undefined {
  const splitPropertyValue = property.value.split("/");
  if (splitPropertyValue.length < 2) {
    return;
  }

  const id = splitPropertyValue[1];
  const type = resolveResourceType(layoutView);
  const data = "";
  return { id, type, data } as ExhibitionPageResource;
}

/**
 * Returns resource type from given layout view
 *
 * @param layoutView page layout view
 */
function resolveResourceType(layoutView: PageLayoutView): ExhibitionPageResourceType {
  switch (layoutView.widget) {
    case "ImageView": return ExhibitionPageResourceType.Image;
    case "MediaView": return ExhibitionPageResourceType.Video;
    case "TextView":
    case "FlowTextView": return ExhibitionPageResourceType.Text;
    default: return ExhibitionPageResourceType.Text;
  }
}
