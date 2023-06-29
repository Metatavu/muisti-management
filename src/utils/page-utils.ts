import { ExhibitionPage } from "../generated/client";

export default class PageUtils {
  /**
   * Returns pages sorted in alphabetical order
   *
   * @param pages pages
   * @return pages sorted in alphabetical order
   */
  public static getSortedPages = (pages: ExhibitionPage[]): ExhibitionPage[] => {
    const result = [...pages];

    result.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return result;
  };
}
