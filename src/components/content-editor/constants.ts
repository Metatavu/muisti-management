import {
  ExhibitionPageResourceType,
  PageLayoutWidgetType,
  PageResourceMode
} from "../../generated/client";

/**
 * File containing all constants/filters for content editor.
 */

/**
 * All widget types that can have editable resources.
 */
export const allowedWidgetTypes = [
  PageLayoutWidgetType.Button,
  PageLayoutWidgetType.TouchableOpacity,
  PageLayoutWidgetType.FlowTextView,
  PageLayoutWidgetType.ImageView,
  PageLayoutWidgetType.MediaView,
  PageLayoutWidgetType.PlayerView,
  PageLayoutWidgetType.TextView,
  PageLayoutWidgetType.MaterialTabLayout,
  PageLayoutWidgetType.WebView
];

/**
 * All page resource modes
 */
export const resourceModes = [
  PageResourceMode.Static,
  PageResourceMode.Dynamic,
  PageResourceMode.Scripted
];

/**
 * Custom tab structure
 * TODO: This should be defined in api-spec
 */
export interface TabStructure {
  contentContainerId?: string;
  tabs: ExhibitionPageTab[];
}

/**
 * Custom ExhibitionPageTab interface
 */
export interface ExhibitionPageTab {
  label: string;
  properties: ExhibitionPageTabProperty[];
  resources: ExhibitionPageTabResource[];
}

/**
 * Custom ExhibitionPageTabProperty interface
 */
export interface ExhibitionPageTabProperty {
  name: string;
  type: string;
  value: string;
}

/**
 * Custom ExhibitionPageTabResource interface
 */
export interface ExhibitionPageTabResource {
  id: string;
  data: string;
  type: ExhibitionPageResourceType;
}

/**
 * Custom exhibition page tab holder interface
 */
export interface ExhibitionPageTabHolder {
  tabComponent: TabStructure;
  activeTabIndex: number;
}

/**
 *  Text node type constant
 */
export const TEXT_NODE_TYPE = Node.TEXT_NODE;

/**
 * Source node name constant
 */
export const SOURCE_NODE_NAME = "SOURCE";

/**
 * Img node name constant
 */
export const IMG_NODE_NAME = "IMG";

/**
 * Allowed child node names for source node
 */
export const ALLOWED_CHILD_NODE_NAMES = [SOURCE_NODE_NAME, IMG_NODE_NAME];
