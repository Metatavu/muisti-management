import { ExhibitionPageResource, PageLayoutView, PageLayoutViewProperty, ExhibitionPageResourceType } from "../generated/client";

/**
 * Utility class for resources
 */
export default class ResourceUtils {

  /**
   * Returns a list of resources from page layout data
   * @param layoutView layout view
   * @returns exhibition page resources list
   */
  public static getResourcesFromLayoutData = (layoutView: PageLayoutView): ExhibitionPageResource[] => {
    const foundResources: ExhibitionPageResource[] = [];
    const resourceProperties = layoutView.properties.filter(property => property.value.startsWith("@resources/"));
    resourceProperties.forEach(property => {
      const resource = translateLayoutPropertyToResource(property, layoutView);
      if (resource) {
        foundResources.push(resource);
      }
    });

    const { children } = layoutView;
    if (children && children.length) {
      children.forEach(child => {
        const childResources = ResourceUtils.getResourcesFromLayoutData(child);
        foundResources.push(...childResources);
      });
    }

    return foundResources;
  }
}

/**
 * Translates layout property to resource
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
