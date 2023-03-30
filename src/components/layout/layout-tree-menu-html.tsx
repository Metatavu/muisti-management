import { TreeItem, TreeView } from '@mui/lab';
import { HTML_LAYOUT_ROOT } from '../../constants/html-layout-root';
import { parseToHtml } from './utils/tree-html-data-utils';

interface RenderTree {
  id: string;
  name: string;
  children?: readonly RenderTree[];
}

const exampleTreeData = {
  id: 'root',
  name: 'Parent',
  children: [
    {
      id: '1',
      name: 'Child - 1',
    },
    {
      id: '3',
      name: 'Child - 3',
      children: [
        {
          id: '4',
          name: 'Child - 4',
        },
      ],
    },
  ],
}

const LayoutTreeMenuHtml = () => {

  const htmlString = HTML_LAYOUT_ROOT;
  const htmlDom = parseToHtml(htmlString);

  const domArray = Array.from(htmlDom.querySelectorAll("*"));

  type TreeObject = {
    type: ComponentType;
    id: string;
    resourceId?: string;
    children: TreeObject[];
  };
  enum ComponentType {
    LAYOUT = "layout",
    BUTTON = "button",
    IMAGE = "image",
    TEXT = "text"
  };
  const extractTreeObject = (element: Element): TreeObject | undefined => {
    const componentType = element.attributes.getNamedItem("data-component-type")?.nodeValue;
    const id = element.id;

    if (!componentType) return;

    if (!Object.values(ComponentType).includes(componentType)) return;

    const children: any[] = [];

    for (const child of element.children) {
      children.push(extractTreeObject(child));
    }

    return {
      type: componentType as ComponentType,
      id: id,
      children: children
    }
  };

  domArray.forEach(x => console.log(extractTreeObject(x)));


  console.log(extractTreeObject(domArray[0]))

  // TODO: export to tree utils
  const renderTree = (nodes: RenderTree) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => renderTree(node))
        : null}
    </TreeItem>
  );

  return (
    <TreeView>
      {renderTree(exampleTreeData)}
    </TreeView>
  )
};

export default LayoutTreeMenuHtml;