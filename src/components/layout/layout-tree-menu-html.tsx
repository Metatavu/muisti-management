import { FC, useState } from "react";
import { TreeView } from "@mui/lab";
import StyledTreeItem from "../../styles/components/layout-screen/styled-tree-item";
import { ComponentType, TreeObject } from "../../types";
import { PageLayout } from "../../generated/client";
import { AddBoxOutlined } from "@mui/icons-material";
import { Button, Stack, Typography } from "@mui/material";
import strings from "../../localization/strings";

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
  const [ hover, setHover ] = useState<string>();
  
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
   * Renders Add New Element button
   */
    const renderAddNewElementButton = (id: string) => {
      console.log(id);
  
      return (
        <Stack direction="row" alignItems="center" key={ id + "btn" }>
          <Button
            variant="text"
            sx={{
              textTransform: "uppercase",
              fontWeight: 400,
              fontSize: "0.75rem",
              color: "#2196F3"
            }}
            startIcon={ <AddBoxOutlined style={{ color: "#2196F3" }}/> }
            onClick={ () => onAddComponentClick() }
          >
            { strings.layoutEditor.addLayoutViewDialog.title }
          </Button>
        </Stack>
      );
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
    const isLayoutComponent = item.type === ComponentType.LAYOUT;

    return (
      <Stack
        onMouseEnter={ () => setHover(item.id) }
        onMouseLeave={ () => setHover(undefined) }
      >
        <StyledTreeItem
          key={ item.id }
          nodeId={ item.id }
          labelText={ item.type }
          isLayoutComponent={ isLayoutComponent }
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
        { (isLayoutComponent && hover === item.id) && renderAddNewElementButton(item.id) }
      </Stack>
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