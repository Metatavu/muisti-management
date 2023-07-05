import { ExhibitionPageTabHolder } from "../components/content-editor/constants";
import { PageLayoutView } from "../generated/client";

/**
 * Utility class for previews
 */
export default class PreviewUtils {
  /**
   * Get tab content from tab map
   *
   * @param view page layout view
   * @param tabMap tab map
   * @returns list of tab holders
   */
  public static getTabContent = (
    view: PageLayoutView,
    tabMap?: Map<string, ExhibitionPageTabHolder>
  ): ExhibitionPageTabHolder[] => {
    const tabData: ExhibitionPageTabHolder[] = [];

    if (tabMap) {
      tabMap.forEach((value, key) => {
        if (value.tabComponent.contentContainerId === view.id) {
          tabData.push(value);
        }
      });
    }
    return tabData;
  };
}
