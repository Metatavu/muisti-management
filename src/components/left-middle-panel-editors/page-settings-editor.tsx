import * as React from "react";
import { ExhibitionPage, ExhibitionPageResource, ExhibitionPageEventTrigger, PageLayout, ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux"
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';
import ChevronRightIcon from '@material-ui/icons/ArrowRight';
import slugify from "slugify";
import { TreeView, TreeItem } from "@material-ui/lab";
import theme from "../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layouts: PageLayout[];
  devices: ExhibitionDevice[];
  pageData: ExhibitionPage;
  eventTriggers: ExhibitionPageEventTrigger[];
  resources: ExhibitionPageResource[];
  onPageNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLayoutChange: (event: React.ChangeEvent<{ name?: string; value: any }>) => void;
  onDeviceChange: (event: React.ChangeEvent<{ name?: string; value: any }>) => void;
  onResourceClick: (resource: ExhibitionPageResource) => void;
  onAddResourceClick: () => void;
  onEventTriggerClick: (eventTriggerIndex: number) => void;
  onAddEventTriggerClick: () => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for page settings editor
 */
class PageSettingsEditor extends React.Component<Props, State> {

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
    const { classes, pageData, onPageNameChange } = this.props;
    
    return (
      <>
        <TextField fullWidth variant="filled" label="Name" value={ pageData.name } onChange={ onPageNameChange }/>
        <div className={ classes.selectFields }>
          { this.renderDeviceSelect(pageData) }
          { this.renderLayoutSelect(pageData) }
        </div>
        <TreeView
          className={ classes.navigationTree }
          defaultCollapseIcon={ <ExpandMoreIcon htmlColor="#888" /> }
          defaultExpandIcon={ <ChevronRightIcon htmlColor="#888" /> }
        >
          { this.renderResourcesTree() }
          { this.renderEventTriggersTree() }
        </TreeView>
      </>
    );
  }

  /**
   * Renders resources tree
   */
  private renderResourcesTree = () => {
    const { onResourceClick, onAddResourceClick, resources } = this.props;

    const items = resources.map((resource, index) => {
      const label = slugify(`${resource.id}`);
      return <TreeItem nodeId={ `resource-${index}` } label={ label } onClick={ () => onResourceClick(resource) } />;
    });

    return (
      <TreeItem nodeId="resources" label="Resources">
        { items }
        <TreeItem nodeId={ "resource-new" } label={ "+ Add resource" } onClick={ onAddResourceClick }/>
      </TreeItem>
    );
  }

  /**
   * Renders event triggers tree
   */
  private renderEventTriggersTree = () => {
    const { onEventTriggerClick, onAddEventTriggerClick, eventTriggers } = this.props;

    const items = eventTriggers.map((_eventTrigger: ExhibitionPageEventTrigger, index) => {
      const label = `Event ${index + 1}`;
      return <TreeItem nodeId={ `event-${index}` } label={ label } onClick={ () => onEventTriggerClick(index) } />
    });

    return (
      <TreeItem nodeId="event-triggers" label="Event Triggers">
        { items }
        <TreeItem nodeId={ "event-trigger-new" } label={ "+ Add event trigger" } onClick={ onAddEventTriggerClick }/>
      </TreeItem>
    );
  }

  /**
   * Renders layout select
   */
  private renderLayoutSelect = (pageData: ExhibitionPage) => {
    const { layouts, onLayoutChange } = this.props;
    const layoutSelectItems = layouts.map(layout => {
      return (
        <MenuItem key={ layout.id } value={ layout.id }>{ layout.name }</MenuItem>
      );
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <InputLabel id="pageLayoutId">{ strings.exhibition.pageEditor.pageLayoutLabel }</InputLabel>
        <Select variant="filled" labelId="pageLayoutId" fullWidth value={ pageData.layoutId } onChange={ onLayoutChange }>
          { layoutSelectItems }
        </Select>
      </div>
    );
  }

  /**
   * Renders device select
   */
  private renderDeviceSelect = (pageData: ExhibitionPage) => {
    const { devices, onDeviceChange } = this.props;
    const selectItems = devices.map(device => {
      return (
        <MenuItem key={ device.id || "" } value={ device.id }>{ device.name }</MenuItem>
      );
    });

    return (
      <>
        <InputLabel id="pageDeviceId">{ strings.exhibition.pageEditor.pageDeviceLabel }</InputLabel>
        <Select variant="filled" labelId="pageDeviceId" fullWidth value={ pageData.deviceId } onChange={ onDeviceChange }>
          { selectItems }
        </Select>
      </>
    );
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    layouts: state.layouts.layouts
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PageSettingsEditor));