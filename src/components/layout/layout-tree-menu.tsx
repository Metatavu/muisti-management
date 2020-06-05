import * as React from "react";
import { PageLayout, PageLayoutView } from "../../generated/client";
import strings from "../../localization/strings";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, FilledInput, InputAdornment, List, ListItem, ListItemSecondaryAction, IconButton, Grid, Typography, Divider, TextField } from "@material-ui/core";
import styles from "../../styles/exhibition-tree-menu";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import TreeMenu, { TreeMenuItem, TreeNodeInArray } from "react-simple-tree-menu";
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/AddCircle';
import classNames from "classnames";
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';
import ChevronRightIcon from '@material-ui/icons/ArrowRight';
import { PageLayoutElementType } from "../../types";
import { setSelectedLayout } from "../../actions/layouts";
import { constructTreeDeleteData, pushNewPageLayoutViewToTree, getWidgetType } from "./utils/tree-data-utils";
import GenericDialog from '../generic/generic-dialog';
import theme from "../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayout: PageLayout;
  onSelect: (element: PageLayoutView, type: PageLayoutElementType, path: string) => void;
  setSelectedLayout: typeof setSelectedLayout;
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
 * Interface for tree data parameters
 */
interface TreeDataParams {
  pageLayout: PageLayout;
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
    const { classes, pageLayout, onSelect} = this.props;

    const treeData = this.constructDisplayTreeData({
      pageLayout
    });

    return (
      <>
        <div className={ classes.treeView }>
          <TreeMenu
            data={ treeData }
            onClickItem={({ key, label, ...props }) => {
              onSelect(props.element, props.type, props.path);
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
    const { level, focused, hasNodes, toggleNode, isOpen, label } = item;
    const path = item.path;
    return (
      <>
        <ListItem { ...item }
          className={ classNames( classes.listItem, focused ? "focused" : "" ) }
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
            <IconButton edge="end" aria-label="delete" onClick={ () => this.onLayoutViewPropertyDeleteClick(path) }>
              <DeleteIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={ () => this.onLayoutViewPropertyAddClick(path) }>
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
    return (<>
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.layoutEditor.addLayoutViewDialog.id }</Typography>
            <TextField
              fullWidth
              type="text"
              name="id"
              value={ newPageLayoutView.id }
              onChange={ this.handleTextChange }
            />
            <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
          </Grid>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.layoutEditor.addLayoutViewDialog.widget }</Typography>
            <TextField
              fullWidth
              type="text"
              name="widget"
              value={ newPageLayoutView.widget }
              onChange={ this.handleTextChange }
            />
            <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
          </Grid>
        </Grid>
    </>);
  }

  /**
   * Constructs tree data
   *
   * @param dataParams tree data params
   */
  private constructDisplayTreeData = (dataParams: TreeDataParams) => {
    const { pageLayout } = dataParams;
    const treeData = [{
      key: pageLayout.data.id,
      path: pageLayout.data.id,
      label: pageLayout.data.widget,
      element: pageLayout.data,
      type: getWidgetType(pageLayout.data.widget),
      parents: [ ],
      nodes: pageLayout.data.children.map(childPageLayoutView => {
        return this.getDisplayNode(pageLayout.data.id, pageLayout.data, childPageLayoutView);
      })
    }];
    return treeData;
  }

  private getDisplayNode = (pathString: string, parentPageLayoutView: PageLayoutView, layoutView: PageLayoutView): TreeNodeInArray => {
    const path = `${pathString}/${layoutView.id}`;
    return {
      key: layoutView.id,
      path: path,
      label: layoutView.widget,
      element: layoutView,
      type: getWidgetType(layoutView.widget),
      parents: [ parentPageLayoutView ],
      nodes: layoutView.children.map(child => {
        return this.getDisplayNode(path, layoutView, child);
      })
    };
  }

  /**
   * Handler for on node click event
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
   * On layout view property delete click handler
   * @param path path to the element to be deleted inside the tree structure
   */
  private onLayoutViewPropertyDeleteClick = (path: string) => {
    const { setSelectedLayout } = this.props;
    const currentPageLayout = { ...this.props.pageLayout } as PageLayout;
    const pageLayoutToUpdate = constructTreeDeleteData(currentPageLayout, path);
    setSelectedLayout(pageLayoutToUpdate);
  }

  /**
   * On layout view property add click handler
   * @param path path to the parent element where the new child item will be added
   */
  private onLayoutViewPropertyAddClick = (path: string) => {
    const newPageLayoutView: PageLayoutView = {
      id: "",
      widget: "",
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
   * On dialog confirm click handler
   */
  private onConfirmClick = () => {
    const { newPageLayoutView, newPageLayoutViewPath } = this.state;
    const { setSelectedLayout } = this.props;

    if (!newPageLayoutView || !newPageLayoutViewPath) {
      return;
    }

    const currentPageLayout = { ...this.props.pageLayout } as PageLayout;
    const pageLayoutToUpdate = pushNewPageLayoutViewToTree(currentPageLayout, newPageLayoutView, newPageLayoutViewPath);
    setSelectedLayout(pageLayoutToUpdate);

    this.setState({
      addPropertyDialogOpen : false,
      newPageLayoutView: undefined,
      newPageLayoutViewPath: ""
    });

  }

  /**
   * On dialog close or cancel click handler
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addPropertyDialogOpen : false,
      newPageLayoutView: undefined,
      newPageLayoutViewPath: ""
    });
  }

  /**
   * Dialog text field change handler
   * @param event change event
   */
  private handleTextChange = (event: React.ChangeEvent<{ name?: string | undefined; value: any }>) => {
    const { newPageLayoutView } = this.state;

    const key = event.target.name;
    const value = event.target.value as string;

    if (!newPageLayoutView || !key) {
      return;
    }

    this.setState({
      newPageLayoutView : { ...newPageLayoutView, [key]: value }
    });
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    pageLayout: state.layouts.selectedLayout as PageLayout,
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutEditorTreeMenu));