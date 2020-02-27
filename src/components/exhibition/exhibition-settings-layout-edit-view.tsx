import * as React from "react";

import { WithStyles, withStyles, Button, TextField, Typography } from "@material-ui/core";
import styles from "../../styles/floor-plan";
import { parse as parseXML } from "fast-xml-parser"
import { ExhibitionPageLayout, ExhibitionPageLayoutView, ExhibitionPageLayoutViewProperty, ExhibitionPageLayoutViewPropertyType } from "../../generated/client";
import strings from "../../localization/strings";
import { Controlled as CodeMirror } from "react-codemirror2";
import { v4 as uuidv4 } from "uuid";
import * as codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/mode/xml/xml"

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layout: ExhibitionPageLayout,
  onSave: (layout: ExhibitionPageLayout) => void
}

/**
 * Interface representing component state
 */
interface State {
  name: string,
  jsonCode: string,
  xmlCode: string
}

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
      xmlCode: ""
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
        <TextField value={ this.state.name } onChange={ this.onNameChange }/>
        <Typography>{ strings.exhibitionLayouts.editView.json }</Typography>
        <CodeMirror value={ this.state.jsonCode } options={ jsonEditorOptions } onBeforeChange={ this.onBeforeJsonCodeChange } />
        <Typography>{ strings.exhibitionLayouts.editView.xml }</Typography>
        <CodeMirror value={ this.state.xmlCode } options={ xmlEditorOptions } onBeforeChange={ this.onBeforeXmlCodeChange } />
        <Button variant="contained" color="primary" onClick={ this.onSaveClick }> { strings.exhibitionLayouts.editView.saveButton } </Button>
      </div>
    );
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
   * Event handler for before XML code change event
   * 
   * @param editor editor instance
   * @param data editor data
   * @param value code
   */
  private onBeforeXmlCodeChange = (editor: codemirror.Editor, data: codemirror.EditorChange, value: string) => {
    this.setState({
      xmlCode: value
    });

    try {
      const xml = parseXML(value, {
        attributeNamePrefix : "",
        attrNodeName: "@",
        textNodeName : "#text",
        ignoreAttributes : false
      });

      const widgets = Object.keys(xml);
      this.setState({
        jsonCode: JSON.stringify(this.xmlToView(xml[widgets[0]], widgets[0]), null, 2)
      });
    } catch (e) {
      console.warn("Failed to parse", e);
    }
  }

  /**
   * Converts widget XML into page layout view
   * 
   * @param widgetXml XML
   * @param widget widget name
   */
  private xmlToView(widgetXml: any, widget: string): ExhibitionPageLayoutView {
    const attributes = widgetXml["@"] || {};
    const attributeNames = Object.keys(attributes).filter(name => name.startsWith("android:") && name !== "android:id");
    const childWidgetNames = Object.keys(widgetXml).filter(name => name !== "@");

    const properties: ExhibitionPageLayoutViewProperty[] = attributeNames.map((attributeName) => {
      const value = attributes[attributeName] as string;

      return {
        name: attributeName.substring(8),
        value: value,
        type: this.guessPropertyType(value)
      }
    });

    const children: ExhibitionPageLayoutView[] = childWidgetNames.map((childWidgetName) => {
      return this.xmlToView(widgetXml[childWidgetName], childWidgetName);
    });
    
    return {
      children: children,
      id: uuidv4(),
      properties: properties,
      widget: widget
    }
  }

  /**
   * Attempts to guess property type from given value. Method falls back to string
   * 
   * @param value value
   * @return type
   */
  private guessPropertyType = (value: string): ExhibitionPageLayoutViewPropertyType => {
    if (!isNaN(parseInt(value))) {
      return ExhibitionPageLayoutViewPropertyType.Number;
    }

    if (value === "true" || value === "false") {
      return ExhibitionPageLayoutViewPropertyType.Boolean;
    }

    return ExhibitionPageLayoutViewPropertyType.String;
  }
  
  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const layout = {
      ... this.props.layout,
      name: this.state.name,
      data: JSON.parse(this.state.jsonCode)
    };

    this.props.onSave(layout);
  } 
}

export default withStyles(styles)(ExhibitionSettingsLayoutEditView);