import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/components/layout-screen/layout-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, TextField, Select, MenuItem, Typography, InputLabel, FormControl, Box } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { PageLayout, PageLayoutView, Exhibition, DeviceModel, ScreenOrientation, SubLayout } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import PagePreview from "../preview/page-preview";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import { Controlled as CodeMirror } from "react-codemirror2";
import codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import AndroidUtils from "../../utils/android-utils";
import CommonLayoutPropertiesEditor from "../layout/editor-components/layout-common-properties-editor";
import LayoutWidgetSpecificPropertiesEditor from "../layout/editor-components/layout-widget-specific-properties-editor";
import LayoutTreeMenu from "../layout/layout-tree-menu";
import { TreeNodeInArray } from "react-simple-tree-menu";
import { constructTreeDeleteData, pushNewPageLayoutViewToTree } from "../layout/utils/tree-data-utils";
import { PageLayoutWidgetType } from "../../generated/client/models/PageLayoutWidgetType";
import PanZoom from "../generic/pan-zoom";
import theme from "../../styles/theme";

type View = "CODE" | "VISUAL";

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
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  name: string;
  jsonCode: string;
  deviceModelId: string;
  screenOrientation: ScreenOrientation;
  xmlCode: string;
  toolbarOpen: boolean;
  deleteOpen: boolean;
  view: View;
  pageLayoutView?: PageLayoutView;
  selectedPropertyPath?: string;
  selectedWidgetType?: PageLayoutWidgetType;
  panelOpen: boolean;
  dataChanged: boolean;
}

/**
 * Component for layout screen
 */
export class LayoutScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      name: "",
      deviceModelId: "",
      screenOrientation: ScreenOrientation.Portrait,
      jsonCode: JSON.stringify({}, null, 2),
      xmlCode: "",
      toolbarOpen: true,
      deleteOpen: false,
      view: "VISUAL",
      panelOpen: false,
      dataChanged: false
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchEditorData();
    this.setState({ loading: false });
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous component props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { layout } = this.props;
    if (layout && layout !== prevProps.layout) {
      this.setState({
        jsonCode: JSON.stringify(layout.data, null, 2),
      });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history, layout, deviceModels } = this.props;
    const {
      loading,
      pageLayoutView,
      selectedPropertyPath,
      selectedWidgetType,
      panelOpen,
      deviceModelId,
      dataChanged
    } = this.state;

    if (!layout || !layout.id || loading || deviceModels.length === 0) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const deviceModel = deviceModels.find(model => model.id === deviceModelId);
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel ? deviceModel : deviceModels[0]);

    return (
      <BasicLayout
        history={ history }
        title={ layout.name }
        breadcrumbs={ [] }
        actionBarButtons={ this.getActionButtons() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }
        dataChanged={ dataChanged }
        openDataChangedPrompt={ true }
      >
        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.layout.title }>
            <div style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}>
              <TextField
                label={ strings.layout.toolbar.name }
                value={ this.state.name }
                onChange={ this.onNameChange }
              />
              { this.renderDeviceModelSelect() }
              { this.renderScreenOrientationSelect() }
              { this.renderLayoutComponentStructure() }
            </div>
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditor() }
          </EditorView>

          <ElementSettingsPane
            open={ panelOpen }
            width={ 520 }
            title={ `${ pageLayoutView?.widget } ${ strings.layout.properties.title }` }
            menuOptions={
              [
                {
                  name: strings.genericDialog.delete,
                  action: () => this.onLayoutViewDelete(selectedPropertyPath || "")
                }
              ]
            }
          >
            { pageLayoutView && selectedPropertyPath &&
              <CommonLayoutPropertiesEditor
                onPageLayoutViewUpdate={ this.onPageLayoutViewUpdate }
                editingSubLayout={ false }
                pageLayoutView={ pageLayoutView }
                displayMetrics={ displayMetrics }
                selectedElementPath={ selectedPropertyPath }
              />
            }
            { pageLayoutView && selectedPropertyPath && selectedWidgetType &&
              <LayoutWidgetSpecificPropertiesEditor
                onPageLayoutViewUpdate={ this.onPageLayoutViewUpdate }
                editingSubLayout={ false }
                pageLayoutView={ pageLayoutView }
                selectedElementPath={ selectedPropertyPath }
                displayMetrics={ displayMetrics }
                selectedWidgetType={ selectedWidgetType }
              />
            }
          </ElementSettingsPane>
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders device model select
   */
  private renderDeviceModelSelect = () => {
    const { deviceModels, classes } = this.props;
    const deviceModelSelectItems = deviceModels.map(model =>
      <MenuItem key={ model.id } value={ model.id }>{ `${ model.manufacturer } ${ model.model }` }</MenuItem>
    );

    return (
      <div className={ classes.select }>
        <FormControl variant="outlined">
          <InputLabel id="deviceModelId">{ strings.layout.settings.deviceModelId }</InputLabel>
          <Select
            title={ strings.helpTexts.layoutEditor.selectDevice }
            label={ strings.layout.settings.deviceModelId }
            labelId="deviceModelId"
            value={ this.state.deviceModelId }
            onChange={ this.onDeviceModelChange }
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
  private renderScreenOrientationSelect = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.select }>
        <FormControl variant="outlined">
          <InputLabel id="screenOrientation">{ strings.layout.settings.screenOrientation }</InputLabel>
          <Select
            title={ strings.helpTexts.layoutEditor.selectOrientation }
            label={ strings.layout.settings.screenOrientation }
            labelId="screenOrientation"
            value={ this.state.screenOrientation }
            onChange={ this.onScreenOrientationChange }
            >
            <MenuItem value={ ScreenOrientation.Portrait }>{ strings.layout.settings.portrait }</MenuItem>
            <MenuItem value={ ScreenOrientation.Landscape }>{ strings.layout.settings.landscape }</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }

  /**
   * Renders layout component structure
   */
  private renderLayoutComponentStructure = () => {
    const { layout, subLayouts } = this.props;

    if (!layout) {
      return (<div/>);
    }

    return (
      <Box mt={ 2 }>
        <Typography variant="h4">
          { strings.layout.layoutStructure }
        </Typography>
        <LayoutTreeMenu
          editingSubLayout={ false }
          subLayouts={ subLayouts }
          onSelect={ this.onLayoutPageViewSelect }
          onAdd={ this.onLayoutViewAdd }
          treeData={ this.constructTreeData(layout) }
        />
      </Box>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditor = () => {
    switch (this.state.view) {
      case "CODE":
        return this.renderCodeEditor();
      case "VISUAL":
        return this.renderVisualEditor();
      default:
        return null;
    }
  }

  /**
   * Renders code editor view
   */
  private renderCodeEditor = () => {
    const { classes } = this.props;

    const jsonEditorOptions = {
      mode: "javascript",
      theme: "material",
      lineNumbers: true
    };

    return (
      <div className={ classes.editors }>
        <div className={ classes.editorContainer }>
          <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.json }</Typography>
          <CodeMirror className={ classes.editor }
            value={ this.state.jsonCode }
            options={ jsonEditorOptions }
            onBeforeChange={ this.onBeforeJsonCodeChange } />
        </div>
      </div>
    );
  }

  /**
   * Renders a visual editor view
   */
  private renderVisualEditor = () => {
    const { classes, deviceModels } = this.props;
    const { deviceModelId, screenOrientation } = this.state;
    if (deviceModels.length === 0) {
      return;
    }

    const view: PageLayoutView = JSON.parse(this.state.jsonCode);
    const deviceModel = deviceModels.find(model => model.id === deviceModelId);
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel ? deviceModel : deviceModels[0]);
    const scale = 1;

    if (!deviceModel) {
      return;
    }

    return (
      <div className={ classes.editors }>
        <PanZoom minScale={ 0.1 } fitContent={ true } contentWidth={ displayMetrics.widthPixels } contentHeight={ displayMetrics.heightPixels }>
          <PagePreview
            view={ view }
            displayMetrics={ displayMetrics }
            scale={ scale }
            screenOrientation={ screenOrientation }
            deviceOrientation={ deviceModel.screenOrientation }
          />
        </PanZoom>
      </div>
    );
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { dataChanged } = this.state;

    return [
      {
        name: this.state.view === "CODE" ?
        strings.exhibitionLayouts.editView.switchToVisualButton :
        strings.exhibitionLayouts.editView.switchToCodeButton,
        action: this.onSwitchViewClick,
      },
      {
        name: strings.exhibitionLayouts.editView.importButton,
        action: this.onImportClick
      },
      {
        name: strings.exhibitionLayouts.editView.saveButton,
        action: this.onSaveClick,
        disabled : !dataChanged
      },
    ];
  }

  /**
   * Fetches editor data
   */
  private fetchEditorData = async () => {
    const { layoutId, layout, accessToken } = this.props;

    if (!layout) {
      const layoutsApi = Api.getPageLayoutsApi(accessToken);
      const layout = await layoutsApi.findPageLayout({ pageLayoutId: layoutId });
      this.props.setSelectedLayout(layout);
      this.setState({
        name: layout.name,
        jsonCode: JSON.stringify(layout.data, null, 2),
        screenOrientation: layout.screenOrientation,
        deviceModelId: layout.modelId || ""
      });
    } else {
      this.setState({
        name: layout.name,
        jsonCode: JSON.stringify(layout.data, null, 2),
        screenOrientation: layout.screenOrientation,
        deviceModelId: layout.modelId || ""
      });
    }
  }

  /**
   * Constructs tree data
   *
   * @param dataParams tree data params
   * @returns array of tree nodes in array
   */
  private constructTreeData = (pageLayout: PageLayout): TreeNodeInArray[] => {
    const path = pageLayout.data.id;
    const type = pageLayout.data.widget;
    const treeData = [{
      key: pageLayout.data.id,
      path: path,
      label: pageLayout.data.widget,
      name: pageLayout.data.name,
      element: pageLayout.data,
      type: type,
      onSelect: () => this.onLayoutPageViewSelect(pageLayout.data, type, path),
      parents: [ ],
      nodes: pageLayout.data.children.map(child => {
        return this.getNode(path, pageLayout.data, child);
      })
    }];
    return treeData;
  }

  /**
   * Gets single tree node
   *
   * @param basePath node path in tree
   * @param parentPageLayoutView parent node
   * @param layoutView node
   * @returns tree node in array object
   */
  private getNode = (basePath: string, parentPageLayoutView: PageLayoutView, layoutView: PageLayoutView): TreeNodeInArray => {
    const path = `${basePath}/${layoutView.id}`;
    const type = layoutView.widget;

    return {
      key: layoutView.id,
      path: path,
      label: layoutView.widget,
      name: layoutView.name,
      element: layoutView,
      type: type,
      onSelect: () => this.onLayoutPageViewSelect(layoutView, type, path),
      parents: [ parentPageLayoutView ],
      nodes: layoutView.children.map(child => {
        return this.getNode(path, layoutView, child);
      })
    };
  }

  /**
   * Handles element selected from layout navigation tree
   *
   * @param element selected page layout view item
   * @param type type of the element
   * @param path path to the selected element inside the tree structure
   */
  private onLayoutPageViewSelect = (element: PageLayoutView, type: PageLayoutWidgetType, path: string) => {
    this.setState({
      pageLayoutView: element,
      selectedPropertyPath: path,
      selectedWidgetType: type,
      panelOpen: true
    });
  }

  /**
   * Event handler for import click event
   */
  private onImportClick = () => {
    alert("Coming soon");
  }

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: event.target.value,
      dataChanged: true
    });
  }

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   */
  private onScreenOrientationChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    this.setState({
      screenOrientation: event.target.value as ScreenOrientation,
      dataChanged: true
    });
  }

  /**
   * Event handler for device model select change
   *
   * @param event event
   */
  private onDeviceModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      deviceModelId: event.target.value as string,
      dataChanged: true
    });
  }

  /**
   * Event handler for before JSON code change event
   *
   * @param editor editor instance
   * @param data editor data
   * @param value code
   */
  private onBeforeJsonCodeChange = (editor: codemirror.Editor, data: codemirror.EditorChange, value: string) => {
    this.setState({
      jsonCode: value,
      dataChanged: true
    });
  }

  /**
   * On page layout view update handler
   *
   * @param pageLayoutView page layout view to update
   */
  private onPageLayoutViewUpdate = (pageLayoutView: PageLayoutView) => {
    this.setState({
      pageLayoutView,
      dataChanged: true
    });
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const layout = {
      ...this.props.layout,
      name: this.state.name,
      data: JSON.parse(this.state.jsonCode),
      modelId: this.state.deviceModelId,
      screenOrientation: this.state.screenOrientation
    };

    this.onLayoutSave(layout);
  }

  /**
   * Event handler for layout save
   *
   * @param layout layout
   */
  private onLayoutSave = async (layout: PageLayout) => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(this.props.accessToken);
      const pageLayoutId = layout.id!;

      const updatedLayout = await pageLayoutsApi.updatePageLayout({
        pageLayoutId: pageLayoutId,
        pageLayout: layout
      });

      const layouts = this.props.layouts.filter(item => item.id !== updatedLayout.id);
      this.props.setLayouts([ ...layouts, layout ]);

      this.setState({
        jsonCode: JSON.stringify(layout.data, null, 2),
        dataChanged: false
      });
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for layout view add
   *
   * @param layoutView layout view
   * @param path path in tree structure
   */
  private onLayoutViewAdd = async (layoutView: PageLayoutView, path: string) => {
    const { layout } = this.props;

    if (!layout) {
      return;
    }

    const updatedLayout = pushNewPageLayoutViewToTree(layout, layoutView, path);
    this.props.setSelectedLayout(updatedLayout);
    this.setState({
      jsonCode: JSON.stringify(updatedLayout.data, null, 2),
      dataChanged: true
    });
  }

  /**
   * Event handler for layout view delete
   *
   * @param path path in tree structure
   */
  private onLayoutViewDelete = async (path: string) => {
    const { layout } = this.props;

    // TODO: Add better confirmation dialog
    if (!layout || !window.confirm(strings.generic.confirmDelete)) {
      return;
    }

    const updatedLayout = constructTreeDeleteData(layout, path);
    this.props.setSelectedLayout(updatedLayout);
    this.setState({ jsonCode: JSON.stringify(updatedLayout.data, null, 2) });
  }

  /**
   * Event listener for switch view button click
   */
  private onSwitchViewClick = () => {
    this.setState({
      view: this.state.view === "CODE" ? "VISUAL" : "CODE"
    });
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
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
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
    setLayouts: (layouts: PageLayout[]) => dispatch(setLayouts(layouts))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutScreen));
