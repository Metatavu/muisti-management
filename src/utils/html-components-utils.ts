import { v4 as uuid } from "uuid";
import { HtmlComponentType } from "../types";

namespace HtmlComponentsUtils {
  /**
   * Returns serialized HTML element based on type
   *
   * @param type type
   * @param name name
   */
  export const getSerializedHtmlElement = (type: HtmlComponentType, name = "") => {
    switch (type) {
      case HtmlComponentType.BUTTON:
        return getHtmlButtonElement(name);
      case HtmlComponentType.LAYOUT:
        return getHtmlLayoutElement(name);
      case HtmlComponentType.TEXT:
        return getHtmlTextElement(name);
      case HtmlComponentType.IMAGE:
        return getHtmlImageElement(name);
      case HtmlComponentType.TABS:
        return getHtmlTabsElement(name);
      case HtmlComponentType.TAB:
        return getHtmlTabElement(name);
      case HtmlComponentType.VIDEO:
        return getHtmlVideoElement(name);
    }
  };

  const getHtmlLayoutElement = (name?: string) =>
    `<div id="${uuid()}" data-component-type="layout" name="${name}" style="display: flex; flex-direction: row;"></div>`;
  const getHtmlButtonElement = (name?: string) =>
    `<button id="${uuid()}" data-component-type="button" name="${name}"></button>`;
  const getHtmlTextElement = (name?: string) =>
    `<p id="${uuid()}" data-component-type="text" name="${name}"></p>`;
  const getHtmlImageElement = (name?: string) =>
    `<img id="${uuid()}" data-component-type="image" name="${name}"/>`;
  const getHtmlTabsElement = (name?: string) =>
    `div id="${uuid()}" data-component-type="tabs" name="${name}"></div>`;
  const getHtmlTabElement = (name?: string) =>
    `<div id="${uuid()}" data-component-type="tab" name="${name}"></div>`;
  const getHtmlVideoElement = (name?: string) =>
    `<video id="${uuid()}" data-component-type="video" name="${name}"></video>`;
}

export default HtmlComponentsUtils;
