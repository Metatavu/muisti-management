import { ChangeEvent, FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import Api from "../../api/api";
import { History } from "history";
import styles from "../../styles/components/layout-screen/layout-editor-view";
import {
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { KeycloakInstance } from "keycloak-js";
import { PageLayout, Exhibition, DeviceModel, ScreenOrientation, SubLayout, LayoutType, PageLayoutViewHtml } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, ComponentType, LayoutEditorView, TreeObject } from "../../types";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import LayoutTreeMenuHtml from "../layout/layout-tree-menu-html";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { html_beautify } from "js-beautify";
import GenericComponentDrawProperties from "../layout/editor-components/html/generic-component-properties";
import { Close } from "@mui/icons-material";
import ElementSettingsPane from "../layouts/element-settings-pane";
import LayoutComponentProperties from "../layout/editor-components/html/layout-component-properties";

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
  layout,
  layouts,
  layoutId,
  accessToken,
  classes
}) => {
  const [ view, setView ] = useState<LayoutEditorView>(LayoutEditorView.VISUAL);
  const [ dataChanged, setDataChanged ] = useState(false);
  const [ foundLayout, setFoundLayout ] = useState(layout);
  const [ error, setError ] = useState<Error | undefined>(undefined);
  const [ loading, setLoading ] = useState(false);
  const [ drawerOpen, setDrawerOpen ] = useState(false);
  const [ selectedComponent, setSelectedComponent ] = useState<TreeObject | undefined>(undefined);
  const [ treeObjects, setTreeObjects ] = useState<TreeObject[]>([]);

  useEffect(() => {
    fetchLayout();
  }, []);

  useEffect(() => {
    setDrawerOpen(!!selectedComponent);
  }, [selectedComponent]);

  const constructTree = (html: string) => {
    const dom = new DOMParser().parseFromString(html, "text/html").body;
    const domArray = Array.from(dom.children);

    return domArray.map(x => createTreeObject(x) as TreeObject);
  };

  useEffect(() => {
    if (!foundLayout) return;

    setTreeObjects([...constructTree((foundLayout.data as PageLayoutViewHtml).html)]);
  }, [foundLayout]);

  /**
   * Creates Tree Object from HTML Element
   *
   * @param element element
   * @param basePath base path
   * @returns TreeObject
   */
  const createTreeObject = (element: Element, basePath?: string): TreeObject | undefined => {
    const componentType = element.attributes.getNamedItem("data-component-type")?.nodeValue;

    const id = element.id ?? "";

    if (!componentType) return;

    if (!Object.values(ComponentType).includes(componentType as ComponentType)) return;

    const children: TreeObject[] = [];

    const path = basePath ? `${basePath}/${id}` : id;

    for (const child of element.children) {
      const treeObject = createTreeObject(child, path);

      if (treeObject) children.push(treeObject);
    }

    return {
      type: componentType as ComponentType,
      path: path,
      name: element.attributes.getNamedItem("name")?.nodeValue ?? "",
      id: id,
      children: children,
      element: element as HTMLElement
    }
  };

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
    const layoutError = new Error(strings.errorDialog.layoutFetchNotFound);

    return (
      <BasicLayout
        history={ history }
        title={ "" }
        breadcrumbs={ [] }
        keycloak={ keycloak }
        error={ layoutError }
        clearError={ () => history.goBack() }
      />
    )
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
  const onScreenOrientationChange = ({ target: { value } }: SelectChangeEvent<ScreenOrientation>) => {
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
  const onDeviceModelChange = ({ target: { value } } : SelectChangeEvent<string>) => {
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
  const getActionButtons = (): ActionButton[] => (
    [
      {
        name: view === LayoutEditorView.CODE ?
          strings.exhibitionLayouts.editView.switchToVisualButton :
          strings.exhibitionLayouts.editView.switchToCodeButton,
          action: () => view === LayoutEditorView.CODE ? setView(LayoutEditorView.VISUAL) : setView(LayoutEditorView.CODE),
      },
      {
        name: strings.exhibitionLayouts.editView.saveButton,
        action: onLayoutSave,
        disabled : !dataChanged
      },
    ]
  );

  /**
   * Event handler for layout save
   *
   * @param layout layout
   */
  const onLayoutSave = async () => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);

      const updatedLayout = await pageLayoutsApi.updatePageLayout({
        pageLayoutId: layoutId,
        pageLayout: foundLayout
      });

      const updatedLayouts = layouts.filter(item => item.id !== updatedLayout.id);
      setLayouts([ ...updatedLayouts, layout ]);
      setDataChanged(false);
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };

  /**
   * Handler for Code Editor onChange events
   */
  const onCodeChange = (value: string) => {
    setFoundLayout({ ...foundLayout, data: { html: value } });
  };

  /**
   * Renders editor view
   */
  const renderEditor = () => {
    switch (view) {
      case "CODE":
        return renderCodeEditor();
      case "VISUAL":
        // return renderVisualEditor();
      default:
        return null;
    }
  }

  /**
   * Handles element selected from layout navigation tree
   *
   * @param selectedComponent selected component
   */
  const onTreeComponentSelect = (selectedComponent: TreeObject) => {
    setSelectedComponent(selectedComponent);
  };

  /**
   * TODO: ADD DOCS
   */
  const constructTreeUpdateData = (treeData: TreeObject[], updatedComponent: TreeObject, destinationPath: string): TreeObject[] => {
    const updatedTree: TreeObject[] = [treeData[0]];
    if (treeData[0].id === destinationPath) {
      updatedTree[0] = updatedComponent;
    } else {
      updatedTree[0].children = updateFromTree(updatedTree[0].children, destinationPath, treeData[0].id, updatedComponent);
    }

    return updatedTree;
  };

  /**
   * TODO: ADD DOCS
   */
  const updateFromTree = (treeData: TreeObject[], destinationPath: string, currentPath: string, updatedComponent: TreeObject): TreeObject[] => {
    const cleanNodes: TreeObject[] = [];
    let found = false;
    for (let i = 0; i < treeData.length; i++) {
      const node = treeData[i];
      const fullPath = `${currentPath}/${node.id}`;
      if (fullPath !== destinationPath) {
        cleanNodes.push(node);
      } else {
        cleanNodes.push(updatedComponent);
        found = true
      }
    }

    if (found) {
      return cleanNodes;
    } else {
      for (let i = 0; i < treeData.length; i++) {
      const child = treeData[i];
      const updatedPath = `${currentPath}/${child.id}`;
      child.children = updateFromTree(child.children ?? [], destinationPath, updatedPath, updatedComponent);
    }
  }

  return treeData;
};

  const treeObjectToHtmlElement = (treeObject: TreeObject): HTMLElement => {
    const element = treeObject.element;
    element.replaceChildren();
    if (treeObject.children) {
      for (let i = 0; i < treeObject.children.length; i++) {
        element.appendChild(treeObjectToHtmlElement(treeObject.children[i]));
      }
    }

    return element;
  };

  /**
   * TODO: ADD DOCS
   */
  const updateComponent = (updatedComponent: TreeObject) => {
    const updatedTreeObjects = constructTreeUpdateData(
      constructTree((foundLayout.data as PageLayoutViewHtml).html),
      updatedComponent,
      selectedComponent!.path
    );
    const updatedHtmlElements = updatedTreeObjects.map(treeObjectToHtmlElement);
    const domArray = Array.from(updatedHtmlElements) as HTMLElement[];

    setFoundLayout({
      ...foundLayout,
      data: {
        html: domArray[0].outerHTML.replace(/^\s*\n/gm, "")
      }
    });
    setTreeObjects([...constructTree(domArray[0].outerHTML.replace(/^\s*\n/gm, ""))]);
    setSelectedComponent(updatedComponent);
  };

  /**
   * Renders device model select
   */
  const renderDeviceModelSelect = () => {
    const deviceModelSelectItems = deviceModels.map(model =>
      <MenuItem key={ model.id } value={ model.id }>{ `${ model.manufacturer } ${ model.model }` }</MenuItem>
    );

    return (
      <div className={ classes.select }>
        <FormControl variant="outlined">
          <InputLabel id="deviceModelId">
            { strings.layout.settings.deviceModelId }
          </InputLabel>
          <Select
            style={{ width: 200 }}
            title={ strings.helpTexts.layoutEditor.selectDevice }
            label={ strings.layout.settings.deviceModelId }
            labelId="deviceModelId"
            value={ foundLayout.modelId }
            onChange={ onDeviceModelChange }
            >
          { deviceModelSelectItems }
          </Select>
        </FormControl>
      </div>
    );
  }

  /**
   * Renders screen orientation select
   */
  const renderScreenOrientationSelect = () => {
    return (
      <div className={ classes.select }>
        <FormControl variant="outlined">
          <InputLabel id="screenOrientation">{ strings.layout.settings.screenOrientation }</InputLabel>
          <Select
            style={{ width: 200 }}
            title={ strings.helpTexts.layoutEditor.selectOrientation }
            label={ strings.layout.settings.screenOrientation }
            labelId="screenOrientation"
            value={ foundLayout.screenOrientation }
            onChange={ onScreenOrientationChange }
            >
            <MenuItem value={ ScreenOrientation.Portrait }>{ strings.layout.settings.portrait }</MenuItem>
            <MenuItem value={ ScreenOrientation.Landscape }>{ strings.layout.settings.landscape }</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  };

  /**
   * Options for html beautify
   */
  const htmlBeautifyOptions: js_beautify.HTMLBeautifyOptions = {
    indent_size: 2,
    inline: [],
    indent_empty_lines: true,
    end_with_newline: false
  };

  /**
   * Renders code editor view
   */
  const renderCodeEditor = () => (
    <div className={ classes.editors }>
      <div className={ classes.editorContainer }>
        <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.html }</Typography>
          <CodeMirror
            value={ html_beautify((foundLayout.data as PageLayoutViewHtml).html, htmlBeautifyOptions) }
            height="500px"
            style={{ overflow: "auto" }}
            extensions={ [ html() ] }
            onChange={ onCodeChange }
          />
      </div>
    </div>
  );

  const elementPaneMenuOptions = [
    {
      name: strings.genericDialog.close,
      action: () => setDrawerOpen(!drawerOpen)
    }
  ];

  /**
   * Renders element settings pane
   */
  const renderElementSettingsPane = () => {
    if (!selectedComponent) return;

    return (
      <ElementSettingsPane
        width={ 250 }
        open={ drawerOpen }
        title={ strings.layout.htmlProperties.elementSettings }
        actionIcon={ <Close sx={{ color:"#2196F3" }}/> }
        menuOptions={ elementPaneMenuOptions }
      >
        <GenericComponentDrawProperties
          component={ selectedComponent }
          updateComponent={ updateComponent }
        />
        { selectedComponent?.type === ComponentType.LAYOUT &&
          <LayoutComponentProperties
            panelComponentData={ selectedComponent }
          />}
    </ElementSettingsPane>
    )
  }

  if (loading) {
    return (
      <div className={ classes.loader }>
        <CircularProgress size={ 50 } color="secondary"/>
      </div>
    );
  }

  return (
    <BasicLayout
      history={ history }
      title={ foundLayout.name }
      breadcrumbs={ [] }
      actionBarButtons={ getActionButtons() }
      keycloak={ keycloak }
      error={ error }
      clearError={ () => setError(undefined) }
      openDataChangedPrompt={ true }
    >
        <div className={ classes.editorLayout }>
          <ElementNavigationPane width={ 250 } title={ strings.layout.title }>
            <div style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}>
              <TextField
                style={{ width: 200 }}
                label={ strings.layout.toolbar.name }
                value={ foundLayout.name }
                onChange={ onLayoutNameChange }
              />
              { renderDeviceModelSelect() }
              { renderScreenOrientationSelect() }
              <LayoutTreeMenuHtml
                treeObjects={ treeObjects }
                onTreeComponentSelect={ onTreeComponentSelect }
              />
            </div>
          </ElementNavigationPane>
          <EditorView>
            { renderEditor() }
          </EditorView>
          { selectedComponent && renderElementSettingsPane() }
        </div>
    </BasicLayout>
  );
}

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
}

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
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutScreenHTML));