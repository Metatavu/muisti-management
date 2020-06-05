import * as React from "react";
import { ExhibitionPage, Exhibition, ContentVersion, ExhibitionFloor, ExhibitionRoom, ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, FilledInput, InputAdornment, List, ListItem } from "@material-ui/core";
import { ExhibitionElement, ExhibitionElementType } from '../../types';
import styles from "../../styles/exhibition-tree-menu";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux"
import TreeMenu, { TreeMenuItem, TreeNodeInArray } from "react-simple-tree-menu";
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import classNames from "classnames"
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';
import ChevronRightIcon from '@material-ui/icons/ArrowRight';
import PageUtils from "../../utils/page-utils";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  exhibition: Exhibition;
  contentVersions: ContentVersion[];
  floors: ExhibitionFloor[];
  rooms: ExhibitionRoom[];
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
  onSelect: (parents: ExhibitionElement[], element: ExhibitionElement) => void; 
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
  exhibition: Exhibition;
  contentVersions: ContentVersion[];
  floors: ExhibitionFloor[];
  rooms: ExhibitionRoom[];
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
}

/**
 * Component for exhibition tree menu
 */
class ExhibitionTreeMenu extends React.Component<Props, State> {

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
    const { classes, 
            exhibition, 
            contentVersions,
            floors,
            rooms,
            devices,
            pages,
            onSelect } = this.props;

    const treeData = this.constructTreeData({
      exhibition,
      contentVersions,
      floors,
      rooms,
      devices,
      pages
    });
    
    return (
      <div className={ classes.treeView }>
        <TreeMenu
          data={ treeData }
          onClickItem={({ key, label, ...props }) => {
            onSelect(props.parents, props.element);
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
        { hasNodes ?
          <div style={{ display: 'inline-block' }} onClick={ this.onNodeClick(hasNodes, toggleNode) }>
            { toggleIcon(isOpen) }
          </div>
          :
          <div style={{ display: 'inline-block', marginLeft: 25 }} />
        }
        { label }
      </ListItem>
    );
  }

  /**
   * Constructs tree data
   *
   * @param dataParams tree data params
   */
  private constructTreeData = (dataParams: TreeDataParams): TreeNodeInArray[] => {
    const { exhibition, contentVersions, floors, rooms, devices, pages } = dataParams;
    const exhibitionElement = {
      data: exhibition,
      type: ExhibitionElementType.EXHIBITION
    };

    const treeData = [{
      key: exhibition.id!,
      label: exhibition.name,
      element: exhibitionElement,
      parents: [ ],
      nodes: contentVersions.map(contentVersion => {
        const contentVersionElement = {
          data: contentVersion,
          type: ExhibitionElementType.CONTENT_VERSION
        };

        return {
          key: contentVersion.id!,
          label: contentVersion.name,
          element: contentVersionElement,
          parents: [ exhibitionElement ],
          nodes: floors.map(floor => {
            const floorElement = {
              data: floor,
              type: ExhibitionElementType.FLOOR
            };

            return {
              key: floor.id!,
              label: floor.name,
              element: floorElement,
              parents: [ exhibitionElement, contentVersionElement ],
              nodes: rooms.filter(room => room.floorId === floor.id).map(room => {
                const roomElement = {
                  data: room,
                  type: ExhibitionElementType.ROOM
                }; 
                
                return {
                  key: room.id!,
                  label: room.name,
                  element: roomElement,
                  parents: [ exhibitionElement, contentVersionElement, floorElement ],
                  nodes: devices.map(device => {
                    const deviceElement = {
                      data: device,
                      type: ExhibitionElementType.DEVICE
                    };

                    return {
                      key: device.id!,
                      label: device.name,
                      element: deviceElement,
                      parents: [ exhibitionElement, contentVersionElement, floorElement, roomElement ],
                      nodes: PageUtils.getSortedPages(pages.filter(page => page.deviceId === device.id)).map(page => {
                        return {
                          key: page.id!,
                          label: page.name,
                          element: {
                            data: page,
                            type: ExhibitionElementType.PAGE
                          },
                          parents: [ exhibitionElement, contentVersionElement, floorElement, roomElement, deviceElement ],
                          nodes: []
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }];

    return treeData;
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionTreeMenu));