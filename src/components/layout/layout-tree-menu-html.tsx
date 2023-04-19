import { useState } from "react";
import { AddBoxOutlined } from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { Button, Fade, Stack } from "@mui/material";
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
  const [ hover, setHover ] = useState<string>("");
  
  /**
   * Renders Add New Element button
   */
    const renderAddNewElementButton = (item: TreeObject, hover: string) => {
      return (
        <Fade in={ hover === item.id } timeout={ 500 }>
          <Stack direction={ item.children.length > 0 ? "row" : "row-reverse" } alignItems="center" key={ `${item.id}-btn` }>
            <Button
              variant="text"
              sx={{
                textTransform: "uppercase",
                fontWeight: 400,
                fontSize: "0.65rem",
                color: "#2196F3"
              }}
              startIcon={ <AddBoxOutlined style={{ color: "#2196F3" }}/> }
              onClick={ () => onAddComponentClick(item.path) }
            >
              { strings.layoutEditor.addLayoutViewDialog.title }
            </Button>
          </Stack>
        </Fade>
      )
    };
    
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
        onMouseLeave={ () => setHover("") }
      >
        <StyledTreeItem
          renderAddNewElementButton={ renderAddNewElementButton }
          nodeId={ item.id }
          item={ item }
          hover={ hover }
          itemType={ item.type }
          itemName={ item.name || strings.generic.name }
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