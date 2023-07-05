import { PageLayoutViewProperty, PageLayoutViewPropertyType } from "../../../generated/client";
import DisplayMetrics from "../../../types/display-metrics";
import AndroidUtils from "../../../utils/android-utils";

/**
 * Utility class for page preview
 */
export default class PagePreviewUtils {
  /**
   * Resolves a width for layout child component
   *
   * @param displayMetrics display metrics
   * @param layoutChildProperty layout child property
   * @param scale scale
   * @returns width or null if width could not be resolved
   */
  public static getLayoutChildWidth(
    displayMetrics: DisplayMetrics,
    layoutChildProperty: PageLayoutViewProperty,
    scale: number
  ): string | null {
    return PagePreviewUtils.getLayoutChildSize(displayMetrics, layoutChildProperty, scale);
  }

  /**
   * Resolves a height for layout child component
   *
   * @param displayMetrics display metrics
   * @param layoutChildProperty layout child property
   * @param scale scale
   * @returns height or null if height could not be resolved
   */
  public static getLayoutChildHeight(
    displayMetrics: DisplayMetrics,
    layoutChildProperty: PageLayoutViewProperty,
    scale: number
  ): string | null {
    return PagePreviewUtils.getLayoutChildSize(displayMetrics, layoutChildProperty, scale);
  }

  /**
   * Resolves a margin for layout child component
   *
   * @param displayMetrics display metrics
   * @param layoutChildProperty layout child property
   * @param scale scale
   * @returns margin or null if margin could not be resolved
   */
  public static getLayoutChildMargin(
    displayMetrics: DisplayMetrics,
    layoutChildProperty: PageLayoutViewProperty,
    scale: number
  ): string | null {
    const margin = AndroidUtils.stringToPx(displayMetrics, layoutChildProperty.value, scale);
    if (!margin) {
      return null;
    }

    return `${margin}px`;
  }

  /**
   * Adds default layout properties into child properties
   *
   * @param childProperties child properties
   * @returns childProperties with default values
   */
  public static withDefaultLayoutProperties = (childProperties: PageLayoutViewProperty[]) => {
    const result = [...childProperties];

    if (!result.find((childProperty) => childProperty.name === "layout_height")) {
      result.push({
        name: "layout_height",
        type: PageLayoutViewPropertyType.String,
        value: "match_parent"
      });
    }

    if (!result.find((childProperty) => childProperty.name === "layout_width")) {
      result.push({
        name: "layout_width",
        type: PageLayoutViewPropertyType.String,
        value: "match_parent"
      });
    }

    return result;
  };

  /**
   * Resolves a size for layout child component property
   *
   * @param displayMetrics display metrics
   * @param layoutChildProperty layout child property
   * @param scale scale
   * @returns size or null if size could not be resolved
   */
  private static getLayoutChildSize(
    displayMetrics: DisplayMetrics,
    layoutChildProperty: PageLayoutViewProperty,
    scale: number
  ): string | null {
    if ("match_parent" === layoutChildProperty.value) {
      return "100%";
    } else {
      const px = AndroidUtils.stringToPx(displayMetrics, layoutChildProperty.value, scale);
      if (px) {
        return `${px}px`;
      }
    }

    return null;
  }
}
