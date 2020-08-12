import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/components/layout-screen/layout-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, TextField, Typography, Divider } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { PageLayoutView, SubLayout } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import { Controlled as CodeMirror } from "react-codemirror2";
import codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import CommonLayoutPropertiesEditor from "../layout/editor-components/layout-common-properties-editor";
import LayoutWidgetSpecificPropertiesEditor from "../layout/editor-components/layout-widget-specific-properties-editor";
import LayoutTreeMenu from "../layout/layout-tree-menu";
import { TreeNodeInArray } from "react-simple-tree-menu";
import { constructTreeDeleteData, pushNewPageLayoutViewToTree } from "../layout/utils/tree-data-utils";
import { PageLayoutWidgetType } from "../../generated/client/models/PageLayoutWidgetType";
import PanZoom from "../generic/pan-zoom";
import { setSubLayouts, setSelectedSubLayout } from "../../actions/subLayouts";
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import "react-resizable/css/styles.css";
import PagePreview from "../preview/page-preview";
import DisplayMetrics from "../../types/display-metrics";

type View = "CODE" | "VISUAL";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  subLayoutId: string;
  subLayout?: SubLayout;
  subLayouts: SubLayout[];
  setSubLayouts: typeof setSubLayouts;
  setSelectedSubLayout: typeof setSelectedSubLayout;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  name: string;
  jsonCode: string;
  xmlCode: string;
  toolbarOpen: boolean;
  deleteOpen: boolean;
  view: View;
  pageLayoutView?: PageLayoutView;
  selectedPropertyPath?: string;
  selectedWidgetType?: PageLayoutWidgetType;
  panelOpen: boolean;
  resizing: boolean;
  height: number;
  width: number;
}

/**
 * Component for sub layout screen
 */
export class SubLayoutScreen extends React.Component<Props, State> {

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
      jsonCode: JSON.stringify({}, null, 2),
      xmlCode: "",
      toolbarOpen: true,
      deleteOpen: false,
      view: "VISUAL",
      panelOpen: false,
      resizing: false,
      height: 500,
      width: 500
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchEditorData();
    this.setState({ loading: false });
  }

  /**
   * Component did update life-cycle handler
   *
   * @param prevProps previous component props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { subLayout } = this.props;
    if (subLayout && subLayout !== prevProps.subLayout) {
      this.setState({ jsonCode: JSON.stringify(subLayout.data, null, 2) });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history, subLayout, keycloak } = this.props;
    const { loading, pageLayoutView, selectedPropertyPath, selectedWidgetType, panelOpen, error, name, width, height } = this.state;

    if (!subLayout || !subLayout.id || loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        history={ history }
        title={ subLayout.name }
        breadcrumbs={ [] }
        actionBarButtons={ this.getActionButtons() }
        keycloak={ keycloak }
        error={ error }
        clearError={ () => this.setState({ error: undefined }) }
      >
        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.layout.title }>
            <div className={ classes.toolbarContent }>
              <TextField
                variant="filled"
                type="number"
                fullWidth
                label={ strings.subLayout.preview.width }
                value={ width }
                onChange={ this.onWidthChange }
              />
              <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />

              <TextField
                variant="filled"
                type="number"
                fullWidth
                label={ strings.subLayout.preview.height }
                value={ height }
                onChange={ this.onHeightChange }
              />
              <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />

              <TextField
                variant="filled"
                fullWidth
                label={ strings.layout.toolbar.name }
                value={ name }
                onChange={ this.onNameChange }
              />
              { this.renderSubLayoutComponentStructure() }
            </div>
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditor() }
          </EditorView>

          <ElementSettingsPane open={ panelOpen } width={ 420 } title={ `${ pageLayoutView?.widget } ${ strings.layout.properties.title }` }>
            { pageLayoutView && selectedPropertyPath &&
              <CommonLayoutPropertiesEditor
                editingSubLayout={ true }
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
   * Renders sub layout component structure
   */
  private renderSubLayoutComponentStructure = () => {
    const { subLayout } = this.props;

    if (!subLayout) {
      return null;
    }

    return (
      <LayoutTreeMenu
        editingSubLayout={ true }
        subLayouts={ [] }
        onSelect={ this.onLayoutPageViewSelect }
        onAdd={ this.onSubLayoutViewAdd }
        onDelete={ this.onLayoutViewDelete }
        treeData={ this.constructTreeData(subLayout) }
      />
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
    const { classes } = this.props;
    const { resizing, height, width } = this.state;

    const view: PageLayoutView = JSON.parse(this.state.jsonCode);

    /**
     * Easiest way for now is to fake display metrics for preview.
     * TODO: Must add logic for calculating pixel density based on the size of the preview
     */
    const displayMetrics: DisplayMetrics = {
      density: 3,
      heightPixels: height,
      widthPixels: width,
      xdpi: 515,
      ydpi: 515,
      densityDpi: 480
    };
    const scale = 1;

    return (
      <div className={ classes.editors }>
        <PanZoom minScale={ 0.1 } fitContent={ false } contentWidth={ width } contentHeight={ height } disabled={ resizing }>

          <ResizableBox
            width={ width }
            height={ height }
            resizeHandles={ [ 's', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne'] }
            onResizeStart={ this.onResizeStart }
            onResizeStop={ this.onResizeStop }
          >
            <PagePreview
              view={ view }
              displayMetrics={ displayMetrics }
              scale={ scale }
            />
          </ResizableBox>
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
    return [
      { name: this.state.view === "CODE" ?
          strings.exhibitionLayouts.editView.switchToVisualButton :
          strings.exhibitionLayouts.editView.switchToCodeButton, action: this.onSwitchViewClick },
      { name: strings.exhibitionLayouts.editView.importButton, action: this.onImportClick },
      { name: strings.exhibitionLayouts.editView.saveButton, action: this.onSaveClick },
    ];
  }

  private onResizeStart = () => {
    this.setState({
      resizing: true
    });
  }

  private onResizeStop = (e: React.SyntheticEvent<Element, Event>, data: ResizeCallbackData) => {
    this.setState({
      width: data.size.width,
      height: data.size.height,
      resizing: false
    });
  }

  /**
   * Fetches editor data
   */
  private fetchEditorData = async () => {
    const { subLayoutId, subLayout, accessToken } = this.props;

    if (!subLayout) {
      const subLayoutsApi = Api.getSubLayoutsApi(accessToken);
      const foundSubLayout = await subLayoutsApi.findSubLayout({ subLayoutId: subLayoutId });
      this.props.setSelectedSubLayout(foundSubLayout);
      this.setState({
        name: foundSubLayout.name,
        jsonCode: JSON.stringify(foundSubLayout.data, null, 2),
      });
    } else {
      this.setState({
        name: subLayout.name,
        jsonCode: JSON.stringify(subLayout.data, null, 2),
      });
    }
  }

  /**
   * Constructs tree data
   *
   * @param dataParams tree data params
   * @returns array of tree nodes in array
   */
  private constructTreeData = (subLayout: SubLayout): TreeNodeInArray[] => {
    const path = subLayout.data.id;
    const type = subLayout.data.widget;
    const treeData = [{
      key: subLayout.data.id,
      path: path,
      label: subLayout.data.widget,
      element: subLayout.data,
      type: type,
      onSelect: () => this.onLayoutPageViewSelect(subLayout.data, type, path),
      parents: [ ],
      nodes: subLayout.data.children.map(child => {
        return this.getNode(path, subLayout.data, child);
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
      name: event.target.value
    });
  }

  /**
   * Event handler for width input change
   *
   * @param event event
   */
  private onWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      width: Number(event.target.value)
    });
  }

  /**
   * Event handler for height input change
   *
   * @param event event
   */
  private onHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      height: Number(event.target.value)
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
      jsonCode: value
    });
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const subLayout = {
      ...this.props.subLayout,
      name: this.state.name,
      data: JSON.parse(this.state.jsonCode)
    };

    this.onSubLayoutSave(subLayout);
  }

  /**
   * Event handler for layout save
   *
   * @param layout layout
   */
  private onSubLayoutSave = async (subLayout: SubLayout) => {
    const { accessToken, subLayouts, setSubLayouts } = this.props;

    try {
      const subLayoutsApi = Api.getSubLayoutsApi(accessToken);
      const subLayoutId = subLayout.id!;

      const updatedSubLayout = await subLayoutsApi.updateSubLayout({
        subLayoutId: subLayoutId,
        subLayout: subLayout
      });

      const filteredSubLayouts = subLayouts.filter(layout => layout.id !== updatedSubLayout.id);
      setSubLayouts([ ...subLayouts, updatedSubLayout ]);

      this.setState({
        jsonCode: JSON.stringify(updatedSubLayout.data, null, 2)
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
  private onSubLayoutViewAdd = async (layoutView: PageLayoutView, path: string) => {
    const { subLayout } = this.props;
    if (!subLayout) {
      return;
    }

    const updatedSubLayout = pushNewPageLayoutViewToTree(subLayout, layoutView, path);
    this.props.setSelectedSubLayout(updatedSubLayout);
    this.setState({ jsonCode: JSON.stringify(updatedSubLayout.data, null, 2) });
  }

  /**
   * Event handler for layout view delete
   *
   * @param path path in tree structure
   */
  private onLayoutViewDelete = async (path: string) => {
    const { subLayout } = this.props;
    if (!subLayout) {
      return;
    }

    const updatedSubLayout = constructTreeDeleteData(subLayout, path);
    this.props.setSelectedSubLayout(updatedSubLayout);
    this.setState({ jsonCode: JSON.stringify(updatedSubLayout.data, null, 2) });
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
    subLayout: state.subLayouts.selectedSubLayout as SubLayout,
    subLayouts: state.subLayouts.subLayouts
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setSelectedSubLayout: (subLayout: SubLayout) => dispatch(setSelectedSubLayout(subLayout)),
    setSubLayouts: (subLayouts: SubLayout[]) => dispatch(setSubLayouts(subLayouts))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SubLayoutScreen));
