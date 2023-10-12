import { setLayouts, setSelectedLayout } from "../../actions/layouts";
import Api from "../../api/api";
import {
  DeviceModel,
  Exhibition,
  PageLayout,
  PageLayoutViewHtml,
  PageResourceMode,
  ScreenOrientation,
  SubLayout
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/components/layout-screen/layout-editor-view";
import {
  AccessToken,
  ActionButton,
  HtmlComponentType,
  LayoutEditorView,
  TreeObject
} from "../../types";
import HtmlComponentsUtils from "../../utils/html-components-utils";
import HtmlResourceUtils from "../../utils/html-resource-utils";
import AddNewElementDialog from "../dialogs/add-new-element-dialog";
import EditorView from "../editor/editor-view";
import {
  addNewHtmlComponent,
  constructTree,
  createTreeObject,
  deleteHtmlComponent,
  deserializeElement,
  treeObjectToHtmlElement,
  updateHtmlComponent
} from "../layout/utils/tree-html-data-utils";
import CodeEditorHTML from "../layout/v2/code-editor-html";
import CodeEditorJSON from "../layout/v2/code-editor-json";
import LayoutLeftPanel from "../layout/v2/layout-left-panel";
import LayoutPreviewHtml from "../layout/v2/layout-preview";
import LayoutRightPanel from "../layout/v2/layout-right-panel";
import BasicLayout from "../layouts/basic-layout";
import { CircularProgress, SelectChangeEvent } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  deviceModels: DeviceModel[];
  layoutId: string;
  layout?: PageLayout;
  layouts: PageLayout[];
  subLayouts: SubLayout[];
  setLayouts: typeof setLayouts;
  setSelectedLayout: typeof setSelectedLayout;
}

/**
 * Component for html layout screen
 */
const LayoutScreenHTML: FC<Props> = ({
  history,
  keycloak,
  deviceModels,
  layouts,
  layoutId,
  accessToken,
  classes,
  subLayouts
}) => {
  const [view, setView] = useState<LayoutEditorView>(LayoutEditorView.VISUAL);
  const [dataChanged, setDataChanged] = useState(false);
  const [foundLayout, setFoundLayout] = useState<PageLayout>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<TreeObject>();
  const [treeObjects, setTreeObjects] = useState<TreeObject[]>([]);
  const [addComponentDialogOpen, setAddComponentDialogOpen] = useState(false);
  const [newComponentPath, setNewComponentPath] = useState<string>();
  const [isNewComponentSibling, setIsNewComponentSibling] = useState<boolean>();
  const [onSaveCallback, setOnSaveCallback] = useState<() => { [key: string]: number }>(() => ({}));
  const isFirstRender = useRef(true);

  useEffect(() => {
    fetchLayout();
  }, []);

  useEffect(() => {
    if (!foundLayout) return;
    setTreeObjects([...constructTree((foundLayout.data as PageLayoutViewHtml).html)]);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setDataChanged(true);
  }, [foundLayout]);

  /**
   * Fetches PageLayout
   */
  const fetchLayout = async () => {
    setLoading(true);
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);

      const pageLayout = await pageLayoutsApi.findPageLayout({ pageLayoutId: layoutId });

      setFoundLayout(pageLayout);
    } catch (e) {
      console.error(e);
      setError(new Error(strings.errorDialog.layoutFetchNotFound));
    }
    setLoading(false);
  };

  if (!foundLayout) {
    return (
      <BasicLayout
        history={history}
        title={""}
        breadcrumbs={[]}
        keycloak={keycloak}
        error={error}
        clearError={() => history.goBack()}
      />
    );
  }

  /**
   * Event handler for layout name input change
   *
   * @param event event
   */
  const onLayoutNameChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setFoundLayout({
      ...foundLayout,
      name: value
    });
    setDataChanged(true);
  };

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   */
  const onScreenOrientationChange = ({
    target: { value }
  }: SelectChangeEvent<ScreenOrientation>) => {
    setFoundLayout({
      ...foundLayout,
      screenOrientation: value as ScreenOrientation
    });
    setDataChanged(true);
  };

  /**
   * Event handler for device model select change
   *
   * @param event event
   */
  const onDeviceModelChange = ({ target: { value } }: SelectChangeEvent<string>) => {
    setFoundLayout({
      ...foundLayout,
      modelId: value
    });
    setDataChanged(true);
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  const getActionButtons = (): ActionButton[] => [
    {
      name:
        view === LayoutEditorView.CODE
          ? strings.exhibitionLayouts.editView.switchToVisualButton
          : strings.exhibitionLayouts.editView.switchToCodeButton,
      action: () => {
        setView(view === LayoutEditorView.CODE ? LayoutEditorView.VISUAL : LayoutEditorView.CODE);
      }
    },
    {
      name: strings.exhibitionLayouts.editView.saveButton,
      action: onLayoutSave,
      disabled: !dataChanged
    }
  ];

  const addMaxWidthToComponent = (treeObject: TreeObject): TreeObject => {
    const result = { ...treeObject };
    const { id, element, type } = result;

    if (type === HtmlComponentType.TEXT) {
      const width = HtmlComponentsUtils.parseStyles(element)["width"];
      const realWidths = onSaveCallback();
      const previewWidth = realWidths[id];
      if (width?.endsWith("%") && previewWidth) {
        result.element = HtmlComponentsUtils.handleStyleAttributeChange(
          element,
          "max-width",
          `${previewWidth}px`
        );
      } else {
        result.element = HtmlComponentsUtils.handleStyleAttributeChange(element, "max-width");
      }
    }
    result.children = result.children.map(addMaxWidthToComponent);

    return result;
  };

  /**
   * Event handler for layout save
   */
  const onLayoutSave = async () => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);
      const tree = addMaxWidthToComponent(treeObjects[0]);
      const htmlElements = treeObjectToHtmlElement(tree);

      const layout: PageLayout = {
        ...foundLayout,
        data: { html: htmlElements.outerHTML.replace(/^\s*\n/gm, "") } as PageLayoutViewHtml
      };

      const updatedLayout = await pageLayoutsApi.updatePageLayout({
        pageLayoutId: layoutId,
        pageLayout: layout
      });

      const updatedLayouts = layouts.filter((item) => item.id !== updatedLayout.id);
      setLayouts([...updatedLayouts, layout]);
      setFoundLayout(updatedLayout);
      setDataChanged(false);
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };

  /**
   * Handler for HTML code editor onChange events
   *
   * @param value changed code
   */
  const onHtmlCodeChange = (value: string) => {
    const resourceIds = HtmlResourceUtils.extractResourceIds(value);
    const updatedDefaultResources = foundLayout.defaultResources?.filter((resource) =>
      resourceIds.includes(resource.id)
    );
    setFoundLayout({
      ...foundLayout,
      defaultResources: updatedDefaultResources,
      data: { html: value }
    });
    setDataChanged(true);
  };

  /**
   * Handler for JSON code editor onChange events
   *
   * @param value changed code
   */
  const onJsonCodeChange = (value: string) => {
    setFoundLayout({
      ...foundLayout,
      defaultResources: JSON.parse(value)
    });
    setDataChanged(true);
  };

  /**
   * Renders editor view
   */
  const renderEditor = () => {
    switch (view) {
      case LayoutEditorView.CODE:
        return (
          <>
            <CodeEditorHTML
              htmlString={(foundLayout.data as PageLayoutViewHtml).html}
              onCodeChange={onHtmlCodeChange}
            />
            <CodeEditorJSON
              jsonString={JSON.stringify(foundLayout.defaultResources || [])}
              onCodeChange={onJsonCodeChange}
            />
          </>
        );
      case LayoutEditorView.VISUAL: {
        const deviceModel = deviceModels.find((model) => model.id === foundLayout.modelId);
        if (!deviceModel) {
          return null;
        }

        const layoutHtml = (foundLayout.data as PageLayoutViewHtml).html;

        return (
          <LayoutPreviewHtml
            deviceModel={deviceModel}
            layoutHtml={layoutHtml}
            screenOrientation={foundLayout.screenOrientation}
            resources={foundLayout.defaultResources || []}
            selectedComponentId={selectedComponent?.id}
            setOnSaveCallback={setOnSaveCallback}
          />
        );
      }
    }
  };

  /**
   * Handles element selected from layout navigation tree
   *
   * @param selectedComponent selected component
   */
  const onTreeComponentSelect = (selectedComponent?: TreeObject) => {
    setSelectedComponent(selectedComponent);
  };

  /**
   * Event handler for add component click
   *
   * @param path path to the parent element where the new child item will be added
   * @param asChildren whether to add as children or sibling
   */
  const onAddComponentClick = (path: string, asChildren: boolean) => {
    setAddComponentDialogOpen(true);
    setNewComponentPath(path);
    setIsNewComponentSibling(asChildren);
  };

  /**
   * Create new component and add it to the layout
   *
   * @param componentData component data
   * @param targetPath sibling path
   */
  const createComponent = (componentData: string, targetPath: string) => {
    if (!newComponentPath) return;

    const newElement = deserializeElement(componentData);
    const newComponent = createTreeObject(newElement, targetPath);

    if (!newComponent) return;

    const resourceIds = HtmlResourceUtils.extractResourceIds(componentData);

    const updatedTree = addNewHtmlComponent(
      treeObjects,
      newComponent,
      targetPath,
      !!isNewComponentSibling
    );

    const newDefaultResources = (resourceIds ?? []).map((resourceId) => ({
      id: resourceId,
      data: newComponent.type === HtmlComponentType.LAYOUT ? "none" : "",
      type: HtmlResourceUtils.getResourceType(newComponent.type),
      mode: PageResourceMode.Static
    }));

    const defaultResources = [...(foundLayout.defaultResources || []), ...newDefaultResources];

    const updatedHtmlElements = updatedTree.map((treeObject) =>
      treeObjectToHtmlElement(treeObject)
    );

    const domArray = Array.from(updatedHtmlElements) as HTMLElement[];

    const updatedLayout: PageLayout = {
      ...foundLayout,
      data: {
        html: domArray[0].outerHTML.replace(/^\s*\n/gm, "")
      },
      defaultResources: defaultResources
    };

    setFoundLayout(updatedLayout);
    setTreeObjects([...constructTree(domArray[0].outerHTML.replace(/^\s*\n/gm, ""))]);
    setSelectedComponent(newComponent);
    setDataChanged(true);
  };

  /**
   * Deletes component and removes it from the layout
   *
   * @param id id of the component to be deleted
   */
  const deleteComponent = (componentToDelete: TreeObject) => {
    const updatedTree = deleteHtmlComponent(treeObjects, componentToDelete.path);

    const resourceIds = HtmlResourceUtils.extractResourceIds(updatedTree[0].element.outerHTML);

    const updatedDefaultResources = foundLayout.defaultResources?.filter((resource) =>
      resourceIds.includes(resource.id)
    );

    const updatedHtmlElements = updatedTree.map((treeObject) =>
      treeObjectToHtmlElement(treeObject)
    );

    const domArray = Array.from(updatedHtmlElements) as HTMLElement[];

    const updatedLayout: PageLayout = {
      ...foundLayout,
      data: {
        html: domArray[0].outerHTML.replace(/^\s*\n/gm, "")
      },
      defaultResources: updatedDefaultResources
    };

    setFoundLayout(updatedLayout);
    setTreeObjects([...constructTree(domArray[0].outerHTML.replace(/^\s*\n/gm, ""))]);
    setSelectedComponent(undefined);
    setDataChanged(true);
  };

  /**
   * Update component and add it to the layout
   *
   * @param updatedComponent TreeObject
   */
  const updateComponent = (updatedComponent: TreeObject) => {
    if (!selectedComponent) return null;

    const updatedTreeObjects = updateHtmlComponent(
      constructTree((foundLayout.data as PageLayoutViewHtml).html),
      updatedComponent,
      selectedComponent.path
    );

    const updatedHtmlElements = updatedTreeObjects.map((treeObject) =>
      treeObjectToHtmlElement(treeObject)
    );

    const domArray = Array.from(updatedHtmlElements) as HTMLElement[];

    setFoundLayout({
      ...foundLayout,
      data: {
        html: domArray[0].outerHTML.replace(/^\s*\n/gm, "")
      }
    });

    setTreeObjects([...constructTree(domArray[0].outerHTML.replace(/^\s*\n/gm, ""))]);
    setSelectedComponent(updatedComponent);
    setDataChanged(true);
  };

  if (loading) {
    return (
      <div className={classes.loader}>
        <CircularProgress size={50} color="secondary" />
      </div>
    );
  }

  return (
    <BasicLayout
      history={history}
      title={foundLayout.name}
      breadcrumbs={[]}
      actionBarButtons={getActionButtons()}
      keycloak={keycloak}
      error={error}
      clearError={() => setError(undefined)}
      openDataChangedPrompt={true}
    >
      <div className={classes.editorLayout}>
        <LayoutLeftPanel
          layout={foundLayout}
          treeObjects={treeObjects}
          selectedComponent={selectedComponent}
          deviceModels={deviceModels}
          onTreeComponentSelect={onTreeComponentSelect}
          onAddComponentClick={onAddComponentClick}
          onLayoutNameChange={onLayoutNameChange}
          onDeviceModelChange={onDeviceModelChange}
          onScreenOrientationChange={onScreenOrientationChange}
        />
        <EditorView>{renderEditor()}</EditorView>
        {selectedComponent && (
          <LayoutRightPanel
            component={selectedComponent}
            layout={foundLayout}
            setLayout={setFoundLayout}
            updateComponent={updateComponent}
            deleteComponent={deleteComponent}
            onClose={() => setSelectedComponent(undefined)}
          />
        )}
      </div>
      <AddNewElementDialog
        open={addComponentDialogOpen}
        subLayouts={subLayouts}
        siblingPath={newComponentPath}
        onConfirm={createComponent}
        onClose={() => setAddComponentDialogOpen(false)}
      />
    </BasicLayout>
  );
};

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
const mapStateToProps = (state: ReduxState) => {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken,
    layout: state.layouts.selectedLayout as PageLayout,
    layouts: state.layouts.layouts,
    subLayouts: state.subLayouts.subLayouts,
    exhibitions: state.exhibitions.exhibitions,
    deviceModels: state.devices.deviceModels
  };
};

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
    setLayouts: (layouts: PageLayout[]) => dispatch(setLayouts(layouts))
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(LayoutScreenHTML));
