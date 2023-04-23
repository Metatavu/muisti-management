import { AddBoxOutlined } from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { Button, Stack } from "@mui/material";
import { StyledTreeItem } from "../../styles/components/layout-screen/styled-tree-item";
import { HtmlComponentType, TreeObject } from "../../types";
import strings from "../../localization/strings";

/**
 * Components properties
 */
interface Props {
  treeObjects: TreeObject[];
  selectedComponent?: TreeObject;
  onTreeComponentSelect: (selectedComponent: TreeObject) => void;
  onAddComponentClick: (path: string, asChildren: boolean) => void;
}

/**
 * Layout Tree Menu HTML Component
 */
const LayoutTreeMenuHtml = ({
  treeObjects,
  selectedComponent,
  onTreeComponentSelect,
  onAddComponentClick
}: Props) => {
  
  /**
   * Renders Add New Element button
   */
    const renderAddNewElementButton = (item: TreeObject, asChildren: boolean) => (
      <Button
        variant="text"
        size="small"
        sx={{
          textTransform: "uppercase",
          fontWeight: 400,
          
          fontSize: "0.65rem",
          color: "#2196F3",
          display: selectedComponent?.id === item.id ? "block" : "none"
        }}
        startIcon={ <AddBoxOutlined sx={{ color: "#2196F3" }}/> }
        onClick={ () => onAddComponentClick(item.path, asChildren) }
      >
        { strings.layoutEditor.addLayoutViewDialog.title }
      </Button>
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
      >
        <StyledTreeItem
          nodeId={ item.id }
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
          { (item.children?.length === 0 && item.type === HtmlComponentType.LAYOUT) && renderAddNewElementButton(item, true) }
        </StyledTreeItem>
        { renderAddNewElementButton(item, false) }
      </Stack>
    );
  };

  return (
    <TreeView>
      { treeObjects.map(item => renderTreeItem(item, true)) }
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;