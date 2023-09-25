import { HtmlComponentType, HtmlTextComponentType } from "../types";
import { v4 as uuid } from "uuid";

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
    `<button id="${uuid()}" data-component-type="button" name="${name}">@resources/${uuid()}</button>`;
  const getHtmlTextElement = (name?: string) =>
    `<p id="${uuid()}" data-component-type="text" name="${name}">@resources/${uuid()}</p>`;
  const getHtmlImageElement = (name?: string) =>
    `<img id="${uuid()}" data-component-type="image" name="${name}" src="@resources/${uuid()}"/>`;
  const getHtmlTabsElement = (name?: string) =>
    `div id="${uuid()}" data-component-type="tabs" name="${name}"></div>`;
  const getHtmlTabElement = (name?: string) =>
    `<div id="${uuid()}" data-component-type="tab" name="${name}"></div>`;
  const getHtmlVideoElement = (name?: string) =>
    `<video id="${uuid()}" data-component-type="video" name="${name}"><source src="@resources/${uuid()}"></video>`;

  export const ALIGNMENT_MAP = {
    nw: {
      row: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-start"
      }
    },
    n: {
      row: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "center"
      }
    },
    ne: {
      row: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-end"
      }
    },
    w: {
      row: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-start"
      }
    },
    c: {
      row: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "center"
      }
    },
    e: {
      row: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-end"
      }
    },
    sw: {
      row: {
        "justify-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-start"
      }
    },
    s: {
      row: {
        "justify-content": "center",
        "justify-items": "center",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "center"
      }
    },
    se: {
      row: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-end"
      }
    }
  };

  /**
   * Base font size for default fonts
   */
  export const BASE_FONT_SIZE = 16;

  /**
   * Default font sizes depending on HTML text component type
   */
  export const DEFAULT_FONT_SIZES = {
    [HtmlTextComponentType.H1]: BASE_FONT_SIZE * 2,
    [HtmlTextComponentType.H2]: BASE_FONT_SIZE * 1.5,
    [HtmlTextComponentType.H3]: BASE_FONT_SIZE * 1.17,
    [HtmlTextComponentType.H4]: BASE_FONT_SIZE,
    [HtmlTextComponentType.H5]: BASE_FONT_SIZE * 0.83,
    [HtmlTextComponentType.H6]: BASE_FONT_SIZE * 0.67,
    [HtmlTextComponentType.P]: BASE_FONT_SIZE
  };
}

export default HtmlComponentsUtils;
