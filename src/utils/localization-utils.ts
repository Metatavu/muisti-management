import { DeviceApprovalStatus } from "../generated/client";
import strings from "../localization/strings";
import { HtmlComponentType, HtmlTextComponentType, LayoutAlignment } from "../types";

/**
 * Namespace containing localization utilities
 */
namespace LocalizationUtils {
  /**
   * Returns localized layout alignment text
   *
   * @param alignment alignment
   */
  export const getLocalizedLayoutAlignment = (alignment: LayoutAlignment) =>
    ({
      [LayoutAlignment.NORTH_WEST]: strings.layoutEditorV2.layoutProperties.alignment.northwest,
      [LayoutAlignment.NORTH]: strings.layoutEditorV2.layoutProperties.alignment.north,
      [LayoutAlignment.NORTH_EAST]: strings.layoutEditorV2.layoutProperties.alignment.northeast,
      [LayoutAlignment.WEST]: strings.layoutEditorV2.layoutProperties.alignment.west,
      [LayoutAlignment.CENTER]: strings.layoutEditorV2.layoutProperties.alignment.center,
      [LayoutAlignment.EAST]: strings.layoutEditorV2.layoutProperties.alignment.east,
      [LayoutAlignment.SOUTH_WEST]: strings.layoutEditorV2.layoutProperties.alignment.southwest,
      [LayoutAlignment.SOUTH]: strings.layoutEditorV2.layoutProperties.alignment.south,
      [LayoutAlignment.SOUTH_EAST]: strings.layoutEditorV2.layoutProperties.alignment.southeast
    })[alignment];

  /**
   * Returns localized component type
   *
   * @param componentType component type
   */
  export const getLocalizedComponentType = (componentType: HtmlComponentType) =>
    ({
      [HtmlComponentType.LAYOUT]: strings.layout.html.types.layout,
      [HtmlComponentType.BUTTON]: strings.layout.html.types.button,
      [HtmlComponentType.IMAGE]: strings.layout.html.types.image,
      [HtmlComponentType.TEXT]: strings.layout.html.types.text,
      [HtmlComponentType.TABS]: strings.layout.html.types.tabs,
      [HtmlComponentType.TAB]: strings.layout.html.types.tab,
      [HtmlComponentType.VIDEO]: strings.layout.html.types.video,
      [HtmlComponentType.IMAGE_BUTTON]: strings.layout.html.types.imageButton
    })[componentType];

  /**
   * Return localized help text according to selected component
   *
   * @param componentType component type
   */
  export const getLocalizedNewComponentHelpText = (componentType: HtmlComponentType) =>
    ({
      [HtmlComponentType.LAYOUT]: strings.helpTexts.layoutEditorHtml.layoutDescription,
      [HtmlComponentType.BUTTON]: strings.helpTexts.layoutEditorHtml.buttonDescription,
      [HtmlComponentType.IMAGE]: strings.helpTexts.layoutEditorHtml.imageViewDescription,
      [HtmlComponentType.TEXT]: strings.helpTexts.layoutEditorHtml.textViewDescription,
      [HtmlComponentType.TABS]: strings.helpTexts.layoutEditorHtml.tabsViewDescription,
      [HtmlComponentType.TAB]: strings.helpTexts.layoutEditorHtml.tabViewDescription,
      [HtmlComponentType.VIDEO]: strings.helpTexts.layoutEditorHtml.videoViewDescription,
      [HtmlComponentType.IMAGE_BUTTON]: strings.helpTexts.layoutEditorHtml.videoViewDescription
    })[componentType];

  /**
   * Returns localized text component type
   *
   * @param textComponentType text component type
   */
  export const getLocalizedTextComponentType = (textComponentType: HtmlTextComponentType) =>
    ({
      [HtmlTextComponentType.H1]: strings.layout.html.textTypes.heading1,
      [HtmlTextComponentType.H2]: strings.layout.html.textTypes.heading2,
      [HtmlTextComponentType.H3]: strings.layout.html.textTypes.heading3,
      [HtmlTextComponentType.H4]: strings.layout.html.textTypes.heading4,
      [HtmlTextComponentType.H5]: strings.layout.html.textTypes.heading5,
      [HtmlTextComponentType.H6]: strings.layout.html.textTypes.heading6,
      [HtmlTextComponentType.P]: strings.layout.html.textTypes.body,
      [HtmlTextComponentType.BUTTON]: strings.layout.html.textTypes.body
    })[textComponentType];

  /**
   * Returns localized margin/padding tooltip
   *
   * @param suffix suffix
   */
  export const getLocalizedMarginPaddingTooltip = (suffix: string) =>
    ({
      "-top": strings.layoutEditorV2.genericProperties.tooltips.top,
      "-right": strings.layoutEditorV2.genericProperties.tooltips.right,
      "-bottom": strings.layoutEditorV2.genericProperties.tooltips.bottom,
      "-left": strings.layoutEditorV2.genericProperties.tooltips.left
    })[suffix];

  /**
   * Returns localized border radius tooltip
   *
   * @param suffix suffix
   */
  export const getLocalizedBorderRadiusTooltip = (suffix: string) =>
    ({
      "-top-left": strings.layoutEditorV2.genericProperties.tooltips.topLeft,
      "-top-right": strings.layoutEditorV2.genericProperties.tooltips.topRight,
      "-bottom-right": strings.layoutEditorV2.genericProperties.tooltips.bottomRight,
      "-bottom-left": strings.layoutEditorV2.genericProperties.tooltips.bottomLeft
    })[suffix];

  /**
   * Returns localized device approval status
   *
   * @param approvalStatus approvalStatus
   */
  export const getLocalizedDeviceApprovalStatus = (approvalStatus: DeviceApprovalStatus) =>
    ({
      [DeviceApprovalStatus.Pending]: strings.devicesV2.approvalStatus.pending,
      [DeviceApprovalStatus.Approved]: strings.devicesV2.approvalStatus.approved,
      [DeviceApprovalStatus.Ready]: strings.devicesV2.approvalStatus.ready,
      [DeviceApprovalStatus.PendingReapproval]: strings.devicesV2.approvalStatus.pendingReApproval
    })[approvalStatus];
}

export default LocalizationUtils;
