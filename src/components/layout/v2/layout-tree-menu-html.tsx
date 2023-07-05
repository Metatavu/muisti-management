import strings from "../../../localization/strings";
import { StyledTreeItem } from "../../../styles/components/layout-screen/styled-tree-item";
import theme from "../../../styles/theme";
import { HtmlComponentType, TreeObject } from "../../../types";
import { CONTAINER_ELEMENTS } from "../utils/tree-html-data-utils";
import {
  AddBoxOutlined as AddBoxOutlinedIcon,
  SubdirectoryArrowRightRounded as SubdirectoryArrowRightRoundedIcon,
  UnfoldLess as UnfoldLessIcon,
  UnfoldMore as UnfoldMoreIcon
} from "@mui/icons-material";
import { TreeView } from "@mui/lab";
import { Button, Stack } from "@mui/material";
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
   * Gets unfolding icon
   */
  const getUnfoldingIcon = (item: TreeObject) => {
    if (!CONTAINER_ELEMENTS.includes(item.type)) return;

    if (getParentIds().includes(item.id)) {
      return <UnfoldLessIcon htmlColor="#2196F3" />;
    }

    return <UnfoldMoreIcon htmlColor="#2196F3" />;
  };
  /**
   * Renders Add New Element button
   */
  const renderAddNewElementButton = (item: TreeObject, asChildren: boolean) => (
    <Button
      variant="text"
      size="small"
      fullWidth
      sx={{
        textTransform: "uppercase",
        fontWeight: 400,
        fontSize: "0.65rem",
        color: "#2196F3",
        display: selectedComponent?.id === item.id ? "block" : "none",
        border: "1px dashed #2196F3"
      }}
      onClick={() => onAddComponentClick(item.path, asChildren)}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-evenly">
        <AddBoxOutlinedIcon sx={{ color: "#2196F3" }} />
        {strings.layoutEditor.addLayoutViewDialog.title}
      </Stack>
    </Button>
  );

  /**
   * Renders Tree Item
   *
   * @param item item
   * @param index index
   */
  const renderTreeItem = (item: TreeObject, index: number) => (
    <Stack key={item.id} spacing={theme.spacing(1)} marginY={theme.spacing(1)}>
      <StyledTreeItem
        nodeId={item.id}
        itemType={item.type}
        itemName={item.name || strings.generic.name}
        startIcon={index === 0 && <SubdirectoryArrowRightRoundedIcon htmlColor="#BDBDBD" />}
        endIcon={getUnfoldingIcon(item)}
        onClick={() => onTreeComponentSelect(item)}
        onDoubleClick={() => {
          if (selectedComponent?.id === item.id) {
            onTreeComponentSelect(undefined);
          }
        }}
      >
        {(item.children ?? []).map(renderTreeItem)}
        {item.children?.length === 0 &&
          item.type === HtmlComponentType.LAYOUT &&
          renderAddNewElementButton(item, true)}
      </StyledTreeItem>
      {renderAddNewElementButton(item, false)}
    </Stack>
  );

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

    const parentIds: string[] = [];
    for (let i = 0; i <= slashes; i++) {
      if (path?.split("/")[i]) {
        parentIds.push(path?.split("/")[i]);
      }
    }

    return parentIds;
  };

  return <TreeView expanded={getParentIds()}>{treeObjects.map(renderTreeItem)}</TreeView>;
};

export default LayoutTreeMenuHtml;
