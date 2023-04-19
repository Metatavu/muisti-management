import { useState } from "react";
import { AddBoxOutlined } from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { Button, Stack } from "@mui/material";
import { StyledTreeItem } from "../../styles/components/layout-screen/styled-tree-item";
import { HtmlComponentType, TreeObject } from "../../types";
import strings from "../../localization/strings";
import { PageLayout } from "../../generated/client";

/**
 * Components properties
 */
interface Props {
  treeObjects: TreeObject[];
  selectedPath?: string;
  onTreeComponentSelect: (selectedComponent?: TreeObject) => void;
  addHtmlComponent: (layout: PageLayout) => void;
  onAddComponentClick: (path: string) => void;
}

/**
 * Layout Tree Menu HTML Component
 */
const LayoutTreeMenuHtml = ({
  treeObjects,
  selectedPath,
  onTreeComponentSelect,
  onAddComponentClick
}: Props) => {
  const [ hover, setHover ] = useState<string>();
  
  /**
   * Renders Add New Element button
   */
    const renderAddNewElementButton = (item: TreeObject) => (
      <Stack direction="row" alignItems="center" key={ item.id + "btn" }>
        <Button
          variant="text"
          sx={{
            textTransform: "uppercase",
            fontWeight: 400,
            fontSize: "0.75rem",
            color: "#2196F3"
          }}
          startIcon={ <AddBoxOutlined style={{ color: "#2196F3" }}/> }
          onClick={ () => onAddComponentClick(item.path) }
        >
          { strings.layoutEditor.addLayoutViewDialog.title }
        </Button>
      </Stack>
    );
    
  /**
   * Renders Tree Item
   *
   * @param item item
   * @param isRoot is root element
   * @param isRootSubDirectory is root element of sub-directory in tree
   */
  const renderTreeItem = (item?: TreeObject, isRoot?: boolean, isRootSubdirectory?: boolean) => {
    if (!item) return;
    
    const hasChildren = !!item.children?.length;
    const isLayoutComponent = item.type === HtmlComponentType.LAYOUT;

    return (
      <Stack
        key={ item.id }
        onMouseEnter={ () => setHover(item.id) }
        onMouseLeave={ () => setHover(undefined) }
      >
        <StyledTreeItem
          nodeId={ item.id }
          itemType={ item.type }
          itemName={ item.name || "Nimetön" }
          isLayoutComponent={ isLayoutComponent }
          isRoot={ isRoot }
          isRootSubdirectory={ isRootSubdirectory }
          hasChildren={ hasChildren }
          onClick={ () => onTreeComponentSelect(item) }
        >
          { (item.children ?? []).map((child, i) => {
              const isRootSubDirectory = i === 0;
              return renderTreeItem(child, false , isRootSubDirectory)
            })
          }
        </StyledTreeItem>
          { (isLayoutComponent && hover === item.id) && renderAddNewElementButton(item) }
      </Stack>
    );
  };

  /**
   * Gets parent ids, based on selected path.
   * This is being used to expand the tree view automatically after adding a new element.
   * In case of the root element we return the path as is.
   * 
   * @param path path
   * @retuns IDs of parent elements
   */
  const getParentIds = (path?: string) => {
    const slashes = path?.match(/\//g)?.length ?? 0;
    
    if (!slashes) {
      return [ path ];
    }
    
    let parentIds: string[] = [];
    for (let i = 0; i < slashes; i++) {
      if (path?.split("/")[i]) {
        parentIds.push(path?.split("/")[i]); 
      }
    }
    
    return parentIds;
  };

  return (
    <TreeView
      expanded={ getParentIds(selectedPath) }
      onBlur={ () => onTreeComponentSelect(undefined) }
    >
      { treeObjects.map(item => renderTreeItem(item, true)) }
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;