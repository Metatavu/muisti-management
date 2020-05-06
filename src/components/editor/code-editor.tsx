import * as React from "react";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { WithStyles, withStyles, Typography } from "@material-ui/core";
import styles from "../../styles/code-editor";
import { Controlled as CodeMirror } from "react-codemirror2";
import * as codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/lint/lint.css";
import 'codemirror/addon/lint/lint';
import strings from "../../localization/strings";
import { JsonLintParseErrorHash } from "../../types";
import * as jsonlint from "jsonlint-mod";
import { ExhibitionPage } from "../../generated/client";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  json: string;
  onChange: (json: string) => void;
  parseJson: (errorHandler?: (message: string, e?: SyntaxError) => void) => Partial<ExhibitionPage>;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for code editor
 */
class CodeEditor extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component render method
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
      <div className={ classes.codeEditorContainer }>
        <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.json }</Typography>
        <CodeMirror
          className={ classes.editor }
          value={ this.props.json }
          options={ jsonEditorOptions }
          onBeforeChange={ this.onBeforeJsonCodeChange } />
      </div>
    );
  }

  /**
   * Event handler for before JSON code change event
   *
   * @param _editor editor instance
   * @param _data editor data
   * @param value code
   */
  private onBeforeJsonCodeChange = (_editor: codemirror.Editor, _data: codemirror.EditorChange, value: string) => {
    this.props.onChange(value);
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
      this.props.parseJson((message: string, _e?: SyntaxError) => {
        found.push({
          from: codemirror.Pos(0, 0),
          to: codemirror.Pos(0, 0),
          message: message
        });
      });
    }

    return found;
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {};
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(CodeEditor));