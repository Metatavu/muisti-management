import { ContentVersion } from "../generated/client";
import strings from "../localization/strings";
import { HtmlComponentType, LayoutAlignment } from "../types";

/**
 * Utility class for handling languages
 */
export default class LanguageUtils {

  /**
   * Returns available language options from content version
   *
   * @param contentVersions exhibition content versions
   * @returns available language options
   */
  public static getAvailableLanguages = (contentVersions: ContentVersion[]): string[] => {
    const languages: string[] = [];

    contentVersions.forEach(version => {
      const language = version.language;
      if (!languages.includes(language)) {
        languages.push(language);
      }
    });

    return languages;
  }
  
  /**
   * Returns localized layout alignment text
   * 
   * @param alignment alignment
   */
  public static getLocalizedLayoutAlignment = (alignment: LayoutAlignment) => ({
    [LayoutAlignment.NORTH_WEST]: strings.layout.htmlProperties.genericProperties.alignment.northwest,
    [LayoutAlignment.NORTH]: strings.layout.htmlProperties.genericProperties.alignment.north,
    [LayoutAlignment.NORTH_EAST]: strings.layout.htmlProperties.genericProperties.alignment.northeast,
    [LayoutAlignment.WEST]: strings.layout.htmlProperties.genericProperties.alignment.west,
    [LayoutAlignment.CENTER]: strings.layout.htmlProperties.genericProperties.alignment.center,
    [LayoutAlignment.EAST]: strings.layout.htmlProperties.genericProperties.alignment.east,
    [LayoutAlignment.SOUTH_WEST]: strings.layout.htmlProperties.genericProperties.alignment.southwest,
    [LayoutAlignment.SOUTH]: strings.layout.htmlProperties.genericProperties.alignment.south,
    [LayoutAlignment.SOUTH_EAST]: strings.layout.htmlProperties.genericProperties.alignment.southeast
  })[alignment]
  
  /**
   * Returns localized component type
   * 
   * @param componentType component type
   */
  public static getLocalizedComponentType = (componentType: HtmlComponentType) => ({
    [HtmlComponentType.LAYOUT]: strings.layout.html.types.layout,
    [HtmlComponentType.BUTTON]: strings.layout.html.types.button,
    [HtmlComponentType.IMAGE]: strings.layout.html.types.image,
    [HtmlComponentType.TEXT]: strings.layout.html.types.text,
    [HtmlComponentType.TABS]: strings.layout.html.types.tabs,
    [HtmlComponentType.TAB]: strings.layout.html.types.tab
  })[componentType]
}
