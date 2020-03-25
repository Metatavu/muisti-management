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
import { PageLayout, PageLayoutView, PageLayoutViewPropertyType, PageLayoutViewProperty, Exhibition, DeviceModel, ScreenOrientation } from "../../generated/client";
import BasicLayoutV3 from "../generic/basic-layout-v3";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import PagePreview from "../preview/page-preview";
import { AccessToken } from '../../types';
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
  screenOrientation: ScreenOrientation;
  xmlCode: string;
  toolbarOpen: boolean;
  deleteOpen: boolean;
  view: View;
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
    const { classes, layout } = this.props;

    if (!layout || !layout.id || this.state.loading ) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    return (
      <BasicLayoutV3
        title={ layout.name }
        onDashboardButtonClick={() => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.layout.title }>
          </ElementNavigationPane>
          <EditorView>
            { this.renderToolbar() }
            { this.renderEditor() }
            { this.renderDeleteDialog() }
          </EditorView>
          <ElementSettingsPane title={ strings.layout.properties.title }>
            <div className={ classes.toolbarContent }>
              <TextField fullWidth label={ strings.layout.toolbar.name } value={ this.state.name } onChange={ this.onNameChange }/>
              <InputLabel id="screenOrientation">{ strings.layout.settings.screenOrientation }</InputLabel>
              <Select
                labelId="screenOrientation"
                value={ this.state.screenOrientation }
                onChange={ this.onScreenOrientationChange }
              >
                <MenuItem value={ ScreenOrientation.Portrait }>{ strings.layout.settings.portrait }</MenuItem>
                <MenuItem value={ ScreenOrientation.Landscape }>{ strings.layout.settings.landscape }</MenuItem>
              </Select>
            </div>
          </ElementSettingsPane>
        </div>

      </BasicLayoutV3>
    );
  }

  /**
   * Renders a toolbar
   */
  private renderToolbar = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.toolBar }>
        <Button variant="contained" color="primary" onClick={ this.onSwitchViewClick } style={{ marginRight: 8 }}>
          { this.state.view === "CODE" ? strings.exhibitionLayouts.editView.switchToVisualButton : strings.exhibitionLayouts.editView.switchToCodeButton }
        </Button>
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
    const { classes, deviceModels } = this.props;
    if (deviceModels.length === 0) {
      return;
    }

    const view: PageLayoutView = JSON.parse(this.state.jsonCode);
    // TODO: load from layout
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModels[0]);
    const scale = 0.3;

    return (
      <div className={ classes.editors }>
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
      screenOrientation: layout.screenOrientation
    });
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
      data: JSON.parse(this.state.jsonCode),
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
