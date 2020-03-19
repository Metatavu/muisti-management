import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/layout-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, IconButton, TextField, Select, MenuItem, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { PageLayout, PageLayoutView, PageLayoutViewPropertyType, PageLayoutViewProperty, Exhibition, ExhibitionDeviceModel } from "../../generated/client";
import BasicLayout from "../generic/basic-layout";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import PagePreview from "../preview/page-preview";
import { AccessToken } from '../../types';
import classNames from "classnames";
import CloseIcon from "@material-ui/icons/ChevronLeftSharp";
import OpenIcon from "@material-ui/icons/ChevronRightSharp";
import strings from "../../localization/strings";
import { v4 as uuidv4 } from "uuid";
import { Controlled as CodeMirror } from "react-codemirror2";
import codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/xml/xml";
import { parse as parseXML } from "fast-xml-parser";
import AndroidUtils from "../../utils/android-utils";

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
  xmlCode: string;
  toolbarOpen: boolean;
  deleteOpen: boolean;
  view: View;
  deviceModels: ExhibitionDeviceModel[];
}

const minWidth = 320;
const minimizedWidth = 50;

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
      jsonCode: "{}",
      xmlCode: "",
      toolbarOpen: true,
      deleteOpen: false,
      view: "VISUAL",
       deviceModels: []
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    const { layout, layoutId, accessToken } = this.props;

    if (!layout || layoutId === layout.id) {
      const layoutsApi = Api.getPageLayoutsApi(accessToken);
      this.props.setSelectedLayout(await layoutsApi.findPageLayout({ pageLayoutId: layoutId }));
    }

    const exhibitionDeviceModelsApi = Api.getExhibitionDeviceModelsApi(accessToken);
    const deviceModels = await exhibitionDeviceModelsApi.listExhibitionDeviceModels({ exhibitionId: this.props.exhibitions[0].id || "" });
    this.setState({ deviceModels });
  }

  /**
   * Component did update life-cycle handler
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (!prevProps || !this.props.layout || prevProps.layout) {
      return;
    }

    this.setState({
      name: this.props.layout.name,
      jsonCode: JSON.stringify(this.props.layout.data, null, 2)
    });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, layout } = this.props;

    if (!layout || !layout.id || this.state.loading ) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    return (
      <BasicLayout
        title={ layout.name }
        onBackButtonClick={() => this.onBackButtonClick() }
        onDashboardButtonClick={() => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title="Asettelu" />
          <EditorView>
            { this.renderEditorView() }
          </EditorView>
          <ElementSettingsPane title="Ominaisuudet" />
        </div>

      </BasicLayout>
    );
  }

  /**
   * Render editor view
   */
  public renderEditorView() {
    const { classes } = this.props;

    return (
      <div className={ classes.root }>
        <div className={ classes.panel } style={{ width: this.state.toolbarOpen ? minWidth : minimizedWidth }}>
          <div className={ classes.btnContainer }>
            <IconButton size="small" edge="start" onClick={ this.onToggleClick }>
              { this.state.toolbarOpen ? <CloseIcon /> : <OpenIcon /> }
            </IconButton>
          </div>
          <div className={ classNames( classes.container, this.state.toolbarOpen ? "" : "closed" ) }>
            <div className={ classes.header }>
              <h3>Layout</h3>
            </div>
            <div className={ classes.toolbarContent }>
              <TextField fullWidth label="Name" value={ this.state.name } onChange={ this.onNameChange }/>
            </div>
          </div>
        </div>
        <div className={ classes.content }>
          { this.renderToolbar() }
          { this.renderEditor() }
        </div>
        { this.renderDeleteDialog() }
      </div>
    );
  }

  /**
   * Renders a toolbar
   */
  private renderToolbar = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.toolBar }>
        <Select value={ this.state.view } onChange={ this.onViewChange }>
          <MenuItem value={ "CODE" }> Code </MenuItem>
          <MenuItem value={ "VISUAL" }> Visual </MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={ this.onDeleteClick } style={{ marginRight: 8 }}>
          { strings.exhibitionLayouts.editView.deleteButton }
        </Button>
        <Button variant="contained" color="primary" onClick={ this.onImportClick } style={{ marginRight: 8 }}>
          { strings.exhibitionLayouts.editView.importButton }
        </Button>
        <Button variant="contained" color="primary" onClick={ this.onSaveClick }>
          { strings.exhibitionLayouts.editView.saveButton }
        </Button>
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

    const xmlEditorOptions = {
      mode: "xml",
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
        <div className={ classes.editorContainer }>
          <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.xml }</Typography>
          <CodeMirror className={ classes.editor }
            value={ this.state.xmlCode }
            options={ xmlEditorOptions }
            onBeforeChange={ this.onBeforeXmlCodeChange } />
        </div>
      </div>
    )
  }

  /**
   * Renders a visual editor view
   */
  private renderVisualEditor = () => {
    const { classes } = this.props;
    const { deviceModels } = this.state;
    if (deviceModels.length === 0) {
      return;
    }
    const view: PageLayoutView = JSON.parse(this.state.jsonCode);
    // TODO: load from layout
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModels[0]);
    const scale = 0.3;

    return (
      <div className={ classes.editors}>
        <PagePreview view={ view } displayMetrics={ displayMetrics } scale={ scale }/>
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
   * Converts widget XML into page layout view
   *
   * @param widgetXmls array XML blocks
   * @param widget widget name
   */
  private xmlToView(widgetXmls: any[], widget: string): PageLayoutView[] {
    return widgetXmls.map(widgetXml => {
      const attributes = widgetXml["@"] || {};

      const attributeNames = Object.keys(attributes).filter(name => name.startsWith("android:") && name !== "android:id");
      const childWidgetNames = Object.keys(widgetXml).filter(name => name !== "@");

      const properties: PageLayoutViewProperty[] = attributeNames.map(attributeName => {
        const value = attributes[attributeName] as string;

        return {
          name: attributeName.substring(8),
          value: value,
          type: this.guessPropertyType(value)
        };
      });

      let children: PageLayoutView[] = [];

      childWidgetNames.forEach(childWidgetName => {
        children = children.concat(this.xmlToView(widgetXml[childWidgetName], childWidgetName));
      });

      return {
        children: children || [],
        id: ((attributes["android:id"] || "").substring(5)) || uuidv4(),
        properties: properties || [],
        widget: widget
      }
    });
  }

  /**
   * Attempts to guess property type from given value. Method falls back to string
   *
   * @param value value
   * @return type
   */
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
   * Event handler for view change
   *
   * @param event event
   */
  private onViewChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    this.setState({
      view: event.target.value as View
    });
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
   * Handle toggle panel
   */
  private onToggleClick = () => {
    this.setState({
      toolbarOpen: !this.state.toolbarOpen
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
   * Event handler for before XML code change event
   *
   * @param editor editor instance
   * @param data editor data
   * @param value code
   */
  private onBeforeXmlCodeChange = (_editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) => {
    this.setState({
      xmlCode: value
    });

    try {
      const xml = parseXML(value, {
        attributeNamePrefix : "",
        attrNodeName: "@",
        textNodeName : "#text",
        ignoreAttributes : false,
        arrayMode: true
      });

      const widgets = Object.keys(xml);
      this.setState({
        jsonCode: JSON.stringify(this.xmlToView(xml[widgets[0]], widgets[0])[0] || {}, null, 2)
      });
    } catch (e) {
      console.warn("Failed to parse", e);
    }
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const layout = {
      ...this.props.layout,
      name: this.state.name,
      data: JSON.parse(this.state.jsonCode)
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
   * Handle back
   */
  private onBackButtonClick = () => {
    this.props.history.push(`/`);
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
    exhibitions: state.exhibitions.exhibitions
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