import { ChangeEvent, FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import Api from "../../api/api";
import { History } from "history";
import { addNewHtmlComponent, updateHtmlComponent, constructTree, createTreeObject, deserializeElement, treeObjectToHtmlElement } from "../layout/utils/tree-html-data-utils";
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
import { PageLayout, Exhibition, DeviceModel, ScreenOrientation, SubLayout, PageLayoutViewHtml, ExhibitionPageResource } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, HtmlComponentType, LayoutEditorView, TreeObject } from "../../types";
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
import AddNewElementDialog from "../dialogs/add-new-element-dialog";
import PanZoom from "../generic/pan-zoom";
import Fraction from "fraction.js";

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
  classes,
  subLayouts
}) => {
  const [ view, setView ] = useState<LayoutEditorView>(LayoutEditorView.VISUAL);
  const [ dataChanged, setDataChanged ] = useState(false);
  const [ foundLayout, setFoundLayout ] = useState<PageLayout>();
  const [ error, setError ] = useState<Error>();
  const [ loading, setLoading ] = useState(false);
  const [ drawerOpen, setDrawerOpen ] = useState(false);
  const [ selectedComponent, setSelectedComponent ] = useState<TreeObject>();
  const [ treeObjects, setTreeObjects ] = useState<TreeObject[]>([]);
  const [ addComponentDialogOpen, setAddComponentDialogOpen ] = useState(false);
  const [ newComponentPath, setNewComponentPath ] = useState<string>();
  const [ isNewComponentSibling, setIsNewComponentSibling ] = useState<boolean>();

  useEffect(() => {
    fetchLayout();
  }, []);

  useEffect(() => {
    setDrawerOpen(!!selectedComponent);
  }, [selectedComponent]);

  useEffect(() => {
    if (!foundLayout) return;
    console.log(foundLayout);
    setTreeObjects([...constructTree((foundLayout.data as PageLayoutViewHtml).html)]);
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
    setDataChanged(true);
  };

  /**
   * Renders editor view
   */
  const renderEditor = () => {
    switch (view) {
      case LayoutEditorView.CODE:
        return renderCodeEditor();
      case LayoutEditorView.VISUAL:
        return renderVisualEditor();
      default:
        return null;
    }
  }

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
  }

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

    const updatedLayout = addNewHtmlComponent(
      treeObjects,
      newComponent,
      targetPath,
      !!isNewComponentSibling
    );

    const updatedHtmlElements = updatedLayout.map(treeObject => treeObjectToHtmlElement(treeObject));
    const domArray = Array.from(updatedHtmlElements) as HTMLElement[];

    setFoundLayout({
      ...foundLayout,
      data: {
        html: domArray[0].outerHTML.replace(/^\s*\n/gm, "")
      }
    });
    setTreeObjects([...constructTree(domArray[0].outerHTML.replace(/^\s*\n/gm, ""))]);
    setSelectedComponent(newComponent);
    setDataChanged(true);
  }

  /**
   * TODO: ADD DOCS
   */
  const updateDefaultResources = (defaultResource: ExhibitionPageResource) => {
    setFoundLayout({
      ...foundLayout,
      defaultResources: [ ...foundLayout?.defaultResources ?? [], defaultResource ]
    })
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
    const updatedHtmlElements = updatedTreeObjects.map(treeObject => treeObjectToHtmlElement(treeObject));
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

  /**
   * Renders a visual editor view
   */
  const renderVisualEditor = () => {
    if (deviceModels.length === 0) return;

    const deviceModel = deviceModels.find(model => model.id === foundLayout.modelId);

    if (!deviceModel) return;

    const { dimensions: { screenHeight, screenWidth } } = deviceModel;

    const scale = 1;
    const { screenOrientation } = foundLayout;
    const { screenOrientation: deviceOrientation } = deviceModel;

    let height = screenHeight ?? 1 * scale;
    let width = screenWidth ?? 1 * scale;

    if (screenOrientation && deviceOrientation && screenOrientation !== deviceOrientation) {
      height = width;
      width = height;
    }

    return (
      <div className={ classes.editors }>
        <PanZoom minScale={ 0.1 } fitContent={ true } contentWidth={ screenWidth } contentHeight={ screenHeight }>
            <Typography
              sx={{
                position: "absolute",
                top: -20,
                opacity: 0.6
              }}
            >
              { deviceModel.model } / { screenHeight }x{ screenWidth } / { new Fraction((screenHeight ?? 0) / (screenWidth ?? 0)).toFraction().replace("/", ":") }
            </Typography>
          <div
            style={{
              position: "relative",
              borderRadius: 3,
              boxSizing: "content-box",
              backgroundColor: "#ffffff",
              overflow: "auto",
              transition: "border-color 0.2s ease-out",
              width: width,
              height: height,
              minWidth: width,
              minHeight: height,
              maxWidth: width,
              maxHeight: height,
            }}
          >
            <span dangerouslySetInnerHTML={{
              __html: treeObjects?.map(treeObject => treeObjectToHtmlElement(treeObject, selectedComponent?.id))[0]?.outerHTML
              }}
            />
          </div>
        </PanZoom>
      </div>
    );
  };
  
  /**
   * Renders component specific properties
   */
  const renderComponentSpecificProperties = () => {
    switch (selectedComponent?.type) {
      case HtmlComponentType.LAYOUT:
        return (
          <LayoutComponentProperties
            component={ selectedComponent }
            updateComponent={ updateComponent }
          />
        );
    }
  };

  const elementPaneMenuOptions = [
    {
      name: strings.genericDialog.close,
      action: () => {
        setDrawerOpen(!drawerOpen);
        setSelectedComponent(undefined);
      }
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
        { renderComponentSpecificProperties() }
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
                selectedComponent={ selectedComponent }
                onTreeComponentSelect={ onTreeComponentSelect }
                onAddComponentClick={ onAddComponentClick }
              />
            </div>
          </ElementNavigationPane>
          <EditorView>
            { renderEditor() }
          </EditorView>
          { selectedComponent && renderElementSettingsPane() }
        </div>
        <AddNewElementDialog
          open={ addComponentDialogOpen }
          subLayouts={ subLayouts }
          siblingPath={ newComponentPath }
          onConfirm={ createComponent }
          onClose={ () => setAddComponentDialogOpen(false) }
        />
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