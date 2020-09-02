import * as React from "react";

import { ContentRect } from 'react-measure';
import { WithStyles, withStyles, Typography } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import PagePreviewFrameLayout from "./page-preview-frame-layout";
import PagePreviewTextView from "./page-preview-text-view";
import PagePreviewFlowTextView from "./page-preview-flow-text-view";
import PagePreviewButton from "./page-preview-button";
import PagePreviewImageView from "./page-preview-image-view";
import PagePreviewRelativeLayout from "./page-preview-relative-layout";
import PagePreviewPlayerView from "./page-preview-player-view";
import PagePreviewMediaView from "./page-preview-media-view";
import PagePreviewLinearLayout from "./page-preview-linear-layout";

import DisplayMetrics from "../../../types/display-metrics";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import { ResourceMap } from "../../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view?: PageLayoutView;
  selectedView?: PageLayoutView;
  layer?: number;
  resourceMap: ResourceMap;
  style?: CSSProperties;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (properties: PageLayoutViewProperty[], styles: CSSProperties) => CSSProperties;
  onViewClick?: (view: PageLayoutView) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Wrapper component for all page layout components
 */
class PagePreviewComponent extends React.Component<Props, State> {

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
    const { classes, style } = this.props;

    return (
      <div className={ classes.previewComponent } style={ style }>
        { this.renderComponent() }
      </div>
    );
  }

  /**
   * Renders the actual component
   */
  private renderComponent = () => {
    const {
      view,
      selectedView,
      layer,
      displayMetrics,
      scale,
      resourceMap,
      onResize,
      handleLayoutProperties,
      onViewClick
    } = this.props;

    if (!view) {
      return null;
    }

    const zIndex = layer ? layer + 1 : 1;

    switch (view.widget) {
      case "FrameLayout":
        return <PagePreviewFrameLayout
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "LinearLayout":
        return <PagePreviewLinearLayout
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "TextView":
        return <PagePreviewTextView
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "FlowTextView":
        return <PagePreviewFlowTextView
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "Button":
        return <PagePreviewButton
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "ImageView":
        return <PagePreviewImageView
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "PlayerView":
        return <PagePreviewPlayerView
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "MediaView":
        return <PagePreviewMediaView
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      case "RelativeLayout":
        return <PagePreviewRelativeLayout
          onResize={ onResize }
          handleLayoutProperties={ handleLayoutProperties }
          view={ view }
          selectedView={ selectedView }
          layer={ zIndex }
          displayMetrics={ displayMetrics }
          scale={ scale }
          resourceMap={ resourceMap }
          onViewClick={ onViewClick }
        />;
      default:
        return <Typography> Unsupported widget { view.widget } </Typography>;
    }
  }
}

export default withStyles(styles)(PagePreviewComponent);