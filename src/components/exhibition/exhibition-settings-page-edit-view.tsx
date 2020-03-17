import * as React from "react";

import { WithStyles, withStyles, Button, TextField, Typography, IconButton, Select, MenuItem } from "@material-ui/core";
import styles from "../../styles/settings-page-editor";
import { ExhibitionPageEventActionType, ExhibitionPageResourceType, ExhibitionDeviceModel, PageLayoutView } from "../../generated/client";
import { ExhibitionPageEventPropertyType } from "../../generated/client";
import { ExhibitionPageResourceFromJSON, ExhibitionPageEventTriggerFromJSON } from "../../generated/client";
import { PageLayout, ExhibitionPage, ExhibitionPageEventTrigger, ExhibitionPageResource } from "../../generated/client";
import PagePreview from "../preview/page-preview";
import strings from "../../localization/strings";
import { Controlled as CodeMirror } from "react-codemirror2";
import * as codemirror from "codemirror";
import slugify from "slugify";
import CloseIcon from "@material-ui/icons/ChevronLeftSharp";
import OpenIcon from "@material-ui/icons/ChevronRightSharp";
import classNames from "classnames";
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/addon/lint/lint.css";
import 'codemirror/addon/lint/lint';
import * as jsonlint from "jsonlint-mod";
import AndroidUtils from "../../utils/android-utils";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import EditorView from "../editor/editor-view";

type View = "CODE" | "VISUAL";

/**
 * JSON Lint parse error hash object
 */
interface JsonLintParseErrorHash {
  loc: {
    "first_line": number;
    "first_column": number;
    "last_line": number;
    "last_column": number; 
  };
}

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layouts: PageLayout[];
  deviceModels: ExhibitionDeviceModel[];
  page: ExhibitionPage;
  onSave: (page: ExhibitionPage) => void;
}

/**
 * Interface representing component state
 */
interface State {
  view: View;
  name: string;
  toolbarOpen: boolean;
  jsonCode: string;
  layoutId: string;
  selectedResource?: ExhibitionPageResource;
  selectedEventTrigger?: ExhibitionPageEventTrigger;
}

const minWidth = 320;
const minimizedWidth = 50;

/**
 * Component for editor view
 */
class ExhibitionSettingsPageEditView extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      view: "VISUAL",
      name: props.page.name,
      toolbarOpen: true,
      layoutId: props.page.layoutId,
      jsonCode: this.toJsonCode(props.page)
    };
  }

  /**
   * Render
   */
  public render() {
    return (
      <>
        <EditorView>
          { this.renderEditorView() }
        </EditorView>
        <ElementSettingsPane title="Ominaisuudet">
          { this.renderProperties() }
        </ElementSettingsPane>
      </>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditorView = () => {
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
              <h3>Page</h3>
            </div>
            <div className={ classes.toolbarContent }>
              <TextField fullWidth label="Name" value={ this.state.name } onChange={ this.onNameChange }/>
            </div>
            <div className={ classes.toolbarContent }>
              { this.renderLayoutSelect() }
            </div>
            <div>
              <TreeView defaultCollapseIcon={ <ExpandMoreIcon /> } defaultExpandIcon={ <ChevronRightIcon /> }>
                { this.renderResourcesTree() }
                { this.renderEventTriggersTree() }
              </TreeView>
            </div>
          </div>
        </div>
        <div className={ classes.content }>
          <div className={ classes.toolBar }>
            <Button variant="contained" color="primary" onClick={ this.onSwitchViewClick } style={{ marginRight: 8 }}> 
              { this.state.view === "CODE" ? strings.exhibitionLayouts.editView.switchToVisualButton : strings.exhibitionLayouts.editView.switchToCodeButton } 
            </Button>
            <Button variant="contained" color="primary" onClick={ this.onSaveClick }> { strings.exhibitionLayouts.editView.saveButton } </Button>
          </div>
          <div className={ classes.editors}>
            { this.renderEditor() }
          </div>
        </div>
      </div>
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
    }
  }

  /**
   * Renders visual editor
   */
  private renderVisualEditor = () => {
    const { classes } = this.props;

    const parsedCode = this.parseJsonCode();

    const resources = parsedCode.resources;
    const layout = this.props.layouts.find(layout => layout.id === this.state.layoutId);

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
   * Renders layout select
   */
  private renderLayoutSelect = () => {
    const layoutSelectItems = this.props.layouts.map(layout => {
      return (
        <MenuItem value={ layout.id }> { layout.name} </MenuItem>
      );
    });

    return (
      <Select fullWidth value={ this.state.layoutId } onChange={ this.onLayoutChange }>
        { layoutSelectItems }
      </Select>
    );
  }

  /**
   * Remders resources tree
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
      return <TreeItem nodeId={ `event-${index}` } label={ label } onClick={ () => this.onEventTriggerNodeClick(eventTrigger) }/>;
    });

    return (
      <TreeItem nodeId="event-triggers" label="Event Triggers">
        { items }
        <TreeItem nodeId={ "event-trigger-new" } label={ "+ Add event trigger" } onClick={ this.onAddEventTriggerClick }/>
      </TreeItem>
    );
  }

  /**
   * Renders properties
   */
  private renderProperties = () => {
    if (this.state.selectedResource) {
      return this.renderResourceEditor();
    }

    return null;
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

    const widget = this.findResourceLayoutViewWidget(selectedResource.id!);

    if ("ImageView" === widget) {
      return (
        <TextField 
          type="url"
          className={ classes.textResourceEditor } 
          label={ this.state.selectedResource?.id } variant="outlined" 
          value={ this.state.selectedResource?.data }
          onChange={ this.onResourceDataChange }/>
      );
    } else if ("TextView" === widget) {
      return (
        <TextField 
          multiline
          className={ classes.textResourceEditor } 
          label={ this.state.selectedResource?.id } variant="outlined" 
          value={ this.state.selectedResource?.data }
          onChange={ this.onResourceDataChange }/>
      )
    }

    return <div> {selectedResource.id!} {widget} </div>;
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
   * Parsers JSON code from the editor
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
    const layout = this.props.layouts.find(layout => layout.id === this.state.layoutId);
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
      clickViewId: "",
      delay: 0,
      events: [{
        action: ExhibitionPageEventActionType.Hide,
        properties: [
          {
            name: "property name",
            type: ExhibitionPageEventPropertyType.String,
            value: "property value"
          }
        ]
      }],
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
   * Handle toggle panel
   */
  private onToggleClick = () => {
    this.setState({
      toolbarOpen: !this.state.toolbarOpen
    });
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
   * Event handler for layout change
   * 
   * @param event event
   */
  private onLayoutChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    this.setState({
      layoutId: event.target.value
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
    const parsedCode = this.parseJsonCode();

    this.props.onSave({
      ...this.props.page,
      layoutId: this.state.layoutId,
      name: this.state.name,
      eventTriggers: parsedCode.eventTriggers || [],
      resources: parsedCode.resources || []
    });
  } 

}

export default withStyles(styles)(ExhibitionSettingsPageEditView);