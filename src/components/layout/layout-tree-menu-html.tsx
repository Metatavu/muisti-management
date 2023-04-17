import { AddBoxOutlined } from '@mui/icons-material';
import { TreeView } from '@mui/lab';
import { Stack, Typography } from '@mui/material';
import { StyledTreeItem } from '../../styles/components/layout-screen/styled-tree-item';
import { ComponentType, TreeObject } from '../../types';
import strings from '../../localization/strings';

/**
 * Components properties
 */
interface Props {
  treeObjects: TreeObject[];
  onTreeComponentSelect: (selectedComponent: TreeObject) => void;
}

/**
 * Layout Tree Menu HTML Component
 */
const LayoutTreeMenuHtml = ({
  treeObjects,
  onTreeComponentSelect
}: Props) => {
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

    return (
      <StyledTreeItem
        key={ item.id }
        nodeId={ item.id }
        itemType={ item.type }
        itemName={ item.name || "Nimetön" }
        isLayoutComponent={ item.type === ComponentType.LAYOUT }
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
        { item.type === ComponentType.LAYOUT &&
            <Stack direction="row" alignItems="center">
              <AddBoxOutlined/>
              <Typography variant="caption" textTransform="uppercase">
                { strings.layoutEditor.addLayoutViewDialog.title }
              </Typography>
            </Stack>
        }
      </StyledTreeItem>
    );
  };

  return (
    <TreeView>
      { treeObjects.map(item => renderTreeItem(item, true)) }
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;