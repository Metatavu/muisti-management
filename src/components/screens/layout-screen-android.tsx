import { setLayouts, setSelectedLayout } from "../../actions/layouts";
import Api from "../../api/api";
import {
  DeviceModel,
  Exhibition,
  LayoutType,
  PageLayout,
  PageLayoutView,
  ScreenOrientation,
  SubLayout
} from "../../generated/client";
import { PageLayoutWidgetType } from "../../generated/client/models/PageLayoutWidgetType";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/components/layout-screen/layout-editor-view";
import theme from "../../styles/theme";
import { AccessToken, ActionButton, ConfirmDialogData } from "../../types";
import AndroidUtils from "../../utils/android-utils";
import EditorView from "../editor/editor-view";
import ConfirmDialog from "../generic/confirm-dialog";
import PanZoom from "../generic/pan-zoom";
import CommonLayoutPropertiesEditor from "../layout/editor-components/layout-common-properties-editor";
import LayoutWidgetSpecificPropertiesEditor from "../layout/editor-components/layout-widget-specific-properties-editor";
import LayoutTreeMenu from "../layout/layout-tree-menu";
import {
  constructTreeDeleteData,
  pushNewPageLayoutViewToTree
} from "../layout/utils/tree-data-utils";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import ElementSettingsPane from "../layouts/element-settings-pane";
import PagePreview from "../preview/page-preview";
import { json } from "@codemirror/lang-json";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import CodeMirror from "@uiw/react-codemirror";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { TreeNodeInArray } from "react-simple-tree-menu";
import { Dispatch } from "redux";

type View = "CODE" | "VISUAL";

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
  confirmDialogOpen: boolean;
  confirmDialogData: ConfirmDialogData;
}

/**
 * Component for android layout screen
 */
export class LayoutScreenAndroid extends React.Component<Props, State> {
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
      dataChanged: false,
      confirmDialogOpen: false,
      confirmDialogData: {
        deletePossible: true,
        title: strings.subLayout.editor.delete.deleteTitle,
        text: strings.subLayout.editor.delete.deleteText,
        onClose: this.onConfirmDialogClose,
        onCancel: this.onConfirmDialogClose,
        cancelButtonText: strings.genericDialog.cancel,
        positiveButtonText: strings.genericDialog.confirm
      }
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchEditorData();
    this.setState({ loading: false });
  };

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous component props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { layout } = this.props;
    if (layout && layout !== prevProps.layout) {
      this.setState({
        jsonCode: JSON.stringify(layout.data, null, 2)
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, history, layout, deviceModels } = this.props;
    const { loading, dataChanged } = this.state;

    if (!layout || !layout.id || loading || deviceModels.length === 0) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        history={history}
        title={layout.name}
        breadcrumbs={[]}
        actionBarButtons={this.getActionButtons()}
        keycloak={this.props.keycloak}
        error={this.state.error}
        clearError={() => this.setState({ error: undefined })}
        dataChanged={dataChanged}
        openDataChangedPrompt={true}
      >
        <div className={classes.editorLayout}>
          <ElementNavigationPane width={320} title={strings.layout.title}>
            <div style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}>
              <TextField
                label={strings.layout.toolbar.name}
                value={this.state.name}
                onChange={this.onNameChange}
              />
              {this.renderDeviceModelSelect()}
              {this.renderScreenOrientationSelect()}
              {this.renderLayoutComponentStructure()}
            </div>
          </ElementNavigationPane>
          <EditorView>{this.renderEditor()}</EditorView>
          {this.renderElementSettingsPane()}
          {this.renderConfirmationDialog()}
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders device model select
   */
  private renderDeviceModelSelect = () => {
    const { deviceModels, classes } = this.props;
    const deviceModelSelectItems = deviceModels.map((model) => (
      <MenuItem key={model.id} value={model.id}>{`${model.manufacturer} ${model.model}`}</MenuItem>
    ));

    return (
      <div className={classes.select}>
        <FormControl variant="outlined">
          <InputLabel id="deviceModelId">{strings.layout.settings.deviceModelId}</InputLabel>
          <Select
            title={strings.helpTexts.layoutEditor.selectDevice}
            label={strings.layout.settings.deviceModelId}
            labelId="deviceModelId"
            value={this.state.deviceModelId}
            onChange={this.onDeviceModelChange}
          >
            {deviceModelSelectItems}
          </Select>
        </FormControl>
      </div>
    );
  };

  /**
   * Renders screen orientation select
   */
  private renderScreenOrientationSelect = () => {
    const { classes } = this.props;

    return (
      <div className={classes.select}>
        <FormControl variant="outlined">
          <InputLabel id="screenOrientation">
            {strings.layout.settings.screenOrientation}
          </InputLabel>
          <Select
            title={strings.helpTexts.layoutEditor.selectOrientation}
            label={strings.layout.settings.screenOrientation}
            labelId="screenOrientation"
            value={this.state.screenOrientation}
            onChange={this.onScreenOrientationChange}
          >
            <MenuItem value={ScreenOrientation.Portrait}>
              {strings.layout.settings.portrait}
            </MenuItem>
            <MenuItem value={ScreenOrientation.Landscape}>
              {strings.layout.settings.landscape}
            </MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  };

  /**
   * Renders layout component structure
   */
  private renderLayoutComponentStructure = () => {
    const { layout, subLayouts } = this.props;

    if (!layout) {
      return <div />;
    }

    return (
      <Box mt={2}>
        <Typography variant="h4">{strings.layout.layoutStructure}</Typography>
        <LayoutTreeMenu
          editingSubLayout={false}
          subLayouts={subLayouts}
          onSelect={this.onLayoutPageViewSelect}
          onAdd={this.onLayoutViewAdd}
          treeData={this.constructTreeData(layout)}
        />
      </Box>
    );
  };

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
  };

  /**
   * Renders element settings pane
   */
  private renderElementSettingsPane = () => {
    const { deviceModels } = this.props;
    const { pageLayoutView, selectedPropertyPath, selectedWidgetType, panelOpen, deviceModelId } =
      this.state;

    const deviceModel = deviceModels.find((model) => model.id === deviceModelId);
    const displayMetrics = AndroidUtils.getDisplayMetrics(
      deviceModel ? deviceModel : deviceModels[0]
    );

    return (
      <ElementSettingsPane
        open={panelOpen}
        width={520}
        title={`${pageLayoutView?.widget} ${strings.layout.properties.title}`}
        menuOptions={[
          {
            name: strings.genericDialog.delete,
            action: () => this.onLayoutViewDeleteClick(selectedPropertyPath || "")
          }
        ]}
      >
        {pageLayoutView && selectedPropertyPath && (
          <CommonLayoutPropertiesEditor
            onPageLayoutViewUpdate={this.onPageLayoutViewUpdate}
            editingSubLayout={false}
            pageLayoutView={pageLayoutView}
            displayMetrics={displayMetrics}
            selectedElementPath={selectedPropertyPath}
          />
        )}
        {pageLayoutView && selectedPropertyPath && selectedWidgetType && (
          <LayoutWidgetSpecificPropertiesEditor
            onPageLayoutViewUpdate={this.onPageLayoutViewUpdate}
            editingSubLayout={false}
            pageLayoutView={pageLayoutView}
            selectedElementPath={selectedPropertyPath}
            displayMetrics={displayMetrics}
            selectedWidgetType={selectedWidgetType}
          />
        )}
      </ElementSettingsPane>
    );
  };

  /**
   * Renders code editor view
   */
  private renderCodeEditor = () => {
    const { classes } = this.props;

    return (
      <div className={classes.editors}>
        <div className={classes.editorContainer}>
          <Typography style={{ margin: 8 }}>{strings.exhibitionLayouts.editView.json}</Typography>
          <CodeMirror
            className={classes.editor}
            value={this.state.jsonCode}
            height="500px"
            style={{ overflow: "auto" }}
            extensions={[json()]}
          />
        </div>
      </div>
    );
  };

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
    const deviceModel = deviceModels.find((model) => model.id === deviceModelId);
    const displayMetrics = AndroidUtils.getDisplayMetrics(
      deviceModel ? deviceModel : deviceModels[0]
    );
    const scale = 1;

    if (!deviceModel) {
      return;
    }

    return (
      <div className={classes.editors}>
        <PanZoom
          minScale={0.1}
          fitContent={true}
          contentWidth={displayMetrics.widthPixels}
          contentHeight={displayMetrics.heightPixels}
        >
          <PagePreview
            view={view}
            displayMetrics={displayMetrics}
            scale={scale}
            screenOrientation={screenOrientation}
            deviceOrientation={deviceModel.screenOrientation}
          />
        </PanZoom>
      </div>
    );
  };

  /**
   * Renders confirmation dialog
   */
  private renderConfirmationDialog = () => {
    const { confirmDialogOpen, confirmDialogData } = this.state;

    return <ConfirmDialog open={confirmDialogOpen} confirmDialogData={confirmDialogData} />;
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { dataChanged } = this.state;

    return [
      {
        name:
          this.state.view === "CODE"
            ? strings.exhibitionLayouts.editView.switchToVisualButton
            : strings.exhibitionLayouts.editView.switchToCodeButton,
        action: this.onSwitchViewClick
      },
      {
        name: strings.exhibitionLayouts.editView.importButton,
        action: this.onImportClick
      },
      {
        name: strings.exhibitionLayouts.editView.saveButton,
        action: this.onSaveClick,
        disabled: !dataChanged
      }
    ];
  };

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
  };

  /**
   * Constructs tree data
   *
   * @param dataParams tree data params
   * @returns array of tree nodes in array
   */
  private constructTreeData = (pageLayout: PageLayout): TreeNodeInArray[] => {
    const data = pageLayout.data as PageLayoutView;
    const path = data.id;
    const type = data.widget;
    const treeData = [
      {
        key: data.id,
        path: path,
        label: data.widget,
        name: data.name,
        element: data,
        type: type,
        onSelect: () => this.onLayoutPageViewSelect(data, type, path),
        parents: [],
        nodes: data.children.map((child) => {
          return this.getNode(path, data, child);
        })
      }
    ];
    return treeData;
  };

  /**
   * Gets single tree node
   *
   * @param basePath node path in tree
   * @param parentPageLayoutView parent node
   * @param layoutView node
   * @returns tree node in array object
   */
  private getNode = (
    basePath: string,
    parentPageLayoutView: PageLayoutView,
    layoutView: PageLayoutView
  ): TreeNodeInArray => {
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
      parents: [parentPageLayoutView],
      nodes: layoutView.children.map((child) => {
        return this.getNode(path, layoutView, child);
      })
    };
  };

  /**
   * Handles element selected from layout navigation tree
   *
   * @param element selected page layout view item
   * @param type type of the element
   * @param path path to the selected element inside the tree structure
   */
  private onLayoutPageViewSelect = (
    element: PageLayoutView,
    type: PageLayoutWidgetType,
    path: string
  ) => {
    this.setState({
      pageLayoutView: element,
      selectedPropertyPath: path,
      selectedWidgetType: type,
      panelOpen: true
    });
  };

  /**
   * Event handler for import click event
   */
  private onImportClick = () => {
    alert("Coming soon");
  };

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
  };

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   */
  private onScreenOrientationChange = (event: SelectChangeEvent<ScreenOrientation>) => {
    this.setState({
      screenOrientation: event.target.value as ScreenOrientation,
      dataChanged: true
    });
  };

  /**
   * Event handler for device model select change
   *
   * @param event event
   */
  private onDeviceModelChange = (event: SelectChangeEvent<string>) => {
    this.setState({
      deviceModelId: event.target.value as string,
      dataChanged: true
    });
  };

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
  };

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const layout = {
      ...this.props.layout,
      name: this.state.name,
      data: JSON.parse(this.state.jsonCode),
      modelId: this.state.deviceModelId,
      screenOrientation: this.state.screenOrientation,
      layoutType: LayoutType.Android
    };

    this.onLayoutSave(layout);
  };

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

      const layouts = this.props.layouts.filter((item) => item.id !== updatedLayout.id);
      this.props.setLayouts([...layouts, layout]);

      this.setState({
        jsonCode: JSON.stringify(layout.data, null, 2),
        dataChanged: false
      });
    } catch (e: any) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  };

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
  };

  /**
   * Event handler for layout view delete click
   *
   * @param path path in three structure
   */
  private onLayoutViewDeleteClick = (path: string) => {
    this.setState({
      confirmDialogOpen: true,
      confirmDialogData: {
        ...this.state.confirmDialogData,
        onConfirm: () => this.deleteLayoutView(path)
      }
    });
  };

  /**
   * Deletes layout view
   *
   * @param path path in tree structure
   */
  private deleteLayoutView = async (path: string) => {
    const { layout } = this.props;

    if (!layout) {
      return;
    }

    const updatedLayout = constructTreeDeleteData(layout, path);
    this.props.setSelectedLayout(updatedLayout);
    this.setState({
      jsonCode: JSON.stringify(updatedLayout.data, null, 2),
      confirmDialogOpen: false
    });
  };

  /**
   * Event listener for switch view button click
   */
  private onSwitchViewClick = () => {
    this.setState({
      view: this.state.view === "CODE" ? "VISUAL" : "CODE"
    });
  };

  /**
   * Event handler for confirm dialog close
   */
  private onConfirmDialogClose = () => {
    this.setState({ confirmDialogOpen: false });
  };
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(LayoutScreenAndroid));
