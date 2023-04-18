/**
 * Parse HTML string to HTML
 *
 * @param html
 */
export const parseToHtml = (htmlString: string) => {
  return new DOMParser().parseFromString(htmlString, "text/html").body;
};