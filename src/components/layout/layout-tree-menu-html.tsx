import { AddBoxOutlined } from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { Stack, Typography } from "@mui/material";
import StyledTreeItem from "../../styles/components/layout-screen/styled-tree-item";
import { ComponentType, TreeObject } from "../../types";

/**
 * Components properties
 */
interface Props {
  htmlString: string;
}

/**
 * Layout Tree Menu HTML Component
 */
const LayoutTreeMenuHtml: React.FC<Props> = ({
  htmlString
}) => {
  const dom = new DOMParser().parseFromString(htmlString, "text/html").body;
  const domArray = Array.from(dom.children);

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
  const renderTreeItem = (item?: TreeObject, isRoot?: boolean) => {
    if (!item) return;
    const hasChildren = !!item.children.length;

    return (
      <StyledTreeItem
        key={ item.id }
        nodeId={ item?.id ?? "" }
        labelText={ item.type }
        isLayoutComponent={ item.type === ComponentType.LAYOUT }
        isRoot={ isRoot }
        hasChildren={ hasChildren }
      >
        { item.children.map((x, i) => renderTreeItem(x, undefined)) }
        { item.type === ComponentType.LAYOUT &&
            <Stack direction="row" alignItems="center">
              <AddBoxOutlined/>
              <Typography variant="caption" textTransform="uppercase">Lisää elementti</Typography>
            </Stack>
        }
      </StyledTreeItem>
    );
  };

  return (
    <TreeView>
      { Array.isArray(domArray) &&
        domArray.map((x, i) => {
          const item = createTreeObject(x);
          return renderTreeItem(item, true);
        })
      }
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;