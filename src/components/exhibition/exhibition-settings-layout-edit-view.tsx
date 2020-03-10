import * as React from "react";
import { WithStyles, withStyles } from "@material-ui/core";
import { Button, TextField, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@material-ui/core";
import styles from "../../styles/settings-layout-editor";
import { parse as parseXML } from "fast-xml-parser"
import { PageLayout, PageLayoutView, PageLayoutViewProperty, PageLayoutViewPropertyType } from "../../generated/client";
import strings from "../../localization/strings";
import { Controlled as CodeMirror } from "react-codemirror2";
import { v4 as uuidv4 } from "uuid";
import * as codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/mode/xml/xml"
import CloseIcon from "@material-ui/icons/ChevronLeftSharp";
import OpenIcon from "@material-ui/icons/ChevronRightSharp";
import classNames from "classnames";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layout: PageLayout;
  onSave: (layout: PageLayout) => void;
  onDelete: (layout: PageLayout) => void;
}

/**
 * Interface representing component state
 */
interface State {
  name: string;
  jsonCode: string;
  xmlCode: string;
  toolbarOpen: boolean;
  deleteOpen: boolean;
}

const minWidth = 320;
const minimizedWidth = 50;

/**
 * Component for editor view
 */
class ExhibitionSettingsLayoutEditView extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      name: props.layout.name,
      jsonCode: JSON.stringify(props.layout.data, null, 2),
      xmlCode: "",
      toolbarOpen: true,
      deleteOpen: false
    };
  }

  /**
   * Render basic layout
   */
  public render() {
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
          <div className={ classes.toolBar }>
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
          <div className={ classes.editors}>
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
        </div>
        { this.renderDeleteDialog() }
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
   * Event handler for delete dialog delete button click event
   */
  private onDeleteDialogDeleteButtonClick = () => {
    this.props.onDelete(this.props.layout);
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

    this.props.onSave(layout);
  } 

}

export default withStyles(styles)(ExhibitionSettingsLayoutEditView);