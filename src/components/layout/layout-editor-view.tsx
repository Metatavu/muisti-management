import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/layout-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, TextField, Select, MenuItem, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, InputLabel } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { PageLayout, PageLayoutView, PageLayoutViewPropertyType, Exhibition, DeviceModel, ScreenOrientation } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import PagePreview from "../preview/page-preview";
import { AccessToken, PageLayoutElementType } from '../../types';
import strings from "../../localization/strings";
import { Controlled as CodeMirror } from "react-codemirror2";
import codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import AndroidUtils from "../../utils/android-utils";
import CommonLayoutPropertiesEditor from "./editor-components/layout-common-properties-editor";
import LayoutWidgetSpecificPropertiesEditor from "./editor-components/layout-widget-specific-properties-editor";
import LayoutEditorTreeMenu from "./layout-tree-menu";

type View = "CODE" | "VISUAL";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  layouts: PageLayout[];
  deviceModels: DeviceModel[];
  layout?: PageLayout;
  layoutId: string;
  setSelectedLayout: typeof setSelectedLayout;
  setLayouts: typeof setLayouts;
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
  selectedPropertyPath? : string;
  selectedWidgetType?: PageLayoutElementType;
}

/**
 * Component for exhibition view
 */
export class LayoutEditorView extends React.Component<Props, State> {

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
      view: "VISUAL"
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public async componentDidMount() {
    const { layout, layoutId, accessToken } = this.props;

    if (!layout || layoutId === layout.id) {
      const layoutsApi = Api.getPageLayoutsApi(accessToken);
      this.props.setSelectedLayout(await layoutsApi.findPageLayout({ pageLayoutId: layoutId }));
    }

    this.updateEditorData();
  }

  /**
   * Component did update life-cycle handler
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.layout !== this.props.layout) {
      this.updateEditorData();
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, layout, history } = this.props;
    const { pageLayoutView, selectedPropertyPath, selectedWidgetType } = this.state;

    if (!layout || !layout.id || this.state.loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        history={ history }
        title={ layout.name }
        breadcrumbs={ [] }
        actionBarButtons={ [] }
        onDashboardButtonClick={() => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.layout.title }>
            <div className={ classes.toolbarContent }>
              <TextField fullWidth label={ strings.layout.toolbar.name } value={ this.state.name } onChange={ this.onNameChange }/>
              { this.renderDeviceModelSelect() }
              { this.renderScreenOrientationSelect() }
              { this.renderPageLayoutComponentStructure() }
            </div>
          </ElementNavigationPane>
          <EditorView>
            { this.renderToolbar() }
            { this.renderEditor() }
            { this.renderDeleteDialog() }
          </EditorView>

          <ElementSettingsPane minWidth={ 420 } title={ strings.layout.properties.title }>
            { pageLayoutView && selectedPropertyPath && 
              <CommonLayoutPropertiesEditor
                pageLayoutView={ pageLayoutView }
                selectedElementPath={ selectedPropertyPath }
              />
            }
            { pageLayoutView && selectedPropertyPath && selectedWidgetType &&
              <LayoutWidgetSpecificPropertiesEditor
                pageLayoutView={ pageLayoutView }
                selectedElementPath={ selectedPropertyPath }
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
      <MenuItem key={ model.id } value={ model.id }>{ `${model.manufacturer} ${model.model}` }</MenuItem>
    );

    return (
      <div className={ classes.select }>
        <InputLabel id="deviceModelId">{ strings.layout.settings.deviceModelId }</InputLabel>
        <Select
          fullWidth
          variant="filled"
          labelId="deviceModelId"
          value={ this.state.deviceModelId }
          onChange={ this.onDeviceModelChange }
        >
        { deviceModelSelectItems }
        </Select>
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
        <InputLabel id="screenOrientation">{ strings.layout.settings.screenOrientation }</InputLabel>
        <Select
          fullWidth
          variant="filled"
          labelId="screenOrientation"
          value={ this.state.screenOrientation }
          onChange={ this.onScreenOrientationChange }
        >
          <MenuItem value={ ScreenOrientation.Portrait }>{ strings.layout.settings.portrait }</MenuItem>
          <MenuItem value={ ScreenOrientation.Landscape }>{ strings.layout.settings.landscape }</MenuItem>
        </Select>
      </div>
    );
  }

  private renderPageLayoutComponentStructure = () => {
    const { layout } = this.props;

    if (!layout) {
      return (<div/>);
    }

    return (
      <LayoutEditorTreeMenu
        onSelect={ this.onLayoutPageViewSelect }
      />
    );
  } 

  /**
   * Renders a toolbar
   */
  private renderToolbar = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.toolBar }>
        <Button disableElevation variant="contained" color="secondary" onClick={ this.onSwitchViewClick } style={{ marginRight: 8 }}>
          { this.state.view === "CODE" ? strings.exhibitionLayouts.editView.switchToVisualButton : strings.exhibitionLayouts.editView.switchToCodeButton }
        </Button>
        <div>
          <Button disableElevation variant="contained" color="secondary" onClick={ this.onImportClick } style={{ marginRight: 8 }}>
            { strings.exhibitionLayouts.editView.importButton }
          </Button>
          <Button disableElevation variant="contained" color="secondary" onClick={ this.onSaveClick } style={{ marginRight: 8 }}>
            { strings.exhibitionLayouts.editView.saveButton }
          </Button>
          <Button disableElevation variant="contained" color="primary" onClick={ this.onDeleteClick }>
            { strings.exhibitionLayouts.editView.deleteButton }
          </Button>
        </div>
      </div>
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
    )
  }

  /**
   * Renders a visual editor view
   */
  private renderVisualEditor = () => {
    const { classes, deviceModels } = this.props;
    if (deviceModels.length === 0) {
      return;
    }

    const view: PageLayoutView = JSON.parse(this.state.jsonCode);
    // TODO: load from layout
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModels[0]);
    const scale = 0.3;
    const screenOrientation = this.state.screenOrientation;

    return (
      <div className={ classes.editors }>
        <PagePreview view={ view } displayMetrics={ displayMetrics } scale={ scale } screenOrientation={ screenOrientation }/>
      </div>
    );
  }

  /**
   * Renders delete dialog when needed
   */
  private renderDeleteDialog = () => {
    const labelId = "alert-dialog-title";
    const descriptionId = "alert-dialog-description";

    return (
      <Dialog open={this.state.deleteOpen} onClose={ this.onDeleteDialogClose } aria-labelledby={ labelId } aria-describedby={ descriptionId }>
        <DialogTitle id={ labelId }>{ strings.exhibitionLayouts.editView.deleteConfirmTitle }</DialogTitle>
        <DialogContent>
          <DialogContentText id={ descriptionId }>{ strings.exhibitionLayouts.editView.deleteConfirmText }</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={ this.onDeleteDialogCancelButtonClick } color="primary">{ strings.exhibitionLayouts.editView.deleteConfirmCancel }</Button>
          <Button onClick={ this.onDeleteDialogDeleteButtonClick } color="primary" autoFocus>{ strings.exhibitionLayouts.editView.deleteConfirmDelete }</Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Updates editor data
   */
  private updateEditorData = () => {
    const { layout } = this.props;
    if (!layout) {
      return;
    }

    this.setState({
      name: layout.name,
      jsonCode: JSON.stringify(layout.data, null, 2),
      screenOrientation: layout.screenOrientation,
      deviceModelId: layout.modelId || "",
    });
  }

  /**
   * Handles element selected from layout navigation tree
   *
   * @param element selected page layout view item
   * @param type type of the element
   * @param path path to the selected element inside the tree structure
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  private onLayoutPageViewSelect = (element: PageLayoutView, type: PageLayoutElementType, path: string) => {
    this.setState({
      pageLayoutView : element,
      selectedPropertyPath: path,
      selectedWidgetType: type
    });
  }


  /**
   * Attempts to guess property type from given value. Method falls back to string
   *
   * @param value value
   * @return type
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  private guessPropertyType = (value: string): PageLayoutViewPropertyType => {
    if (this.isNumber(value as any)) {
      return PageLayoutViewPropertyType.Number;
    }

    if (value === "true" || value === "false") {
      return PageLayoutViewPropertyType.Boolean;
    }

    return PageLayoutViewPropertyType.String;
  }

  /**
   * Returns whether string contains valid number
   *
   * @return whether string contains valid number
   */
  private isNumber = (value: string): boolean => {
    return !!/^[0-9.]+$/.exec(value);
  }

  /**
   * Event handler for delete dialog delete button click event
   */
  private onDeleteDialogDeleteButtonClick = () => {
    if (!this.props.layout) {
      return;
    }

    this.onLayoutDelete(this.props.layout);
  }

  /**
   * Event handler for delete dialog close button click event
   */
  private onDeleteDialogCancelButtonClick = () => {
    this.setState({
      deleteOpen: false
    });
  }

  /**
   * Event handler for delete dialog close event
   */
  private onDeleteDialogClose = () => {
    this.setState({
      deleteOpen: false
    });
  }

  /**
   * Event handler for import click event
   */
  private onImportClick = () => {
    alert("Clicked import");
  }

  /**
   * Event handler for delete click event
   */
  private onDeleteClick = () => {
    this.setState({
      deleteOpen: true
    });
  }

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      name: event.target.value
    });
  }

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   * @param _child child node
   */
  private onScreenOrientationChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>, _child: React.ReactNode) => {
    this.setState({
      screenOrientation: e.target.value as ScreenOrientation
    });
  }

  /**
   * Event handler for device model select change
   *
   * @param event event
   * @param _child child node
   */
  private onDeviceModelChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      deviceModelId: event.target.value as string
    });
  }

  /**
   * Event handler for before JSON code change event
   *
   * @param editor editor instance
   * @param data editor data
   * @param value code
   */
  private onBeforeJsonCodeChange = (_editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) => {
    this.setState({
      jsonCode: value
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
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for layout delete
   *
   * @param layout layout
   */
  private onLayoutDelete = async (layout: PageLayout) => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(this.props.accessToken);
      const pageLayoutId = layout.id!;

      await pageLayoutsApi.deletePageLayout({
        pageLayoutId: pageLayoutId
      });

      this.props.setLayouts(
        this.props.layouts.filter(item => item.id !== pageLayoutId)
      );

      this.props.history.replace("/dashboard/layouts", this.props.history);
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Event listener for switch view button click
   */
  private onSwitchViewClick = () => {
    this.setState({
      view: this.state.view === "CODE" ? "VISUAL" : "CODE"
    });
  }

  /**
   * Handle dashboard click
   */
  private onDashboardButtonClick = () => {
    this.props.history.push(`/dashboard/overview`);
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutEditorView));
