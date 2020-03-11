import * as React from "react";

import { ContentRect } from 'react-measure'
import { WithStyles, withStyles, Typography } from '@material-ui/core';
import styles from "../../../styles/page-layout-preview";
import { PageLayoutView, PageLayoutViewProperty } from "../../../generated/client";
import PageLayoutPreviewFrameLayout from "./page-layout-preview-frame-layout";
import PageLayoutPreviewTextView from "./page-layout-preview-text-view";
import PageLayoutPreviewButton from "./page-layout-preview-button";
import PageLayoutPreviewImageView from "./page-layout-preview-image-view";
import PageLayoutPreviewRelativeLayout from "./page-layout-preview-relative-layout";

import DisplayMetrics from "../display-metrics";
import { CSSProperties } from "@material-ui/core/styles/withStyles";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view?: PageLayoutView;
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
class PageLayoutPreviewComponent extends React.Component<Props, State> {

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
    const { classes } = this.props;
    
    return (
      <div className={ classes.root } style={ this.props.style }>
        { this.renderComponent() }
      </div>
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
        return <PageLayoutPreviewFrameLayout 
          onResize={ this.props.onResize } 
          handleLayoutProperties={ this.props.handleLayoutProperties } 
          view={ this.props.view } 
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale }/>
      case "TextView":
        return <PageLayoutPreviewTextView 
          onResize={ this.props.onResize } 
          handleLayoutProperties={ this.props.handleLayoutProperties } 
          view={ this.props.view } 
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale }/>
      case "Button":
        return <PageLayoutPreviewButton 
          onResize={ this.props.onResize } 
          handleLayoutProperties={ this.props.handleLayoutProperties } 
          view={ this.props.view } 
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale }/>
      case "ImageView":
        return <PageLayoutPreviewImageView 
          onResize={ this.props.onResize } 
          handleLayoutProperties={ this.props.handleLayoutProperties } 
          view={ this.props.view } 
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale }/>          
      case "RelativeLayout":
        return <PageLayoutPreviewRelativeLayout 
          onResize={ this.props.onResize } 
          handleLayoutProperties={ this.props.handleLayoutProperties } 
          view={ this.props.view } 
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale }/>          
      default:
        return <Typography> Unsupported widget { this.props.view.widget } </Typography>
    }
  }
}

export default withStyles(styles)(PageLayoutPreviewComponent);