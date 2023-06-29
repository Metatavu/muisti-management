import { ContentVersion } from "../generated/client";

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

    contentVersions.forEach((version) => {
      const language = version.language;
      if (!languages.includes(language)) {
        languages.push(language);
      }
    });

    return languages;
  };
}
