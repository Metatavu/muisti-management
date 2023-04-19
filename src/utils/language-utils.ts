import { ContentVersion } from "../generated/client";
import strings from "../localization/strings";
import { LayoutAlignment } from "../types";

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
  public static getLocalizedLayoutAlignment = (alignment: LayoutAlignment): string => ({
    "nw": strings.layout.htmlProperties.genericProperties.alignment.northwest,
    "n": strings.layout.htmlProperties.genericProperties.alignment.north,
    "ne": strings.layout.htmlProperties.genericProperties.alignment.northeast,
    "w": strings.layout.htmlProperties.genericProperties.alignment.west,
    "c": strings.layout.htmlProperties.genericProperties.alignment.center,
    "e": strings.layout.htmlProperties.genericProperties.alignment.east,
    "sw": strings.layout.htmlProperties.genericProperties.alignment.southwest,
    "s": strings.layout.htmlProperties.genericProperties.alignment.south,
    "se": strings.layout.htmlProperties.genericProperties.alignment.southeast
  }[alignment])

}
