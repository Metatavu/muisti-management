import { PageLayoutWidgetType, ExhibitionPageResourceType } from "../../generated/client";

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
 * Custom tab structure
 * TODO: This should be defined in api-spec
 */
export interface TabStructure {
  tabs: Tab[];
}

/**
 * Custom Tab interface
 */
export interface Tab {
  label: string;
  properties: TabProperty[];
  resources: TabResource[];
}

/**
 * Custom TabProperty interface
 */
export interface TabProperty {
  name: string;
  type: string;
  value: string;
}

/**
 * Custom TabResource interface
 */
export interface TabResource {
  id: string;
  data: string;
  type: ExhibitionPageResourceType;
}