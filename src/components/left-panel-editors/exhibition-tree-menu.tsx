import { Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-tree-menu";
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
  treeData: TreeNodeInArray[];
  focusKey?: string;
}

/**
 * Component for exhibition tree menu
 */
class ExhibitionTreeMenu extends React.Component<Props, {}> {
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
    const { classes, treeData, focusKey } = this.props;

    return (
      <div className={classes.treeView}>
        <TreeMenu
          data={treeData}
          focusKey={focusKey ? focusKey : ""}
          onClickItem={({ key, label, ...props }) => {
            props.onSelect(props.parents, props.element);
          }}
        >
          {({ search, items }) => (
            <>
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
  private renderTreeMenuItem = ({
    level,
    focused,
    hasNodes,
    toggleNode,
    isOpen,
    label,
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
   * Handler for on node click event
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionTreeMenu));
