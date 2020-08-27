import * as React from "react";

import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, TextField, Typography } from "@material-ui/core";
import strings from "../../localization/strings";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint";
import theme from "../../styles/theme";
import { Tab } from "./constants";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  selectedTab: Tab;

  onSave: (updatedTab: Tab) => void;
}

  /**
   * Component state
   */
  interface State {
    error?: Error;
    loading: boolean;
  }

/**
 * Component for tab editor
 */
class TabEditor extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        { this.renderTabLabel() }
      </div>
    );
  }

  /**
   * Render tab label
   */
  private renderTabLabel = () => {
    const { selectedTab, classes } = this.props;
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
      <Typography variant="h6">
        { strings.contentEditor.editor.tabs.label }
      </Typography>
      <TextField
        name="name"
        className={ classes.textResourceEditor }
        variant="filled"
        value={ selectedTab.label }
        onChange={ this.onLabelChange }
      />
    </div>
    );
  }

  /**
   * Event handler for tab label change
   *
   * @param event react change event
   */
  private onLabelChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { onSave } = this.props;

    const tab: Tab = { ...this.props.selectedTab };
    const key = event.target.name;
    const value = event.target.value as string;
    if (!key) {
      return;
    }

    tab.label = value;
    onSave(tab);
  }
}

export default withStyles(styles)(TabEditor);
