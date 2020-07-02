import * as React from "react";
import { PageLayoutView } from "../../generated/client";
import strings from "../../localization/strings";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, FilledInput, InputAdornment, List, ListItem, ListItemSecondaryAction, IconButton, Grid, Divider, Select, MenuItem, InputLabel } from "@material-ui/core";
import styles from "../../styles/exhibition-tree-menu";
import TreeMenu, { TreeMenuItem, TreeNodeInArray } from "react-simple-tree-menu";
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/AddCircle';
import classNames from "classnames";
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';
import ChevronRightIcon from '@material-ui/icons/ArrowRight';
import GenericDialog from '../generic/generic-dialog';
import theme from "../../styles/theme";
import { v4 as uuid } from "uuid";
import { PageLayoutWidgetType } from "../../generated/client/models/PageLayoutWidgetType";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  treeData: TreeNodeInArray[];
  onSelect: (element: PageLayoutView, type: PageLayoutWidgetType, path: string) => void;
  onAdd: (pageLayoutView: PageLayoutView, path: string) => void;
  onDelete: (path: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
  addPropertyDialogOpen: boolean;
  newPageLayoutViewPath?: string;
  newPageLayoutView?: PageLayoutView;
}

/**
 * Component for exhibition tree menu
 */
class LayoutEditorTreeMenu extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      addPropertyDialogOpen: false
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, treeData } = this.props;

    return (
      <>
        <div className={ classes.treeView }>
          <TreeMenu
            data={ treeData }
            onClickItem={({ key, label, ...props }) => {
              props.onSelect(props.element, props.type, props.path);
            }}
          >
            {({ search, items }) => (
              <>
                <FilledInput 
                  onChange={ e => search && search(e.target.value) }
                  placeholder={ strings.exhibition.navigation.search }
                  className={ classes.searchBar }
                  fullWidth
                  endAdornment={
                    <InputAdornment position="end">
                      <SearchIcon/>
                    </InputAdornment>
                  }
                />
                <List>
                  { items.map(item => this.renderTreeMenuItem(item)) }
                </List>
              </>
            )}
          </TreeMenu>
        </div>
        <GenericDialog
          cancelButtonText={ strings.layoutEditor.addLayoutViewDialog.cancel }
          positiveButtonText={ strings.layoutEditor.addLayoutViewDialog.confirm }
          title={ strings.layoutEditor.addLayoutViewDialog.title }
          error={ false }
          onConfirm={ this.onConfirmClick }
          onCancel={ this.onCloseOrCancelClick }
          open={ this.state.addPropertyDialogOpen }
          onClose={ this.onCloseOrCancelClick }
        >
          { this.renderDialogContent() }
        </GenericDialog>
      </>
    );
  }


  /**
   * Renders tree menu item
   *
   * @param item tree menu item
   */
  private renderTreeMenuItem = (item: TreeMenuItem) => {
    const { classes } = this.props;
    const toggleIcon = (on: boolean) => on ? 
      <ExpandMoreIcon htmlColor={ focused ? "#fff" : "#888" } /> :
      <ChevronRightIcon htmlColor={ focused ? "#fff" : "#888" }  />;
    const { level, focused, hasNodes, toggleNode, isOpen, label, path } = item;
    return (
      <>
        <ListItem { ...item }
          className={ classNames(classes.listItem, focused ? "focused" : "") }
          style={{ paddingLeft: level * 20 }}
        >
          { hasNodes ?
            <div style={{ display: 'inline-block' }} onClick={ this.onNodeClick(hasNodes, toggleNode) }>
              { toggleIcon(isOpen) }
            </div>
            :
            <div style={{ display: 'inline-block', marginLeft: 25 }} />
          }
          { label }
          <ListItemSecondaryAction>
            { level > 0 &&
              <IconButton edge="end" aria-label="delete" onClick={ () => this.props.onDelete(path) }>
                <DeleteIcon />
              </IconButton>
            }
            <IconButton edge="end" aria-label="add" onClick={ () => this.onLayoutViewPropertyAddClick(path) }>
              <AddIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </>
    );
  }

  /**
   * Render dialog content
   */
  private renderDialogContent = () => {
    const { newPageLayoutView } = this.state;
    if (!newPageLayoutView) {
      return (<div/>);
    }

    const widgetItems = Object.keys(PageLayoutWidgetType).map(widget => {
      return (
        <MenuItem key={ widget } value={ widget }>{ widget }</MenuItem>
      );      
    });

    return (<>
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={ 12 }>
            <InputLabel id="widget" style={{ marginBottom: theme.spacing(2) }}>
              { strings.layoutEditor.addLayoutViewDialog.widget }
            </InputLabel>
            <Select
              variant="filled"
              labelId="widget"
              fullWidth
              name="widget"
              value={ newPageLayoutView.widget }
              onChange={ this.onWidgetChange }>
              { widgetItems }
            </Select>
            <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
          </Grid>
        </Grid>
    </>);
  }

  /**
   * Event handler for node click event
   *
   * @param hasNodes has nodes
   * @param toggleNode handler method for toggle node
   */
  private onNodeClick = (hasNodes: boolean, toggleNode: (() => void) | undefined) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (hasNodes && toggleNode) {
      toggleNode();
    }
    event.stopPropagation();
  }
  
  /**
   * Event handler for layout view property add click
   * 
   * @param path path to the parent element where the new child item will be added
   */
  private onLayoutViewPropertyAddClick = (path: string) => {
    const newPageLayoutView: PageLayoutView = {
      id: uuid(),
      widget: PageLayoutWidgetType.TextView,
      properties: [],
      children: []
    };

    this.setState({
      addPropertyDialogOpen: true,
      newPageLayoutViewPath: path,
      newPageLayoutView: newPageLayoutView
    });
  }

  /**
   * Event handler for dialog confirm click
   */
  private onConfirmClick = () => {
    const { newPageLayoutView, newPageLayoutViewPath } = this.state;
    if (!newPageLayoutView || !newPageLayoutViewPath) {
      return;
    }

    this.props.onAdd(newPageLayoutView, newPageLayoutViewPath);

    this.setState({
      addPropertyDialogOpen : false,
      newPageLayoutView: undefined,
      newPageLayoutViewPath: ""
    });

  }

  /**
   * Event handler for dialog close or cancel click
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addPropertyDialogOpen : false,
      newPageLayoutView: undefined,
      newPageLayoutViewPath: ""
    });
  }

  /**
   * Event handler for add dialog widget change
   * 
   * @param event React change event
   */
  private onWidgetChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { newPageLayoutView } = this.state;
    if (!newPageLayoutView) {
      return;
    }

    const widget = event.target.value as PageLayoutWidgetType;
    
    this.setState({
      newPageLayoutView : { ...newPageLayoutView, widget: widget }
    });
  }
}

export default withStyles(styles)(LayoutEditorTreeMenu);