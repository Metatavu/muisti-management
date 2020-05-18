import * as React from "react";
import { Exhibition, PageLayout, PageLayoutView } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, FilledInput, InputAdornment, List, ListItem } from "@material-ui/core";
import styles from "../../styles/exhibition-tree-menu";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux"
import TreeMenu, { TreeMenuItem, TreeNodeInArray } from "react-simple-tree-menu";
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import classNames from "classnames"
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';
import ChevronRightIcon from '@material-ui/icons/ArrowRight';
import { PageLayoutElementType } from "../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayout: PageLayout;
  onSelect: (parents: PageLayoutView[], element: PageLayoutView, type: PageLayoutElementType) => void;
}

/**
 * Interface representing component state
 */
interface State {
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
      loading: false
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, pageLayout, onSelect} = this.props;

    const treeData = this.constructTreeData({
      pageLayout
    });
    
    return (
      <div className={ classes.treeView }>
        <TreeMenu
          data={ treeData }
          onClickItem={({ key, label, ...props }) => {
            onSelect(props.parents, props.element, props.type);
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

    return (
      <ListItem { ...item }
        className={ classNames( classes.listItem, focused ? "focused" : "" ) }
        style={{ paddingLeft: level * 20 }}
      >
        <div style={{ display: 'inline-block' }} onClick={ this.onNodeClick(hasNodes, toggleNode) }>
          { toggleIcon(isOpen) }
        </div>
        { label }
      </ListItem>
    );
  }

  /**
   * Constructs tree data
   *
   * @param dataParams tree data params
   */
  private constructTreeData = (dataParams: TreeDataParams) => {
    const { pageLayout } = dataParams;

    const treeData = [{
      key: pageLayout.data.id,
      label: pageLayout.data.widget,
      element: pageLayout.data,
      type: PageLayoutElementType.ROOT,
      parents: [ ],
      nodes: pageLayout.data.children.map(childPageLayoutView => {
        return this.getNode(pageLayout.data, childPageLayoutView);
      })
    }];
    return treeData;
  }

  private getNode = (parentPageLayoutView: PageLayoutView, layoutView: PageLayoutView): TreeNodeInArray => {

    return {
      key: layoutView.id,
      label: layoutView.widget,
      element: layoutView,
      type: PageLayoutElementType.ROOT,
      parents: [ parentPageLayoutView ],
      nodes: layoutView.children.map(child => {
        return this.getNode(layoutView, child);
      })
    }
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
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    exhibition: state.exhibitions.selectedExhibition as Exhibition
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutEditorTreeMenu));