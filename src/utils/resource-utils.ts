import { ExhibitionPageResource, PageLayoutView, PageLayoutViewProperty, ExhibitionPageResourceType, PageLayoutWidgetType } from "../generated/client";

export interface PageResourceCache {
  resources: ExhibitionPageResource[];
  widgetIds: Map<string, string[]>;
  resourceToWidgetType: Map<string, PageLayoutWidgetType>;
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
    let ids: Map<string, string[]> = new Map();
    let resourceToWidgetType: Map<string, PageLayoutWidgetType> = new Map();

    const resourceProperties = layoutView.properties.filter(property => property.value.startsWith("@resources/"));
    resourceProperties.forEach(property => {
      const resource = translateLayoutPropertyToResource(property, layoutView);
      if (resource) {
        const splitPropertyValue = property.value.split("/");
        if (splitPropertyValue.length < 2) {
          return;
        }

        const id = splitPropertyValue[1];

        const foundElement = ids.get(layoutView.id);
        if (foundElement) {
          foundElement.push(id);
          ids.set(layoutView.id, foundElement);
          resourceToWidgetType.set(id, layoutView.widget);
        } else {
          const newList = [];
          newList.push(id);
          ids.set(layoutView.id, newList);
          resourceToWidgetType.set(id, layoutView.widget);
        }
        foundResources.push(resource);
      }
    });

    const { children } = layoutView;
    if (children && children.length) {
      children.forEach(child => {
        const childResources = ResourceUtils.getResourcesFromLayoutData(child);
        foundResources.push(...childResources.resources);
        ids = new Map([...Array.from(ids.entries()), ...Array.from(childResources.widgetIds.entries())]);
        resourceToWidgetType = new Map([...Array.from(resourceToWidgetType.entries()), ...Array.from(childResources.resourceToWidgetType.entries())]);
      });
    }

    return {
      resources: foundResources,
      widgetIds: ids,
      resourceToWidgetType: resourceToWidgetType
    } as PageResourceCache;
  }
}

/**
 * Translates layout property to resource
 *
 * @param property page layout view property
 * @param layoutView page layout view containing the property
 *
 * @returns exhibition page resource
 */
function translateLayoutPropertyToResource(property: PageLayoutViewProperty, layoutView: PageLayoutView): ExhibitionPageResource | undefined {
  const splitPropertyValue = property.value.split("/");
  if (splitPropertyValue.length < 2) {
    return;
  }

  const id = splitPropertyValue[1];
  const type = resolveResourceType(layoutView, property);
  const data = "";
  return { id, type, data } as ExhibitionPageResource;
}

/**
 * Returns resource type from given layout view and property key
 *
 * @param layoutView page layout view
 * @param property page layout view property
 * @returns correct exhibition page resource type
 */
function resolveResourceType(layoutView: PageLayoutView, property: PageLayoutViewProperty): ExhibitionPageResourceType {
  switch (property.name) {
    case "backgroundImage":
      return ExhibitionPageResourceType.Image;
    case "src":
      if (layoutView.widget === "ImageView") {
        return ExhibitionPageResourceType.Image;
      }
      return ExhibitionPageResourceType.Video;
    case "text":
      return ExhibitionPageResourceType.Text;
    default:
      return ExhibitionPageResourceType.Text;
  }
}
