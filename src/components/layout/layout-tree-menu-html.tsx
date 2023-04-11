import { FC } from 'react';
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
  htmlString: string;
  openDraw: boolean;
  onTreeComponentSelect: (openDraw: boolean, panelComponentData: TreeObject) => void;
}

/**
 * Layout Tree Menu HTML Component
 */
const LayoutTreeMenuHtml: FC<Props> = ({
  htmlString,
  openDraw,
  onTreeComponentSelect
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

    const componentStylesString = element.attributes.getNamedItem("style")?.nodeValue || undefined;

    const styleElement = (element as HTMLElement).style;

    const id = element.id ?? "";

    if (!componentType) return;

    if (!Object.values(ComponentType).includes(componentType as ComponentType)) return;

    const children: any[] = [];

    for (const child of element.children) {
      children.push(createTreeObject(child));
    }

    return {
      type: componentType as ComponentType,
      id: id,
      children: children,
      style: styleElement
    }
  };

  /**
   * Renders Tree Item
   *
   * @param item item
   * @param isRoot is root element
   */
  const renderTreeItem = (item?: TreeObject, isRoot?: boolean, isRootSubdirectory?: boolean) => {
    if (!item) return;
    const hasChildren = !!item.children.length;

    return (
      <StyledTreeItem
        key={ item.id }
        nodeId={ item?.id ?? "" }
        labelText={ item.type }
        isLayoutComponent={ item.type === ComponentType.LAYOUT }
        isRoot={ isRoot }
        isRootSubdirectory={ isRootSubdirectory }
        hasChildren={ hasChildren }
        openDraw={ openDraw }
        onTreeComponentSelect={ onTreeComponentSelect }
        itemData={ item }
      >
        { item.children.map((child, i) => {
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
      { Array.isArray(domArray) &&
        domArray.map(domElement => {
          const item = createTreeObject(domElement);
          return renderTreeItem(item, true);
        })
      }
    </TreeView>
  );
};

export default LayoutTreeMenuHtml;