import { v4 as uuid } from "uuid";
export const HTML_LAYOUT_ROOT = () => `<div id="${uuid()}" data-component-type="layout" style="display: flex; flex-direction: row;"></div>`