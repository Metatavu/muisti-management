import { PageLayout, PageLayoutView, PageLayoutViewProperty, PageLayoutViewPropertyType } from "../../../generated/client";
import { LayoutPaddingPropKeys, LayoutMarginPropKeys } from "../editor-constants/keys";
import { PageLayoutElementType } from "../../../types";

/**
 * Delete item from tree structure while keeping rest of there data
 * @param pageLayout exhibition page layout
 * @param layoutViewPath path of the item to be deleted inside the tree
 * @returns updated page layout
 */
export const constructTreeDeleteData = (pageLayout: PageLayout, layoutViewPath: string): PageLayout => {
  if (pageLayout.data.id === layoutViewPath) {
    pageLayout.data = { ...pageLayout.data, children: [] };
  } else {
    pageLayout.data.children = deleteViewFromLayoutTree(pageLayout.data.children, layoutViewPath, pageLayout.data.id);
  }
  return pageLayout;
}

/**
 * Recursive function that checks the PageLayoutView objects child objects and tries to find the item to be deleted.
 * @param treeData list of page layout views
 * @param layoutViewPath path to the item to be deleted from tree
 * @param currentPath current path inside the recursion
 * @returns list of page layout views
 */
const deleteViewFromLayoutTree = (treeData: PageLayoutView[], layoutViewPath: string, currentPath: string): PageLayoutView[] => {
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
 * @param pageLayout exhibition page layout
 * @param pageLayoutView updated page layout view
 * @param layoutViewPath path of the item to be updated inside the tree
 * @returns updated page layout
 */
export const constructTreeUpdateData = (pageLayout: PageLayout, pageLayoutView: PageLayoutView, layoutViewPath: string): PageLayout => {
  if (pageLayout.data.id === layoutViewPath) {
    pageLayout.data = pageLayoutView;
  } else {
    pageLayout.data.children = updateViewFromLayoutTree(pageLayout.data.children, layoutViewPath, pageLayout.data.id, pageLayoutView);
  }
  return pageLayout;
};

/**
 * Recursive function that checks the PageLayoutView objects child objects and tries to find the item to be updated.
 * @param treeData list of page layout views
 * @param layoutViewPath path to the item to be updated from tree
 * @param currentPath current path inside the recursion
 * @param pageLayoutView updated page layout view
 * @returns list of page layout views
 */
// eslint-disable-next-line max-len
const updateViewFromLayoutTree = (treeData: PageLayoutView[], layoutViewPath: string, currentPath: string, pageLayoutView: PageLayoutView): PageLayoutView[] => {
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
      child.children = updateViewFromLayoutTree(child.children, layoutViewPath, updatedPath, pageLayoutView);
    }
  }
  return treeData;
};

/**
 * Adds new item to tree structure while keeping rest of there data
 * @param pageLayout exhibition page layout
 * @param pageLayoutView new page layout view
 * @param layoutViewPath path of the parent item where the new child item will be added inside the tree
 * @returns updated page layout
 */
export const pushNewPageLayoutViewToTree = (pageLayout: PageLayout, pageLayoutView: PageLayoutView, layoutViewPath: string): PageLayout => {
  if (pageLayout.data.id === layoutViewPath) {
    pageLayout.data.children.push(pageLayoutView);
  } else {
    pageLayout.data.children = pushNewViewToLayoutTree(pageLayout.data.children, layoutViewPath, pageLayout.data.id, pageLayoutView);
  }
  return pageLayout;
};

/**
 * Recursive function that checks the PageLayoutView objects child objects and tries to find the parent item where the new child item
 * will be added.
 * @param treeData list of page layout views
 * @param layoutViewPath path of the parent item where the new child item will be added inside the tree
 * @param currentPath current path inside the recursion
 * @param pageLayoutView new page layout view
 * @returns list of page layout views
 */
// eslint-disable-next-line max-len
const pushNewViewToLayoutTree = (treeData: PageLayoutView[], layoutViewPath: string, currentPath: string, pageLayoutView: PageLayoutView): PageLayoutView[] => {
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
      child.children = pushNewViewToLayoutTree(child.children, layoutViewPath, updatedPath, pageLayoutView);
    }
  }
  return treeData;
};


/**
 * Update layout view with property
 * @param updatedPageLayoutViewProperty updated layout view property
 * @param layoutViewToUpdate layout view to update
 * @returns updated page layout view
 */
export const updateLayoutView = (updatedPageLayoutViewProperty: PageLayoutViewProperty, layoutViewToUpdate: PageLayoutView): PageLayoutView => {
  const name = updatedPageLayoutViewProperty.name;
  const value = updatedPageLayoutViewProperty.value;
  const type = updatedPageLayoutViewProperty.type;

  const foundIndex = layoutViewToUpdate.properties.findIndex(data => data.name === name);
  if (foundIndex < 0) {
    const propertyToCreate: PageLayoutViewProperty = {
      name: name,
      value: value,
      type: type
    };
    layoutViewToUpdate.properties.push(propertyToCreate);
  }
  else {
    const propToUpdate = { ...layoutViewToUpdate.properties[foundIndex] };
    propToUpdate.value = value;
    layoutViewToUpdate.properties.splice(foundIndex, 1, propToUpdate);
  }
  return layoutViewToUpdate;
};

/**
 * Find property from given page layout view with given key
 * @param pageLayoutView page layout view to search from
 * @param key property to find
 * @param type page layout view property type
 * @returns Found property or new property to be modified
 */
export const getProperty = (pageLayoutView: PageLayoutView, key: string, type: PageLayoutViewPropertyType): PageLayoutViewProperty => {
  const layoutProps = pageLayoutView.properties;
  const foundIndex = layoutProps.findIndex(prop => prop.name === key);
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
 * @param pageLayoutView page layout view to search from
 * @param enumObject enum object that is used to find/generate property
 * @returns list of page layout view properties
 */
// eslint-disable-next-line max-len
export const getPaddingOrMarginProperties = (pageLayoutView: PageLayoutView, enumObject: typeof LayoutPaddingPropKeys | typeof LayoutMarginPropKeys): PageLayoutViewProperty[] => {
  const propertyList: PageLayoutViewProperty[] = [];
  const values = Object.values(enumObject);

  values.forEach(valueKey => {
    const foundProp = pageLayoutView.properties.find(prop => prop.name === valueKey);
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
 * TODO: These things should be defined in the spec.
 * Get correct widget type
 * @param widget type to find
 */
export const getWidgetType = (widget: string): string => {
  switch (widget) {
    case "TextView":
      return PageLayoutElementType.TEXTVIEW;
    case "FlowTextView":
      return PageLayoutElementType.FLOWTEXTVIEW;
    case "ImageView":
      return PageLayoutElementType.IMAGEVIEW;
    case "MediaView":
        return PageLayoutElementType.IMAGEVIEW;
    case "Button":
      return PageLayoutElementType.BUTTON;
    case "LinearLayout":
      return PageLayoutElementType.LINEARLAYOUT;
    default:
      return "";
  }
};