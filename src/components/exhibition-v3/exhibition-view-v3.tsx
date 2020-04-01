import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/exhibition-view-v3";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, ButtonGroup, Button, Typography, MenuItem, Select, TextField, FilledInput, InputAdornment } from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, PageLayout, DeviceModel, ExhibitionPageEventTrigger, ExhibitionPageResource, ExhibitionPageEventTriggerFromJSON, ExhibitionPageEventActionType, ExhibitionPageResourceFromJSON, PageLayoutView, ExhibitionPageResourceType } from "../../generated/client";
import EventTriggerEditor from "../right-panel-editors/event-trigger-editor";
import BasicLayoutV3 from "../generic/basic-layout-v3";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, JsonLintParseErrorHash } from '../../types';
import strings from "../../localization/strings";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AddIcon from "@material-ui/icons/AddSharp";
import AndroidUtils from "../../utils/android-utils";
import PagePreview from "../preview/page-preview";
import { Controlled as CodeMirror } from "react-codemirror2";
import * as codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/addon/lint/lint.css";
import 'codemirror/addon/lint/lint';
import * as jsonlint from "jsonlint-mod";
import slugify from "slugify";
import SearchIcon from '@material-ui/icons/Search';

type View = "CODE" | "VISUAL";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  exhibition?: Exhibition;
  layouts: PageLayout[];
  deviceModels: DeviceModel[];
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  pages: ExhibitionPage[];
  selectedElement?: ExhibitionPage;
  selectedResource?: ExhibitionPageResource;
  selectedEventTrigger?: ExhibitionPageEventTrigger;
  view: View;
  name: string;
  jsonCode: string;
}

/**
 * Component for exhibition view
 */
export class ExhibitionViewV3 extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      pages: [],
      view: "VISUAL",
      name: "",
      jsonCode: "{}"
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { exhibition, exhibitionId, accessToken } = this.props;

    if (!exhibition || exhibitionId !== exhibition.id) {
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      this.props.setSelectedExhibition(await exhibitionsApi.findExhibition({ exhibitionId }));
    }

    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    const pages = await exhibitionPagesApi.listExhibitionPages({ exhibitionId });

    this.setState({ pages });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, exhibition } = this.props;
    const { selectedElement } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    return (
      <BasicLayoutV3
        title={ exhibition.name }
        onDashboardButtonClick={() => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title="">
            <ButtonGroup className={ classes.navigationTabs }>
              <Button>{ strings.exhibition.content }</Button>
              <Button>{ strings.exhibition.tech }</Button>
            </ButtonGroup>
            <FilledInput
              className={ classes.searchBar }
              fullWidth
              endAdornment={
                <InputAdornment position="end">
                  <SearchIcon/>
                </InputAdornment>
              }
            />
            <TreeView
              className={ classes.navigationTree }
              defaultCollapseIcon={ <ExpandMoreIcon /> }
              defaultExpandIcon={ <ChevronRightIcon /> }
            >
              <TreeItem nodeId={ exhibition.id } label={ exhibition.name }>
                { this.renderPagesNavigation() }
              </TreeItem>
            </TreeView>
            <Button variant="outlined" color="primary" onClick={ this.onAddPageClick } startIcon={ <AddIcon />  }>{ strings.exhibition.addPage }</Button>
          </ElementNavigationPane>
          <EditorView>
            <div className={ classes.toolBar }>
              <Button variant="contained" color="primary" onClick={ this.onSwitchViewClick } style={{ marginRight: 8 }}>
                { this.state.view === "CODE" ? strings.exhibitionLayouts.editView.switchToVisualButton : strings.exhibitionLayouts.editView.switchToCodeButton }
              </Button>
              <Button variant="contained" color="primary" onClick={ this.onSaveClick }> { strings.exhibitionLayouts.editView.saveButton } </Button>
            </div>
            { this.renderEditor() }
          </EditorView>
          <ElementSettingsPane title={ selectedElement ? selectedElement.name : "" }>
            { this.state.selectedElement &&
              this.renderElementSettingsContent()
            }
            {
              this.state.selectedResource &&
              this.renderResourceEditor()
            }
            {
              this.state.selectedEventTrigger &&
              this.renderEventTriggerEditor()
            }
          </ElementSettingsPane>
        </div>

      </BasicLayoutV3>
    );
  }

  /**
   * Renders pages navigation
   */
  private renderPagesNavigation = () => {
    const { pages } = this.state;
    if (!pages) {
      return;
    }

    const items = pages.map(page => {
      return <TreeItem key={ page.id } nodeId={ page.id! } label={ page.name } onClick={ () => this.onSelectTreeItem(page) } />;
    });

    return (
      <TreeItem nodeId="pages" label="Pages">
        { items }
      </TreeItem>
    );
  }

  /**
   * Renders editor
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
   * Renders visual editor
   */
  private renderVisualEditor = () => {
    const { classes } = this.props;
    const { selectedElement } = this.state;

    if (!selectedElement) {
      return;
    }

    const parsedCode = this.parseJsonCode();

    const resources = parsedCode.resources;
    const layout = this.props.layouts.find(item => item.id === selectedElement.layoutId);

    const view = layout?.data;
    // TODO: load from layout
    const displayMetrics = AndroidUtils.getDisplayMetrics(this.props.deviceModels[0]);
    const scale = 0.3;

    return (
      <div className={ classes.visualEditorContainer }>
        <PagePreview view={ view } resources={ resources } displayMetrics={ displayMetrics } scale={ scale }/>
      </div>
    );
  }

  /**
   * Renders code editor
   */
  private renderCodeEditor = () => {
    const { classes } = this.props;
    const jsonEditorOptions: codemirror.EditorConfiguration = {
      mode: { name: "javascript", json: true },
      theme: "material",
      lineNumbers: true,
      lint: {
        getAnnotations: this.jsonEditorGetAnnotations
      },
      gutters: [
        'CodeMirror-lint-markers',
      ]
    };

    return (
      <div className={ classes.codeEditorContainer }>
        <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.json }</Typography>
        <CodeMirror
          className={ classes.editor }
          value={ this.state.jsonCode }
          options={ jsonEditorOptions }
          onBeforeChange={ this.onBeforeJsonCodeChange } />
      </div>
    );
  }

  /**
   * Renders element settings pane content
   */
  private renderElementSettingsContent = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.toolbarContent }>
        <TextField fullWidth label="Name" value={ this.state.name } onChange={ this.onNameChange }/>
        <div className={ classes.toolbarContent }>
          { this.renderLayoutSelect() }
        </div>
        <TreeView
          className={ classes.navigationTree }
          defaultCollapseIcon={ <ExpandMoreIcon /> }
          defaultExpandIcon={ <ChevronRightIcon /> }
        >
          { this.renderResourcesTree() }
          { this.renderEventTriggersTree() }
        </TreeView>
      </div>
    );
  }

  /**
   * Renders layout select
   */
  private renderLayoutSelect = () => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    const layoutSelectItems = this.props.layouts.map(layout => {
      return (
        <MenuItem value={ layout.id }>{ layout.name }</MenuItem>
      );
    });

    return (
      <Select fullWidth value={ selectedElement.layoutId } onChange={ this.onLayoutChange }>
        { layoutSelectItems }
      </Select>
    );
  }

  /**
   * Renders resources tree
   */
  private renderResourcesTree = () => {
    const parsedCode = this.parseJsonCode();

    const items = (parsedCode.resources || []).map((resource, index) => {
      const label = slugify(`${resource.id}`);
      return <TreeItem nodeId={ `resource-${index}` } label={ label } onClick={ () => this.onResourceNodeClick(resource) } />;
    });

    return (
      <TreeItem nodeId="resources" label="Resources">
        { items }
        <TreeItem nodeId={ "resource-new" } label={ "+ Add resource" } onClick={ this.onAddResourceClick }/>
      </TreeItem>
    );
  }

  /**
   * Renders event triggers tree
   */
  private renderEventTriggersTree = () => {
    const parsedCode = this.parseJsonCode();

    const items = (parsedCode.eventTriggers || []).map((eventTrigger: ExhibitionPageEventTrigger, index) => {
      const label = `Event ${index + 1}`;
      return <TreeItem nodeId={ `event-${index}` } label={ label } onClick={ () => this.onEventTriggerNodeClick(eventTrigger) }>
          {/* <Button onClick={ () => this.onEventTriggerNodeDeleteClick(eventTrigger) } >Delete</Button> */}
      </TreeItem>;
    });

    return (
      <TreeItem nodeId="event-triggers" label="Event Triggers">
        { items }
        <TreeItem nodeId={ "event-trigger-new" } label={ "+ Add event trigger" } onClick={ this.onAddEventTriggerClick }/>
      </TreeItem>
    );
  }

  /**
   * Renders resource editor
   */
  private renderResourceEditor = () => {
    const selectedResource = this.state.selectedResource;
    if (!selectedResource) {
      return null;
    }

    const { classes } = this.props;

    const title = <Typography variant="h6">{ selectedResource.id }: { strings.exhibition.properties.title }</Typography>
    const widget = this.findResourceLayoutViewWidget(selectedResource.id);

    if ("ImageView" === widget) {
      return <>
        { title }
        <TextField
          type="url"
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.resources.imageView.properties.imageUrl } variant="outlined"
          value={ this.state.selectedResource?.data }
          onChange={ this.onResourceDataChange }/>
      </>;
    } else if ("TextView" === widget) {
      return <>
        { title }
        <TextField
          multiline
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.resources.textView.properties.text } variant="outlined"
          value={ this.state.selectedResource?.data }
          onChange={ this.onResourceDataChange }/>
      </>
      
    }

    return <div>{ selectedResource.id } { widget }</div>;
  }

    /**
   * Renders resource editor
   */
  private renderEventTriggerEditor = () => {
    const selectedEventTrigger = this.state.selectedEventTrigger;
    if (!selectedEventTrigger) {
      return null;
    }
    const title = <Typography variant="h6">{ strings.exhibition.eventTriggers.title }</Typography>;

      return <>
        { title }
        <EventTriggerEditor
          history = { this.props.history }
          classes = { this.props.classes }
          selectedEventTrigger = { this.state.selectedEventTrigger! }
          pages = { this.state.pages }
          jsonCode = { this.state.jsonCode }
          onParseJson = { this.parseJsonCode }
          onSaveJson = { this.updateJsonFromChild }
        />
      </>;
  }
  
  /**
   * Code mirror lint method
   *
   * @param content editor content
   * @param _options options
   * @param _codeMirror editor instance
   * @returns annotations
   */
  private jsonEditorGetAnnotations = (content: string, _options: codemirror.LintStateOptions, _codeMirror: codemirror.Editor): codemirror.Annotation[] => {
    const found: codemirror.Annotation[] = [];
    const parser = jsonlint.parser;

    parser.parseError = (message: string, hash: JsonLintParseErrorHash) => {
      const loc = hash.loc;
      found.push({
        from: codemirror.Pos(loc.first_line - 1, loc.first_column),
        to: codemirror.Pos(loc.last_line - 1, loc.last_column),
        message: message
      });
    };

    try {
      parser.parse(content);
      // eslint-disable-next-line no-empty
    } catch (e) {

    }

    if (found.length === 0) {
      this.parseJsonCode((message: string, _e?: SyntaxError) => {
        found.push({
          from: codemirror.Pos(0, 0),
          to: codemirror.Pos(0, 0),
          message: message
        });
      });
    }

    return found;
  }

  /**
   * Parses JSON code from the editor
   *
   * @param errorHandler error handler for the parsing errors
   * @returns parsed JSON code from the editor
   */
  private parseJsonCode = (errorHandler?: (message: string, e?: SyntaxError) => void) => {
    const result: Partial<ExhibitionPage> = {
      eventTriggers: [],
      resources: []
    };

    try {
      const parsedCode = JSON.parse(this.state.jsonCode);
      result.eventTriggers = (parsedCode.eventTriggers || []).map(ExhibitionPageEventTriggerFromJSON);
      result.resources = (parsedCode.resources || []).map(ExhibitionPageResourceFromJSON);

      if (errorHandler) {
        this.validateParsedPage(result, errorHandler);
      }


    } catch (e) {
      if (errorHandler) {
        errorHandler(e.message, e);
      }
    }

    return result;
  }

  /**
   * Validates parsed page
   *
   * @param parsedPage parsed page
   * @param errorHandler parser error handler
   */
  private validateParsedPage = (parsedPage: Partial<ExhibitionPage>, errorHandler: (message: string, e?: SyntaxError) => void) => {
    if (!parsedPage.resources) {
      return errorHandler("Invalid resources");
    }

    if (!parsedPage.eventTriggers) {
      return errorHandler("Invalid event triggers");
    }

    const eventTypes = Object.values(ExhibitionPageEventActionType);

    for (let i = 0; i < parsedPage.resources.length; i++) {
      if (!parsedPage.resources[i].id) {
        return errorHandler(`Resource ${i} requires id`);
      }

      if (!parsedPage.resources[i].data) {
        return errorHandler(`Resource ${i} requires data`);
      }

      if (!parsedPage.resources[i].type) {
        return errorHandler(`Resource ${i} requires type`);
      }
    }

    for (let i = 0; i < parsedPage.eventTriggers.length; i++) {
      const events = parsedPage.eventTriggers[i].events || [];

      for (let j = 0; j < events.length; j++) {
        const eventAction = events[j].action;

        if (!eventAction) {
          return errorHandler(`Event ${i} requires an action`);
        }

        if (!eventTypes.includes(eventAction)) {
          return errorHandler(`Event ${i} action ${events[j].action} is not valid (${eventTypes.join(", ")})`);
        }
      }
    }
  }

  /**
   * Returns unique id
   *
   * @param idPrefix id prefix
   * @param existingIds existing ids
   * @return unique id
   */
  private getUniqueId = (idPrefix: string, existingIds: string[]) => {
    let index = 0;
    let id = idPrefix;

    while (existingIds.includes(id)) {
      index++;
      id = `${idPrefix}-${index}`;
    }

    return id;
  }

  /**
   * Attempts to find a layout view widget for given resource
   *
   * @param resourceId resource id
   * @returns view widget or null if not found
   */
  private findResourceLayoutViewWidget(resourceId: string): string | null {
    const view = this.findResourceLayoutView(resourceId);
    return view?.widget || null;
  }

  /**
   * Attempts to find a layout view for given resource
   *
   * @param resourceId resource id
   * @returns view or null if not found
   */
  private findResourceLayoutView(resourceId: string): PageLayoutView | null {
    const layout = this.props.layouts.find(item => item.id === this.state.selectedElement?.layoutId);
    if (!layout) {
      return null;
    }

    const propertyValue = `@resources/${resourceId}`;
    const root = layout.data;
    if (root.properties.findIndex(property => property.value === propertyValue) > -1) {
      return root;
    }

    return this.findLayoutViewByPropertyValue(root, propertyValue);
  }

  /**
   * Attempts to find a child view with given property value
   *
   * @param view root view
   * @param propertyValue property value
   * @returns view or null if not found
   */
  private findLayoutViewByPropertyValue(view: PageLayoutView, propertyValue: string): PageLayoutView | null  {
    for (let i = 0; i < view.children.length; i++) {
      const child = view.children[i];
      if (child.properties.findIndex(property => property.value === propertyValue) > -1) {
        return child;
      }

      const result = this.findLayoutViewByPropertyValue(child, propertyValue);
      if (result) {
        return result;
      }
    }

    return null;
  }

  /**
   * Event handler for resource add click
   */
  private onAddResourceClick = () => {
    const parsedCode = this.parseJsonCode();
    parsedCode.resources = (parsedCode.resources || []);
    const ids = parsedCode.resources.map(resource => resource.id);

    parsedCode.resources.push({
      "id": this.getUniqueId("new", ids),
      "data": "https://example.com",
      "type": ExhibitionPageResourceType.Image
    });

    this.setState({
      jsonCode: this.toJsonCode(parsedCode)
    });
  }

  /**
   * Event handler for event trigger add click
   */
  private onAddEventTriggerClick = () => {
    const parsedCode = this.parseJsonCode();
    parsedCode.eventTriggers = (parsedCode.eventTriggers || []);

    parsedCode.eventTriggers.push({
      clickViewId: (parsedCode.eventTriggers.length + 1).toString(),
      delay: 0,
      events: [],
      next: []
    });

    this.setState({
      jsonCode: this.toJsonCode(parsedCode)
    });
  }

  /**
   * Event handler for resource node click
   *
   * @param resource selected node
   */
  private onResourceNodeClick = (resource: ExhibitionPageResource) => {
    this.setState({
      selectedEventTrigger: undefined,
      selectedResource: resource
    });
  }

  /**
   * Event handler for event trigger node click
   *
   * @param eventTrigger selected node
   */
  private onEventTriggerNodeClick = (eventTrigger: ExhibitionPageEventTrigger) => {

    this.setState({
      selectedEventTrigger: eventTrigger,
      selectedResource: undefined
    });
  }

    /**
   * Event handler for event trigger node click
   *
   * @param eventTrigger selected node
   */
  private onEventTriggerNodeDeleteClick = (eventTrigger: ExhibitionPageEventTrigger) => {

    const selectedEventTrigger = this.state.selectedEventTrigger;
    if (!selectedEventTrigger) {
      return null;
    }

    const parsedCode = this.parseJsonCode();
    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(trigger => eventTrigger.clickViewId === trigger.clickViewId);
    if (index > -1) {
      parsedCode.eventTriggers.splice(index, 1);

      this.setState({
        jsonCode: this.toJsonCode(parsedCode),
        selectedEventTrigger: undefined,
        selectedResource: undefined
      });
    }
  }

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  private onResourceDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedResource = this.state.selectedResource;
    if (!selectedResource) {
      return null;
    }

    const parsedCode = this.parseJsonCode();
    parsedCode.resources = parsedCode.resources || [];
    const index = parsedCode.resources.findIndex(resource => selectedResource.id === resource.id);
    if (index > -1) {
      parsedCode.resources[index].data = event.target.value;

      this.setState({
        selectedResource: parsedCode.resources[index],
        jsonCode: this.toJsonCode(parsedCode)
      });
    }
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
   * Update json from child component. Atm updated only event triggers
   */
  private updateJsonFromChild = (eventTrigger?: ExhibitionPageEventTrigger, parsedCode?: Partial<ExhibitionPage>) => {
    if (parsedCode !== undefined) {
      this.setState({
        selectedEventTrigger: eventTrigger,
        jsonCode: this.toJsonCode(parsedCode)
      });
    }
  }

  /**
   * Event handler for layout change
   *
   * @param event event
   */
  private onLayoutChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    this.setState({
      selectedElement: { ...selectedElement, layoutId: event.target.value }
    });
  }

  /**
   * Event handler for before JSON code change event
   *
   * @param _editor editor instance
   * @param _data editor data
   * @param value code
   */
  private onBeforeJsonCodeChange = (_editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) => {
    this.setState({
      jsonCode: value
    });
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
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    const parsedCode = this.parseJsonCode();

    this.onPageSave({
      ...this.state.selectedElement,
      layoutId: selectedElement.layoutId,
      name: this.state.selectedElement?.name!,
      eventTriggers: parsedCode.eventTriggers || [],
      resources: parsedCode.resources || []
    });
  }

  /**
   * Serializes the page into JSON code
   *
   * @returns JSON
   */
  private toJsonCode = (page: Partial<ExhibitionPage>): string => {
    const { resources, eventTriggers } = page;

    return JSON.stringify({
      resources: resources,
      eventTriggers: eventTriggers
    }, null, 2);
  }

  /**
   * Event handler for add page click
   */
  private onAddPageClick = () => {
    const layoutId = this.props.layouts && this.props.layouts.length ? this.props.layouts[0].id : null;

    if (!layoutId) {
      return null;
    }

    const newPage: ExhibitionPage = {
      layoutId: layoutId,
      name: strings.exhibition.newPage,
      eventTriggers: [],
      resources: []
    }

    this.setState({
      selectedElement: newPage
    });
  }

  /**
   * Event handler for page save
   *
   * @param page page
   */
  private onPageSave = async (page: ExhibitionPage) => {
    try {
      const exhibitionPagesApi = Api.getExhibitionPagesApi(this.props.accessToken);
      if (page.id) {
        const updatedPage = await exhibitionPagesApi.updateExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          pageId: page.id,
          exhibitionPage: page
        });

        const pages = this.state.pages.filter(item => item.id !== updatedPage.id) || [];

        this.setState({
          pages: [ ...pages, updatedPage ]
        });

      } else {
        const createdPage = await exhibitionPagesApi.createExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          exhibitionPage: page
        });

        this.setState({
          pages: [ ...this.state.pages || [], createdPage ]
        });
      }
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Handle dashboard click
   */
  private onDashboardButtonClick = () => {
    this.props.history.push(`/dashboard/overview`);
  }

  private onSelectTreeItem = (selectedElement: ExhibitionPage) => {
    const jsonCode = this.toJsonCode(selectedElement);
    this.setState({
      selectedElement,
      jsonCode
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
    exhibition: state.exhibitions.selectedExhibition as Exhibition,
    layouts: state.layouts.layouts,
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
    setSelectedExhibition: (exhibition: Exhibition) => dispatch(setSelectedExhibition(exhibition))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionViewV3));
