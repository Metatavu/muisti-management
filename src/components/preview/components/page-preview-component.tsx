import * as React from "react";

import { ContentRect } from 'react-measure';
import { Typography } from '@mui/material';
import { PageLayoutView, PageLayoutViewProperty, PageLayoutWidgetType } from "../../../generated/client";
import PagePreviewFrameLayout from "./page-preview-frame-layout";
import PagePreviewTextView from "./page-preview-text-view";
import PagePreviewFlowTextView from "./page-preview-flow-text-view";
import PagePreviewButton from "./page-preview-button";
import PagePreviewTouchableOpacity from "./page-preview-touchable-opacity";
import PagePreviewImageView from "./page-preview-image-view";
import PagePreviewRelativeLayout from "./page-preview-relative-layout";
import PagePreviewPlayerView from "./page-preview-player-view";
import PagePreviewMediaView from "./page-preview-media-view";
import PagePreviewLinearLayout from "./page-preview-linear-layout";
import PagePreviewMaterialTab from "./page-preview-material-tab";

import DisplayMetrics from "../../../types/display-metrics";
import { CSSProperties } from '@mui/material/styles';
import { ResourceMap } from "../../../types";
import { ExhibitionPageTabHolder } from "../../content-editor/constants";

/**
 * Interface representing component properties
 */
interface Props {
  view?: PageLayoutView;
  parentView?: PageLayoutView;
  selectedView?: PageLayoutView;
  layer?: number;
  resourceMap: ResourceMap;
  style?: CSSProperties;
  scale: number;
  displayMetrics: DisplayMetrics;
  tabMap?: Map<string, ExhibitionPageTabHolder>;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (properties: PageLayoutViewProperty[], styles: CSSProperties) => CSSProperties;
  onViewClick?: (view: PageLayoutView) => void;
  onTabClick?: (viewId: string, newIndex: number) => void;
}

/**
 * Wrapper component for all page layout components
 */
const PagePreviewComponent: React.FC<Props> = props => {
  const { view, layer } = props;
  if (!view) {
    return null;
  }

  const pagePreviewProps = {
    ...props,
    view,
    layer: (layer ?? 0) + 1
  };

  // TODO: Add proper preview components for MapView, WebView and VisitorsView
  switch (view.widget) {
    case PageLayoutWidgetType.FrameLayout:
    case PageLayoutWidgetType.VisitorsView:
      return <PagePreviewFrameLayout { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.LinearLayout:
      return <PagePreviewLinearLayout { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.TextView:
      return <PagePreviewTextView { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.FlowTextView:
      return <PagePreviewFlowTextView { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.Button:
      return <PagePreviewButton { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.TouchableOpacity:
      return <PagePreviewTouchableOpacity { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.ImageView:
      return <PagePreviewImageView { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.PlayerView:
      return <PagePreviewPlayerView { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.MediaView:
      return <PagePreviewMediaView { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.RelativeLayout:
      return <PagePreviewRelativeLayout { ...pagePreviewProps }/>;
    case PageLayoutWidgetType.MaterialTabLayout:
      return <PagePreviewMaterialTab { ...pagePreviewProps }/>;
    default:
      return <Typography>Unsupported widget { view.widget }</Typography>;
  }
}

export default PagePreviewComponent;
