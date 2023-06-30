import {
  PageLayout,
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType,
  PageLayoutWidgetType,
  SubLayout
} from "../../../generated/client";
import {
  LayoutMarginPropKeys,
  LayoutPaddingPropKeys,
  LayoutPropKeys
} from "../editor-constants/keys";
import { v4 as uuid } from "uuid";

/**
 * Delete item from tree structure while keeping rest of there data
 *
 * @param pageLayout exhibition page layout
 * @param layoutViewPath path of the item to be deleted inside the tree
 * @returns updated page layout
 */
export const constructTreeDeleteData = (
  pageLayout: PageLayout | SubLayout,
  layoutViewPath: string
): PageLayout | SubLayout => {
  if (pageLayout.data.id === layoutViewPath) {
    pageLayout.data = { ...pageLayout.data, children: [] };
  } else {
    pageLayout.data.children = deleteViewFromLayoutTree(
      pageLayout.data.children,
      layoutViewPath,
      pageLayout.data.id
    );
  }
  return pageLayout;
};

/**
 * Recursive function that checks the PageLayoutView objects child objects and tries to find the item to be deleted.
 *
 * @param treeData list of page layout views
 * @param layoutViewPath path to the item to be deleted from tree
 * @param currentPath current path inside the recursion
 * @returns list of page layout views
 */
const deleteViewFromLayoutTree = (
  treeData: PageLayoutView[],
  layoutViewPath: string,
  currentPath: string
): PageLayoutView[] => {
  const cleanNodes: PageLayoutView[] = [];
  let found = false;

  for (let i = 0; i < treeData.length; i++) {
    const node: PageLayoutView = treeData[i];
    const fullPath = `${currentPath}/${node.id}`;
    if (fullPath !== layoutViewPath) {
      cleanNodes.push(node);
    } else {
      found = true;
    }
  }

  if (found) {
    return cleanNodes;
  } else {
    for (let i = 0; i < treeData.length; i++) {
      const child = treeData[i];
      const updatedPath = `${currentPath}/${child.id}`;
      child.children = deleteViewFromLayoutTree(child.children, layoutViewPath, updatedPath);
    }
  }
  return treeData;
};

/**
 * Update item from tree structure while keeping rest of there data
 *
 * @param layout layout
 * @param pageLayoutView updated page layout view
 * @param layoutViewPath path of the item to be updated inside the tree
 * @returns updated page layout
 */
export const constructTreeUpdateData = (
  layout: PageLayout | SubLayout,
  pageLayoutView: PageLayoutView,
  layoutViewPath: string
): PageLayout | SubLayout => {
  if (layout.data.id === layoutViewPath) {
    layout.data = pageLayoutView;
  } else {
    layout.data.children = updateViewFromLayoutTree(
      layout.data.children,
      layoutViewPath,
      layout.data.id,
      pageLayoutView
    );
  }
  return layout;
};

/**
 * Recursive function that checks the PageLayoutView objects child objects and tries to find the item to be updated.
 *
 * @param treeData list of page layout views
 * @param layoutViewPath path to the item to be updated from tree
 * @param currentPath current path inside the recursion
 * @param pageLayoutView updated page layout view
 * @returns list of page layout views
 */
// eslint-disable-next-line max-len
const updateViewFromLayoutTree = (
  treeData: PageLayoutView[],
  layoutViewPath: string,
  currentPath: string,
  pageLayoutView: PageLayoutView
): PageLayoutView[] => {
  const cleanNodes: PageLayoutView[] = [];
  let found = false;
  for (let i = 0; i < treeData.length; i++) {
    const node: PageLayoutView = treeData[i];
    const fullPath = `${currentPath}/${node.id}`;
    if (fullPath !== layoutViewPath) {
      cleanNodes.push(node);
    } else {
      cleanNodes.push(pageLayoutView);
      found = true;
    }
  }

  if (found) {
    return cleanNodes;
  } else {
    for (let i = 0; i < treeData.length; i++) {
      const child = treeData[i];
      const updatedPath = `${currentPath}/${child.id}`;
      child.children = updateViewFromLayoutTree(
        child.children,
        layoutViewPath,
        updatedPath,
        pageLayoutView
      );
    }
  }
  return treeData;
};

/**
 * Adds new item to tree structure while keeping rest of there data
 *
 * @param pageLayout exhibition page layout
 * @param pageLayoutView new page layout view
 * @param layoutViewPath path of the parent item where the new child item will be added inside the tree
 * @returns updated page layout
 */
export const pushNewPageLayoutViewToTree = (
  pageLayout: PageLayout | SubLayout,
  pageLayoutView: PageLayoutView,
  layoutViewPath: string
): PageLayout | SubLayout => {
  if (pageLayout.data.id === layoutViewPath) {
    pageLayout.data.children.push(pageLayoutView);
  } else {
    pageLayout.data.children = pushNewViewToLayoutTree(
      pageLayout.data.children,
      layoutViewPath,
      pageLayout.data.id,
      pageLayoutView
    );
  }
  return pageLayout;
};

/**
 * Recursive function that checks the PageLayoutView objects child objects and tries to find the parent item where the new child item
 * will be added.
 *
 * @param treeData list of page layout views
 * @param layoutViewPath path of the parent item where the new child item will be added inside the tree
 * @param currentPath current path inside the recursion
 * @param pageLayoutView new page layout view
 * @returns list of page layout views
 */
// eslint-disable-next-line max-len
const pushNewViewToLayoutTree = (
  treeData: PageLayoutView[],
  layoutViewPath: string,
  currentPath: string,
  pageLayoutView: PageLayoutView
): PageLayoutView[] => {
  const cleanNodes: PageLayoutView[] = [];
  let found = false;
  for (let i = 0; i < treeData.length; i++) {
    const node: PageLayoutView = treeData[i];
    const fullPath = `${currentPath}/${node.id}`;
    if (fullPath !== layoutViewPath) {
      cleanNodes.push(node);
    } else {
      node.children.push(pageLayoutView);
      cleanNodes.push(node);
      found = true;
    }
  }

  if (found) {
    return cleanNodes;
  } else {
    for (let i = 0; i < treeData.length; i++) {
      const child = treeData[i];
      const updatedPath = `${currentPath}/${child.id}`;
      child.children = pushNewViewToLayoutTree(
        child.children,
        layoutViewPath,
        updatedPath,
        pageLayoutView
      );
    }
  }
  return treeData;
};

/**
 * Update layout view with property
 *
 * @param updatedPageLayoutViewProperty updated layout view property
 * @param layoutViewToUpdate layout view to update
 * @returns updated page layout view
 */
export const updateLayoutViewProperty = (
  updatedPageLayoutViewProperty: PageLayoutViewProperty,
  layoutViewToUpdate: PageLayoutView
): PageLayoutView => {
  const name = updatedPageLayoutViewProperty.name;
  const value = updatedPageLayoutViewProperty.value;
  const type = updatedPageLayoutViewProperty.type;

  const valueNotEmpty = value !== undefined && value !== "";
  const foundIndex = layoutViewToUpdate.properties.findIndex((data) => data.name === name);
  if (foundIndex < 0 && valueNotEmpty) {
    const propertyToCreate: PageLayoutViewProperty = {
      name: name,
      value: value,
      type: type
    };
    layoutViewToUpdate.properties.push(propertyToCreate);
  } else {
    const propToUpdate = { ...layoutViewToUpdate.properties[foundIndex] };
    if (valueNotEmpty) {
      propToUpdate.value = value;
      layoutViewToUpdate.properties.splice(foundIndex, 1, propToUpdate);
    } else {
      layoutViewToUpdate.properties.splice(foundIndex, 1);
    }
  }
  return layoutViewToUpdate;
};

/**
 * Remove property from layout view
 *
 * @param layoutPropertyToRemove layout view property to remove
 * @param layoutViewToUpdate layout vie to update
 * @returns page layout view without removed property
 */
export const removeLayoutViewProperty = (
  layoutPropertyToRemove: LayoutPropKeys,
  layoutViewToUpdate: PageLayoutView
): PageLayoutView => {
  const foundIndex = layoutViewToUpdate.properties.findIndex(
    (data) => data.name === layoutPropertyToRemove
  );
  if (foundIndex < 0) {
    return layoutViewToUpdate;
  }

  layoutViewToUpdate.properties.splice(foundIndex, 1);
  return layoutViewToUpdate;
};

/**
 * Checks if page layout view has property with given key and type
 *
 * @param pageLayoutView page layout vie
 * @param key property key
 * @param type property type
 */
export const hasProperty = (
  pageLayoutView: PageLayoutView,
  key: string,
  type: PageLayoutViewPropertyType
): boolean => {
  return !!pageLayoutView.properties.find(
    (property) => property.name === key && property.type === type
  );
};

/**
 * Find property from given page layout view with given key
 *
 * @param pageLayoutView page layout view to search from
 * @param key property to find
 * @param type page layout view property type
 * @returns Found property or new property to be modified
 */
// tslint:disable-next-line: max-line-length
export const getProperty = (
  pageLayoutView: PageLayoutView,
  key: string,
  type: PageLayoutViewPropertyType
): PageLayoutViewProperty => {
  const layoutProps = pageLayoutView.properties;
  const foundIndex = layoutProps.findIndex((prop) => prop.name === key);
  if (foundIndex < 0) {
    const createdSingleProperty: PageLayoutViewProperty = {
      name: key,
      value: "",
      type: type
    };
    return createdSingleProperty;
  }
  return layoutProps[foundIndex];
};

/**
 * Get padding and margin properties from given page layout view
 *
 * @param pageLayoutView page layout view to search from
 * @param enumObject enum object that is used to find/generate property
 * @returns list of page layout view properties
 */
// eslint-disable-next-line max-len
export const getPaddingOrMarginProperties = (
  pageLayoutView: PageLayoutView,
  enumObject: typeof LayoutPaddingPropKeys | typeof LayoutMarginPropKeys
): PageLayoutViewProperty[] => {
  const propertyList: PageLayoutViewProperty[] = [];
  const values = Object.values(enumObject);

  values.forEach((valueKey) => {
    const foundProp = pageLayoutView.properties.find((prop) => prop.name === valueKey);
    if (foundProp) {
      propertyList.push(foundProp);
    } else {
      const newProp: PageLayoutViewProperty = {
        name: valueKey,
        type: PageLayoutViewPropertyType.String,
        value: "0dp"
      };
      propertyList.push(newProp);
    }
  });

  return propertyList;
};

/**
 * Get initialized page layout view based on page layout widget type.
 *
 * This is needed for automatic resource ID generation. If widget type will
 * include some resources we will automatically generate unique ID in order to
 * prevent users from typing non-unique ID's. This would break content editors
 * ability to update correct page resource.
 *
 * If widget type doesn't include any resources we return new page layout view without
 * any properties.
 *
 * @param widget widget type
 * @returns initialized page layout view
 */
export const getInitializedPageLayoutViewByWidgetType = (
  widget: PageLayoutWidgetType
): PageLayoutView => {
  const layoutView: PageLayoutView = {
    id: uuid(),
    widget: widget,
    properties: [],
    children: []
  };

  switch (widget) {
    case PageLayoutWidgetType.Button:
      fillButtonProperties(layoutView);
      break;
    case PageLayoutWidgetType.FlowTextView:
    case PageLayoutWidgetType.TextView:
      fillTextProperties(layoutView);
      break;
    case PageLayoutWidgetType.ImageView:
    case PageLayoutWidgetType.PlayerView:
    case PageLayoutWidgetType.MediaView:
      fillMediaProperties(layoutView);
      break;
    case PageLayoutWidgetType.MaterialTabLayout:
      fillTabProperties(layoutView);
      break;
    default:
      break;
  }

  return layoutView;
};

/**
 * Fill Button specific resource properties
 *
 * @param layoutView layout view
 * @returns layout view with resource properties
 */
const fillButtonProperties = (layoutView: PageLayoutView): PageLayoutView => {
  const text: PageLayoutViewProperty = {
    name: "text",
    type: PageLayoutViewPropertyType.String,
    value: `@resources/${uuid()}`
  };

  layoutView.properties.push(text);
  return layoutView;
};

/**
 * Fill TextView and FlowTextView specific resource properties
 *
 * @param layoutView layout view
 * @returns layout view with resource properties
 */
const fillTextProperties = (layoutView: PageLayoutView): PageLayoutView => {
  const text: PageLayoutViewProperty = {
    name: "text",
    type: PageLayoutViewPropertyType.String,
    value: `@resources/${uuid()}`
  };

  layoutView.properties.push(text);
  return layoutView;
};

/**
 * Fill ImagePlayer, PlayerView and MediaView specific resource properties
 *
 * @param layoutView layout view
 * @returns layout view with resource properties
 */
const fillMediaProperties = (layoutView: PageLayoutView): PageLayoutView => {
  const src: PageLayoutViewProperty = {
    name: "src",
    type: PageLayoutViewPropertyType.String,
    value: `@resources/${uuid()}`
  };

  layoutView.properties.push(src);
  return layoutView;
};

/**
 * Fill TabLayout specific resources
 *
 * @param layoutView layout view
 * @returns layout view with resource properties
 */
const fillTabProperties = (layoutView: PageLayoutView): PageLayoutView => {
  const src: PageLayoutViewProperty = {
    name: "data",
    type: PageLayoutViewPropertyType.String,
    value: `@resources/${uuid()}`
  };

  layoutView.properties.push(src);
  return layoutView;
};
