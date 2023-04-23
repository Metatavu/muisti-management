import { TreeObject, HtmlComponentType } from "../../../types";

/**
 * Update item within tree structure
 *
 * @param treeData list of TreeObject
 * @param updatedComponent updated TreeObject
 * @param destinationPath path of the element to be updated within tree
 * @returns updatedTree list of TreeObjects
 */
export const updateHtmlComponent = (treeData: TreeObject[], updatedComponent: TreeObject, destinationPath: string): TreeObject[] => {
  const updatedTree: TreeObject[] = [treeData[0]];
  if (treeData[0].id === destinationPath) {
    updatedTree[0] = updatedComponent;
  } else {
    updatedTree[0].children = updateInTree(updatedTree[0].children, destinationPath, treeData[0].id, updatedComponent);
  }

  return updatedTree;
};

/**
 * Recursive function that checks the updatedComponent children and to find item to be updated.
 *
 * @param treeData list of TreeObject
 * @param destinationPath path to the item to be updated within tree
 * @param currentPath current path inside the recursion
 * @param updatedComponent updated TreeObject
 * @returns list of TreeObjects
 */
const updateInTree = (treeData: TreeObject[], destinationPath: string, currentPath: string, updatedComponent: TreeObject): TreeObject[] => {
  const cleanNodes: TreeObject[] = [];
  let found = false;
  for (const element of treeData) {
    const node = element;
    const fullPath = `${currentPath}/${node.id}`;
    if (fullPath !== destinationPath) {
      cleanNodes.push(node);
    } else {
      cleanNodes.push(updatedComponent);
      found = true;
    }
  }

  if (found) {
    return cleanNodes;
  } else {
    for (const element of treeData) {
      const child = element;
      const updatedPath = `${currentPath}/${child.id}`;
      child.children = updateInTree(child.children ?? [], destinationPath, updatedPath, updatedComponent);
    }
  }

  return treeData;
};

/**
 * Convert tree object to html element
 *
 * @param treeObject
 * @returns HTMLElement
 */
export const treeObjectToHtmlElement = (treeObject: TreeObject): HTMLElement => {
  const element = treeObject.element;
  element.replaceChildren();
  if (treeObject.children) {
    for (let i = 0; i < treeObject.children.length; i++) {
      element.appendChild(treeObjectToHtmlElement(treeObject.children[i]));
    }
  }

  return element;
};

/**
 * Adds new HTML component to tree
 * 
 * @param treeData tree data
 * @param newComponent new component to be added
 * @param targetPath path of the sibling component
 * @param asChildren whether to add as children or sibling
 * @returns updated tree data
 */
export const addNewHtmlComponent = (treeData: TreeObject[], newComponent: TreeObject, targetPath: string, asChildren: boolean) => {
  const updatedTree: TreeObject[] = [treeData[0]];
  if (treeData[0].id === targetPath) {
    updatedTree[0].children.push(newComponent);
  } else {
    updatedTree[0].children = pushToTree(updatedTree[0].children, newComponent, treeData[0].id, targetPath, asChildren);
  }
  
  return updatedTree;
};

/**
 * Pushes new HTML Component to tree
 * 
 * @param treeData tree data
 * @param newComponent new component to be added
 * @param currentPath current path
 * @param targetPath path of the sibling component
 * @param asChildren whether to add as children or sibling
 * @returns updated tree data
 */
const pushToTree = (treeData: TreeObject[], newComponent: TreeObject, currentPath: string, targetPath: string, asChildren: boolean): TreeObject[] => {
  const cleanNodes: TreeObject[] = [];
  let found = false;
  for (const element of treeData) {
    const node = element;
    const fullPath = `${currentPath}/${node.id}`;
    cleanNodes.push(node);
    if (fullPath === targetPath) {
      if (asChildren) {
        node.children.push(newComponent);
      } else {
        cleanNodes.push(newComponent);
      }
      found = true;
    }
  }
  
  if (found) {
    return cleanNodes;
  } else {
    for (const element of treeData) {
      const child = element;
      const updatedPath = `${currentPath}/${child.id}`;
      child.children = pushToTree(child.children ?? [], newComponent, updatedPath, targetPath, asChildren);
    }
  }
  
  return treeData;
};

/**
 * Deserializes HTML element from string
 * 
 * @param element serialized element
 * @returns deserialized element
 */
export const deserializeElement = (element: string): HTMLElement => (
  new DOMParser().parseFromString(element, "text/html").body.firstChild as HTMLElement
);

/**
 * Constructs an array of tree objects from given html
 *
 * @param html html
 * @returns Array of Tree Objects
 */
export const constructTree = (html: string) => {
  const dom = new DOMParser().parseFromString(html, "text/html").body;
  const domArray = Array.from(dom.children);

  return domArray.map(element => createTreeObject(element) as TreeObject);
};

/**
 * Creates Tree Object from HTML Element
 *
 * @param element element
 * @param basePath base path
 * @returns TreeObject
 */
export const createTreeObject = (element: Element, basePath?: string): TreeObject | undefined => {
  const componentType = element.attributes.getNamedItem("data-component-type")?.nodeValue;

  const id = element.id ?? "";

  if (!componentType) return;

  if (!Object.values(HtmlComponentType).includes(componentType as HtmlComponentType)) return;

  const children: TreeObject[] = [];

  const path = basePath ? `${basePath}/${id}` : id;

  for (const child of element.children) {
    const treeObject = createTreeObject(child, path);

    if (treeObject) children.push(treeObject);
  }

  return {
    type: componentType as HtmlComponentType,
    path: path,
    name: element.attributes.getNamedItem("name")?.nodeValue ?? "",
    id: id,
    children: children,
    element: element as HTMLElement
  }
};