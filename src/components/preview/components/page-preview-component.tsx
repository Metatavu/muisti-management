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
  resourceMap: ResourceMap;
  style?: CSSProperties;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (properties: PageLayoutViewProperty[], styles: CSSProperties) => CSSProperties;
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
    return (
      <>
        { this.renderComponent() }
      </>
    );
  }

  /**
   * Renders the actual component
   */
  private renderComponent = () => {
    if (!this.props.view) {
      return null;
    }

    switch (this.props.view.widget) {
      case "FrameLayout":
        return <PagePreviewFrameLayout
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "LinearLayout":
        return <PagePreviewLinearLayout
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "TextView":
        return <PagePreviewTextView
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "FlowTextView":
        return <PagePreviewFlowTextView
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "Button":
        return <PagePreviewButton
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "ImageView":
        return <PagePreviewImageView
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "PlayerView":
        return <PagePreviewPlayerView
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "MediaView":
        return <PagePreviewMediaView
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case "RelativeLayout":
        return <PagePreviewRelativeLayout
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      default:
        return <Typography> Unsupported widget { this.props.view.widget } </Typography>;
    }
  }
}

export default withStyles(styles)(PagePreviewComponent);