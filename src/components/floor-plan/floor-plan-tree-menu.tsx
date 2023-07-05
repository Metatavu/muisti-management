import { Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/components/floor-plan/floor-plan-tree-view";
import ExpandMoreIcon from "@mui/icons-material/ArrowDropDown";
import ChevronRightIcon from "@mui/icons-material/ArrowRight";
import { FilledInput, InputAdornment, List, ListItem } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import classNames from "classnames";
import * as React from "react";
import { connect } from "react-redux";
import TreeMenu, { TreeMenuItem, TreeNodeInArray } from "react-simple-tree-menu";
import { Dispatch } from "redux";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  treeRef?: React.Ref<TreeMenu>;
  treeNodes: TreeNodeInArray[];
  firstSelected?: string;
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
  openNodes: string[];
}

/**
 * Interface for generic tree node
 */
interface TreeNode {
  id: string;
  label: string;
  pathInTree: string;
  onClick: (hasNodes: boolean) => void;
  children: TreeNode[];
}

/**
 * Component for floor plan tree menu
 */
class FloorPlanTreeMenu extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      openNodes: []
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { treeRef, treeNodes, classes, firstSelected } = this.props;

    return (
      <div className={classes.treeView}>
        <TreeMenu
          data={treeNodes}
          ref={treeRef ?? undefined}
          onClickItem={({ key, label, ...props }) => props.onClick(props.hasNodes)}
          initialOpenNodes={[firstSelected || ""]}
          initialActiveKey={firstSelected || ""}
          initialFocusKey={firstSelected || ""}
        >
          {({ items, search }) => this.renderTreeMenu(items, search)}
        </TreeMenu>
      </div>
    );
  }

  /**
   * Renders tree menu
   *
   * @param search search function
   * @param items tree items
   */
  private renderTreeMenu = (items: TreeMenuItem[], search?: (term: string) => void) => {
    const { classes } = this.props;
    return (
      <div className={classes.treeMenu}>
        <FilledInput
          onChange={(e) => search && search(e.target.value)}
          placeholder={strings.exhibition.navigation.search}
          className={classes.searchBar}
          fullWidth
          endAdornment={
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          }
        />
        <List>{items.map((item) => this.renderTreeMenuItem(item))}</List>
      </div>
    );
  };

  /**
   * Renders tree menu item
   *
   * @param item tree menu item
   * @return menu item as ListItem
   */
  private renderTreeMenuItem = ({
    level = 0,
    hasNodes,
    isOpen,
    label,
    searchTerm,
    openNodes,
    matchSearch,
    focused,
    pathInTree,
    active,
    toggleNode,
    ...otherProps
  }: TreeMenuItem) => {
    const { classes } = this.props;
    const toggleIcon = (on: boolean) =>
      on ? (
        <ExpandMoreIcon htmlColor={focused ? "#fff" : "#888"} />
      ) : (
        <ChevronRightIcon htmlColor={focused ? "#fff" : "#888"} />
      );

    return (
      <ListItem
        {...otherProps}
        className={classNames(classes.listItem, focused ? "focused" : "")}
        style={{ paddingLeft: level * 20 }}
      >
        {hasNodes ? (
          <div style={{ display: "inline-block" }} onClick={this.onNodeClick(hasNodes, toggleNode)}>
            {toggleIcon(isOpen)}
          </div>
        ) : (
          <div style={{ display: "inline-block", marginLeft: 25 }} />
        )}
        {label}
      </ListItem>
    );
  };

  /**
   * Maps tree data
   *
   * @param nodes tree nodes
   */
  private mapTreeData = (nodes: TreeNode[]): TreeNodeInArray[] => {
    return nodes.length > 0
      ? nodes.map((node) => {
          return {
            key: node.id,
            label: node.label,
            onClick: node.onClick,
            nodes: node.children ? this.mapTreeData(node.children) : []
          };
        })
      : [];
  };

  /**
   * Handler for on node click event
   *
   * @param hasNodes has nodes
   * @param toggleNode handler method for toggle node
   */
  private onNodeClick =
    (hasNodes: boolean, toggleNode: (() => void) | undefined) =>
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (hasNodes && toggleNode) {
        toggleNode();
      }
      event.stopPropagation();
    };
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
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FloorPlanTreeMenu));
