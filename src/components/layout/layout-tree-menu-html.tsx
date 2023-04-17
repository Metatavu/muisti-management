import { FC } from "react";
import { TreeView } from "@mui/lab";
import StyledTreeItem from "../../styles/components/layout-screen/styled-tree-item";
import { ComponentType, TreeObject } from "../../types";
import { PageLayout } from "../../generated/client";

/**
 * Components properties
 */
interface Props {
  htmlString: string;
  addHtmlComponent: (layout: PageLayout) => void;
  onAddComponentClick: () => void;
}

/**
 * Layout Tree Menu HTML Component
 */
const LayoutTreeMenuHtml: FC<Props> = ({
  htmlString,
  onAddComponentClick
}) => {
  const dom = new DOMParser().parseFromString(htmlString, "text/html").body;
  const domChildrenArray = Array.from(dom.children);

  /**
   * Creates Tree Object from HTML Element
   *
   * @param element element
   * @returns TreeObject
   */
  const createTreeObject = (element: Element): TreeObject | undefined => {
    const componentType = element.attributes.getNamedItem("data-component-type")?.nodeValue;
    const id = element.id ?? "";

    if (!componentType) return;

    if (!Object.values(ComponentType).includes(componentType as ComponentType)) return;

    const children: TreeObject[] = [];

    for (const child of element.children) {
      const treeObject = createTreeObject(child);

      if (treeObject) children.push(treeObject);
    }

    return {
      type: componentType as ComponentType,
      id: id,
      children: children
    }
  };

  /**
   * Renders Tree Item
   *
   * @param item item
   * @param isRoot is root element
   */
  const renderTreeItem = (item?: TreeObject, isRoot?: boolean, isRootSubDirectory?: boolean) => {
    if (!item) return;
    const hasChildren = !!item.children.length;

    return (
      <StyledTreeItem
        key={ item.id }
        nodeId={ item.id }
        labelText={ item.type }
        isLayoutComponent={ item.type === ComponentType.LAYOUT }
        isRoot={ isRoot }
        isRootSubdirectory={ isRootSubDirectory }
        hasChildren={ hasChildren }
        onAddComponentClick={ onAddComponentClick }
      >
        { item.children.map((child, i) => {
            const isRootSubDirectory = i === 0;
            return renderTreeItem(child, false, isRootSubDirectory)
          })
        }
      </StyledTreeItem>
    );
  };

  return (
    <TreeView>
      { Array.isArray(domChildrenArray) &&
        domChildrenArray.map(domElement => {
          const item = createTreeObject(domElement);
          return renderTreeItem(item, true);
        })
      }
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;