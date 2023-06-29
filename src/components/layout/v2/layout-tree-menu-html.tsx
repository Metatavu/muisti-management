import { AddBoxOutlined } from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { Button, Stack } from "@mui/material";
import { StyledTreeItem } from "../../../styles/components/layout-screen/styled-tree-item";
import { HtmlComponentType, TreeObject } from "../../../types";
import strings from "../../../localization/strings";

/**
 * Components properties
 */
interface Props {
  treeObjects: TreeObject[];
  selectedComponent?: TreeObject;
  onTreeComponentSelect: (selectedComponent?: TreeObject) => void;
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
        flexWrap: "wrap",
        display: selectedComponent?.id === item.id ? "block" : "none"
      }}
      onClick={() => onAddComponentClick(item.path, asChildren)}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <AddBoxOutlined sx={{ color: "#2196F3" }} />
        {strings.layoutEditor.addLayoutViewDialog.title}
      </Stack>
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
      <Stack key={item.id}>
        <StyledTreeItem
          nodeId={item.id}
          itemType={item.type}
          itemName={item.name || strings.generic.name}
          isLayoutComponent={isLayoutComponent}
          isRoot={isRoot}
          isRootSubdirectory={isRootSubdirectory}
          hasChildren={hasChildren}
          onClick={() => onTreeComponentSelect(item)}
          onDoubleClick={() => {
            if (selectedComponent?.id === item.id) {
              onTreeComponentSelect(undefined);
            }
          }}
        >
          {(item.children ?? []).map((child, i) => {
            const isRootSubDirectory = i === 0;
            return renderTreeItem(child, false, isRootSubDirectory);
          })}
          {item.children?.length === 0 &&
            item.type === HtmlComponentType.LAYOUT &&
            renderAddNewElementButton(item, true)}
        </StyledTreeItem>
        {renderAddNewElementButton(item, false)}
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
  const getParentIds = (): string[] => {
    if (!selectedComponent) {
      return [];
    }

    const { path, type } = selectedComponent;

    if (!path || !type) {
      return [];
    }

    const slashes = path?.match(/\//g)?.length ?? 0;

    if (!slashes) {
      return [path];
    }

    let parentIds: string[] = [];
    for (let i = 0; i <= slashes; i++) {
      if (path?.split("/")[i]) {
        parentIds.push(path?.split("/")[i]);
      }
    }

    return parentIds;
  };

  return (
    <TreeView expanded={getParentIds()}>
      {treeObjects.map((item) => renderTreeItem(item, true))}
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;
