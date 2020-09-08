import { ExhibitionPageResource, PageLayoutView, PageLayoutViewProperty, ExhibitionPageResourceType, PageLayoutWidgetType } from "../generated/client";
import { TabStructure } from "../components/content-editor/constants";
import { parseStringToJsonObject } from "./content-editor-utils";

/**
 * Tab resource cache object
 */
export interface TabResourceCache {
  tabResourceId: string;
  tabContentContainerId?: string;
}

/**
 * Page resource cache
 */
export interface PageResourceCache {
  resources: ExhibitionPageResource[];
  widgetIds: Map<string, string[]>;
  resourceToWidgetType: Map<string, PageLayoutWidgetType>;
  tabPropertyIdToTabResourceId: Map<string, TabResourceCache>;
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
    let tabPropertyIdToTabResourceId: Map<string, TabResourceCache> = new Map();

    const resourceProperties = layoutView.properties.filter(property => property.value.startsWith("@resources/"));
    resourceProperties.forEach(property => {
      const resource = translateLayoutPropertyToResource(property, layoutView);
      if (resource) {
        const splitPropertyValue = property.value.split("/");
        if (splitPropertyValue.length < 2) {
          return;
        }

        const propertyId = splitPropertyValue[1];

        const foundElement = ids.get(layoutView.id);
        if (foundElement) {
          foundElement.push(propertyId);
          ids.set(layoutView.id, foundElement);
          resourceToWidgetType.set(propertyId, layoutView.widget);
          if (layoutView.widget === PageLayoutWidgetType.MaterialTabLayout) {
            tabPropertyIdToTabResourceId.set(
              layoutView.id,
              { tabResourceId: propertyId, tabContentContainerId: layoutView.contentContainerId }
            );
          }
        } else {
          const newList = [];
          newList.push(propertyId);
          ids.set(layoutView.id, newList);
          resourceToWidgetType.set(propertyId, layoutView.widget);
          if (layoutView.widget === PageLayoutWidgetType.MaterialTabLayout) {
            tabPropertyIdToTabResourceId.set(
              layoutView.id,
              { tabResourceId: propertyId, tabContentContainerId: layoutView.contentContainerId }
            );
          }
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
        tabPropertyIdToTabResourceId = new Map([
          ...Array.from(tabPropertyIdToTabResourceId.entries()),
          ...Array.from(childResources.tabPropertyIdToTabResourceId.entries())
        ]);
      });
    }

    return {
      resources: foundResources,
      widgetIds: ids,
      resourceToWidgetType: resourceToWidgetType,
      tabPropertyIdToTabResourceId
    } as PageResourceCache;
  }

  /**
   * Get resources from tab component
   *
   * @param resources list of exhibition page resources
   * @param tabResourceIndex tab resource index
   * @param contentContainerId content container id
   * @returns Tab structure object
   */
  public static getResourcesForTabComponent = (resources: ExhibitionPageResource[], tabResourceIndex: number, contentContainerId?: string): TabStructure => {
    const data = resources[tabResourceIndex].data;
    const parsed = parseStringToJsonObject<typeof data, TabStructure>(data);
    if (!parsed) {
      return { contentContainerId: contentContainerId, tabs: [] } as TabStructure;
    }

    return parsed;
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
