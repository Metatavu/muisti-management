import { PageLayoutWidgetType } from "../../generated/client";

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
  PageLayoutWidgetType.TextView
];