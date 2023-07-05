import { ExhibitionPage, ExhibitionPageEventActionType } from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/code-editor";
import { json } from "@codemirror/lang-json";
import { Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import CodeMirror from "@uiw/react-codemirror";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  json: string;
  onChange: (json: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
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

    return (
      <div className={classes.codeEditorContainer}>
        <Typography style={{ margin: 8 }}>{strings.exhibitionLayouts.editView.json}</Typography>
        <CodeMirror
          className={classes.editor}
          value={this.props.json}
          extensions={[json()]}
          onChange={this.props.onChange}
        />
      </div>
    );
  }

  /**
   * Validates parsed page
   *
   * @param parsedPage parsed page
   * @param errorHandler parser error handler
   */
  private validateParsedPage = (
    parsedPage: Partial<ExhibitionPage>,
    errorHandler: (message: string, e?: SyntaxError) => void
  ) => {
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
      const events = parsedPage.eventTriggers[i].events || [];

      for (let j = 0; j < events.length; j++) {
        const eventAction = events[j].action;

        if (!eventAction) {
          return errorHandler(`Event ${i} requires an action`);
        }

        if (!eventTypes.includes(eventAction)) {
          return errorHandler(
            `Event ${i} action ${events[j].action} is not valid (${eventTypes.join(", ")})`
          );
        }
      }
    }
  };
}

export default withStyles(styles)(CodeEditor);
