import { PageLayoutWidgetType, ExhibitionPageResourceType, PageResourceMode } from "../../generated/client";

/**
 * File containing all constants/filters for content editor.
 */

/**
 * All widget types that can have editable resources.
 */
export const allowedWidgetTypes = [
  PageLayoutWidgetType.Button,
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
]

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