import * as React from "react";
import { ExhibitionPage, ExhibitionPageResource, ExhibitionPageEventTrigger, PageLayout, ExhibitionDevice, ExhibitionPageTransition } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';
import ChevronRightIcon from '@material-ui/icons/ArrowRight';
import slugify from "slugify";
import { TreeView, TreeItem } from "@material-ui/lab";
import theme from "../../styles/theme";
import AddIcon from '@material-ui/icons/Add';
import PageTransitionsEditor from "../left-middle-panel-editors/page-transitions-editor";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layouts: PageLayout[];
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
  pageData: ExhibitionPage;
  eventTriggers: ExhibitionPageEventTrigger[];
  resources: ExhibitionPageResource[];
  onPageNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPageTransitionChange: (transition: ExhibitionPageTransition[], transitionType: string) => void;
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
          { this.renderTransitions(pageData) }
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
    const { onResourceClick, onAddResourceClick, resources, classes } = this.props;

    const items = resources.map((resource, index) => {
      const label = slugify(`${resource.id}`);
      return <TreeItem nodeId={ `resource-${index}` } label={ label } onClick={ () => onResourceClick(resource) } />;
    });

    const addResourceLabel = (
      <div className={ classes.addNewLabel }>
        <AddIcon fontSize="small" />
        { strings.exhibition.addResource }
      </div>
    );

    return (
      <TreeItem nodeId="resources" label={ strings.exhibition.resources.title }>
        { items }
        <TreeItem nodeId={ "resource-new" } label={ addResourceLabel } onClick={ onAddResourceClick } />
      </TreeItem>
    );
  }

  /**
   * Renders event triggers tree
   */
  private renderEventTriggersTree = () => {
    const { onEventTriggerClick, onAddEventTriggerClick, eventTriggers, classes } = this.props;

    const items = eventTriggers.map((_eventTrigger: ExhibitionPageEventTrigger, index) => {
      const label = strings.formatString(strings.exhibition.eventTrigger, index + 1);
      return <TreeItem nodeId={ `event-${index}` } label={ label } onClick={ () => onEventTriggerClick(index) } />
    });

    const addEventTriggerLabel = (
      <div className={ classes.addNewLabel }>
        <AddIcon fontSize="small" />
        { strings.exhibition.addEventTrigger }
      </div>
    );

    return (
      <TreeItem nodeId="event-triggers" label={ strings.exhibition.eventTriggers.title }>
        { items }
        <TreeItem nodeId={ "event-trigger-new" } label={ addEventTriggerLabel } onClick={ onAddEventTriggerClick }/>
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
        <InputLabel id="pageLayoutId">{ strings.exhibition.pageSettingsEditor.pageLayoutLabel }</InputLabel>
        <Select variant="filled" labelId="pageLayoutId" fullWidth value={ pageData.layoutId } onChange={ onLayoutChange }>
          { layoutSelectItems }
        </Select>
      </div>
    );
  }

  /**
   * Renders layout select
   * @param pageData selected exhibition page
   */
  private renderTransitions = (pageData: ExhibitionPage) => {
    const { onPageTransitionChange, devices, pages } = this.props;
    return (
      <PageTransitionsEditor
        exhibitionPage={ pageData }
        onPageTransitionChange={ onPageTransitionChange }
        exhibitionDevices={ devices }
        exhibitionPages={ pages }
      />
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
        <InputLabel id="pageDeviceId">{ strings.exhibition.pageSettingsEditor.pageDeviceLabel }</InputLabel>
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
