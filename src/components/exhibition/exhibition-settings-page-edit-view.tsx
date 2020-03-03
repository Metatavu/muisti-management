import * as React from "react";

import { WithStyles, withStyles, Button, TextField, Typography, IconButton } from "@material-ui/core";
import styles from "../../styles/settings-page-editor";
import { ExhibitionPageLayout, ExhibitionPage, ExhibitionPageResourceFromJSON, ExhibitionPageEventType, ExhibitionPageResourceType, ExhibitionPageEventTrigger, ExhibitionPageEventPropertyType, ExhibitionPageEventTriggerFromJSON } from "../../generated/client";
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

/**
 * JSON Lint parse error hash object
 */
interface JsonLintParseErrorHash {
  loc: {
    "first_line": number,
    "first_column": number,
    "last_line": number,
    "last_column": number 
  }
}

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layouts: ExhibitionPageLayout[],
  page: ExhibitionPage,
  onSave: (page: ExhibitionPage) => void
}

/**
 * Interface representing component state
 */
interface State {
  name: string,
  layout?: ExhibitionPageLayout,
  toolbarOpen: boolean,
  jsonCode: string,
  layoutId: string
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
      name: props.page.name,
      toolbarOpen: true,
      layoutId: props.page.layoutId,
      jsonCode: this.toJsonCode(props.page)
    };
  }
  
  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = () => {

  }

  /**
   * Render basic layout
   */
  public render() {
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
            <Button variant="contained" color="primary" onClick={ this.onSaveClick }> { strings.exhibitionLayouts.editView.saveButton } </Button>
          </div>
          <div className={ classes.editors}>
            <div className={ classes.editorContainer }>
              <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.json }</Typography>
              <CodeMirror 
                className={ classes.editor } 
                value={ this.state.jsonCode } 
                options={ jsonEditorOptions } 
                onBeforeChange={ this.onBeforeJsonCodeChange } />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Remders resources tree
   */
  private renderResourcesTree = () => {
    const parsedCode = this.parseJsonCode();
    
    const items = (parsedCode.resources || []).map((resource, index) => {
      const label = slugify(`${resource.id}`);
      return <TreeItem nodeId={ `resource-${index}` } label={ label } />;
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
      return <TreeItem nodeId={ `event-${index}` } label={ label } />;
    });

    return (
      <TreeItem nodeId="event-triggers" label="Event Triggers">
        { items }
        <TreeItem nodeId={ "event-trigger-new" } label={ "+ Add event trigger" } onClick={ this.onAddEventTriggerClick }/>
      </TreeItem>
    );
  }

  /**
   * Code mirror lint method
   * 
   * @param content editor content
   * @param options options
   * @param codeMirror editor instance
   * @returns annotations
   */
  private jsonEditorGetAnnotations = (content: string, options: codemirror.LintStateOptions, codeMirror: codemirror.Editor): codemirror.Annotation[] | PromiseLike<codemirror.Annotation[]> => {
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
    } catch (e) {

    }

    if (found.length === 0) {
      this.parseJsonCode((message: string, e?: SyntaxError) => {
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

    const eventTypes = Object.values(ExhibitionPageEventType);

    for (let i = 0; i < parsedPage.resources.length; i++) {
      if (!parsedPage.resources[i].id) {
        return errorHandler(`Resource ${i} requires id`);
      }

      if (!parsedPage.resources[i].data) {
        return errorHandler(`Resource ${i} requires data`);
      }
    }

    for (let i = 0; i < parsedPage.eventTriggers.length; i++) {
      const events = parsedPage.eventTriggers[i].events || [];
      
      for (let j = 0; j < events.length; j++) {
        if (eventTypes.indexOf(events[j].type) === -1) {
          return errorHandler(`Event ${i} type ${events[j].type} is not valid (${eventTypes.join(", ")})`);
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

    while (existingIds.indexOf(id) !== -1) {
      index++;
      id = `${idPrefix}-${index}`; 
    }

    return id;
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
        type: ExhibitionPageEventType.Hide,
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
  private onBeforeJsonCodeChange = (editor: codemirror.Editor, data: codemirror.EditorChange, value: string) => {
    this.setState({
      jsonCode: value
    });
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const parsedCode = this.parseJsonCode();

    this.props.onSave({
      ... this.props.page,
      layoutId: this.state.layoutId,
      name: this.state.name,
      eventTriggers: parsedCode.eventTriggers || [],
      resources: parsedCode.resources || []
    });
  } 

}

export default withStyles(styles)(ExhibitionSettingsPageEditView);