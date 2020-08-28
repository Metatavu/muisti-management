import * as React from "react";

import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, TextField, Typography, MenuItem, Select } from "@material-ui/core";
import strings from "../../localization/strings";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint";
import theme from "../../styles/theme";
import { Tab, TabResource } from "./constants";
import { ExhibitionPageResourceType } from "../../generated/client";

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
        { this.renderTabResources() }
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
   * Render tab properties
   */
  private renderTabResources = () => {

    const resourceSelectItems = this.getResourceSelectOptions();
    const resourceItems = this.getResourceItems();

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.contentEditor.editor.tabs.properties }
        </Typography>
        { resourceSelectItems }
        { resourceItems }
      </div>
    );
  }

  /**
   * Get resource select options
   */
  private getResourceSelectOptions = () => {
    const { selectedTab } = this.props;

    const values = enumValues(ExhibitionPageResourceType);
    const keys = enumKeys(ExhibitionPageResourceType);

    const items = keys.map((key, index) => {
      return <MenuItem key={ key } value={ values[index] }>{ key }</MenuItem>;
    });

    const currentValue = selectedTab.resources ? selectedTab.resources[0] : undefined;

    return (
      <Select
      variant="filled"
      fullWidth
      onChange={ this.handleSelectChange }
      name="type"
      value={ currentValue?.type }
    >
      { items }
    </Select>
    );

  }

  /**
   * Get resource items
   */
  private getResourceItems = () => {
    const { selectedTab } = this.props;

    if (!selectedTab.resources) {
      return null;
    }

    return selectedTab.resources.map(resource => {
      return (
        <div>
          <Typography variant="h6">
            { strings.contentEditor.editor.tabs.resources }
          </Typography>
          <TextField
            onChange={ this.onDataChange }
            value={ resource.data }
          />
        </div>
      );
    });
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

  /**
   * Event handler for select change
   *
   * @param event change event
   */
  private handleSelectChange = (event: React.ChangeEvent<{ name?: string | undefined; value: any }>) => {
    const { onSave } = this.props;

    const key = event.target.name;
    const value = event.target.value as ExhibitionPageResourceType;

    if (!key) {
      return;
    }

    const tabToUpdate = { ...this.props.selectedTab } as Tab;

    if (!tabToUpdate.resources[0]) {
      const newResource: TabResource = {
        id: "src",
        data: "",
        type: value
      };
      tabToUpdate.resources.push(newResource);
    } else {
      tabToUpdate.resources[0].type = value;
      tabToUpdate.resources[0].data = "";
    }

    onSave(tabToUpdate);
  }

  /**
   * Event handler for data change
   *
   * @param event react text field event
   */
  private onDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onSave } = this.props;

    const value = event.target.value;
    const tabToUpdate = { ...this.props.selectedTab } as Tab;

    tabToUpdate.resources[0].data = value;
    onSave(tabToUpdate);
  }
}

/**
 * Get any enum keys
 *
 * @param enumObject enum object
 */
function enumKeys<T>(enumObject: T) {
  return Object.keys(enumObject);
}

/**
 * Get any enum values
 *
 * @param enumObject enum object
 */
function enumValues<T>(enumObject: T) {
  return Object.values(enumObject);
}

export default withStyles(styles)(TabEditor);
