import { HtmlComponentType } from "../types";
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
        "align-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "align-content": "flex-start",
        "justify-items": "flex-start",
        "align-items": "flex-start"
      }
    },
    n: {
      row: {
        "justify-content": "center",
        "align-content": "flex-start",
        "justify-items": "center",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "align-content": "center",
        "justify-items": "flex-start",
        "align-items": "center"
      }
    },
    ne: {
      row: {
        "justify-content": "flex-end",
        "align-content": "flex-start",
        "justify-items": "flex-end",
        "align-items": "flex-start"
      },
      column: {
        "justify-content": "flex-start",
        "align-content": "flex-end",
        "justify-items": "flex-start",
        "align-items": "flex-end"
      }
    },
    w: {
      row: {
        "justify-content": "flex-start",
        "align-content": "center",
        "justify-items": "flex-start",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "align-content": "flex-start",
        "justify-items": "center",
        "align-items": "flex-start"
      }
    },
    c: {
      row: {
        "justify-content": "center",
        "align-content": "center",
        "justify-items": "center",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "align-content": "center",
        "justify-items": "center",
        "align-items": "center"
      }
    },
    e: {
      row: {
        "justify-content": "flex-end",
        "align-content": "center",
        "justify-items": "flex-end",
        "align-items": "center"
      },
      column: {
        "justify-content": "center",
        "align-content": "flex-end",
        "justify-items": "center",
        "align-items": "flex-end"
      }
    },
    sw: {
      row: {
        "justify-content": "flex-start",
        "align-content": "flex-end",
        "justify-items": "flex-start",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "align-content": "flex-start",
        "justify-items": "flex-end",
        "align-items": "flex-start"
      }
    },
    s: {
      row: {
        "justify-content": "center",
        "align-content": "flex-end",
        "justify-items": "center",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "align-content": "center",
        "justify-items": "flex-end",
        "align-items": "center"
      }
    },
    se: {
      row: {
        "justify-content": "flex-end",
        "align-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-end"
      },
      column: {
        "justify-content": "flex-end",
        "align-content": "flex-end",
        "justify-items": "flex-end",
        "align-items": "flex-end"
      }
    }
  };
}

export default HtmlComponentsUtils;
