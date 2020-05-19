import { PageLayout, PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";

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
 * Update layout view with property
 * @param updatedPageLayoutViewProperty updated layout view property
 * @param layoutViewToUpdate layout view to update
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