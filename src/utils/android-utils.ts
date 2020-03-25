import DisplayMetrics from "../types/display-metrics";
import { DeviceModel } from "../generated/client";

/**
 * Utilities for Android
 */
export default class AndroidUtils {

  private static DENSITY_DEFAULT = 160;

  /**
   * Returns display metrics for a device model
   *
   * @param deviceModel device model
   */
  public static getDisplayMetrics(deviceModel: DeviceModel) {
    const displayMetrics = deviceModel.displayMetrics;

    const result: DisplayMetrics = {
      density: displayMetrics.density || 0,
      heightPixels: displayMetrics.heightPixels || 0,
      widthPixels: displayMetrics.widthPixels || 0,
      xdpi: displayMetrics.xdpi || 0,
      ydpi: displayMetrics.ydpi || 0,
      densityDpi: ((displayMetrics.density || 0) * AndroidUtils.DENSITY_DEFAULT)
    }

    return result;
  }

  /**
   * Parses string to pixels
   *
   * @param value string
   * @returns parsed number of pixels or null if string could not be parsed
   */
  public static stringToPx(displayMetrics: DisplayMetrics, value: string, scale: number): number | null {
    const dp = AndroidUtils.dpToNumber(value);
    if (dp) {
      return AndroidUtils.convertDpToPixel(displayMetrics, dp, scale);
    }

    const sp = AndroidUtils.spToNumber(value);
    if (sp) {
      return AndroidUtils.convertSpToPixel(displayMetrics, sp, scale);
    }

    return null;
  }

  /**
   * Parses DP string into number
   *
   * @param value string
   * @returns parsed number or null if is not a DP string
   */
  public static dpToNumber(value: string): number | null {
    const match = /([0-9.]+)dp/.exec(value);
    return match && match.length > 1 ? parseFloat(match[1]) : null;
  }

  /**
   * Parses SP string into number
   *
   * @param value string
   * @returns parsed number or null if is not a SP string
   */
  public static spToNumber(value: string): number | null {
    const match = /([0-9.]+)sp/.exec(value);
    return match && match.length > 1 ? parseFloat(match[1]) : null;
  }

  /**
   * Converts SPs to pixels
   *
   * @param displayMetrics display metrics object
   * @param sp SPs
   * @param scale scale factor
   * @returns pixels
   */
  public static convertSpToPixel(displayMetrics: DisplayMetrics, sp: number, scale: number): number | null {
    return sp * displayMetrics.density * scale;
  }

  /**
   * Converts DPs to pixels
   *
   * @param displayMetrics display metrics object
   * @param dp DPs
   * @param scale scale factor
   * @returns pixels
   */
  public static convertDpToPixel(displayMetrics: DisplayMetrics, dp: number, scale: number): number  {
    return (dp * (displayMetrics.densityDpi / AndroidUtils.DENSITY_DEFAULT)) * scale;
  }

  /**
   * Converts pixels to DPs
   *
   * @param displayMetrics display metrics object
   * @param px pixels
   * @param scale scale factor
   * @returns pixels
   */
  public static convertPixelsToDp(displayMetrics: DisplayMetrics, px: number, scale: number): number {
    return (px * scale) / (displayMetrics.densityDpi / AndroidUtils.DENSITY_DEFAULT);
  }

}
