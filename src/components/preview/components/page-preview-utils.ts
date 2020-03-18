import { PageLayoutViewProperty } from "../../../generated/client";
import AndroidUtils from "../../../utils/android-utils";
import DisplayMetrics from "../../../types/display-metrics";

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
  public static getLayoutChildWidth(displayMetrics: DisplayMetrics, layoutChildProperty: PageLayoutViewProperty, scale: number): string | null {
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
  public static getLayoutChildHeight(displayMetrics: DisplayMetrics, layoutChildProperty: PageLayoutViewProperty, scale: number): string | null {
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
  public static getLayoutChildMargin(displayMetrics: DisplayMetrics, layoutChildProperty: PageLayoutViewProperty, scale: number): string | null {
    const margin = AndroidUtils.stringToPx(displayMetrics, layoutChildProperty.value, scale);
    if (!margin) {
      return null;
    }

    return `${margin}px`;
  }

  /**
   * Resolves a size for layout child component property
   * 
   * @param displayMetrics display metrics
   * @param layoutChildProperty layout child property 
   * @param scale scale
   * @returns size or null if size could not be resolved
   */
  private static getLayoutChildSize(displayMetrics: DisplayMetrics, layoutChildProperty: PageLayoutViewProperty, scale: number): string | null {
    if ("match_parent" === layoutChildProperty.value) {
      return "100%"
    } else {
      const px = AndroidUtils.stringToPx(displayMetrics, layoutChildProperty.value, scale);
      if (px) {
        return `${px}px`
      }
    }

    return null;
  }

} 