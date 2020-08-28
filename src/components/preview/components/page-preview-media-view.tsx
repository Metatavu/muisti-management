import * as React from "react";

import { ContentRect } from 'react-measure';
import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../../styles/page-preview";
import { PageLayoutView, PageLayoutViewProperty, ExhibitionPageResourceType } from "../../../generated/client";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import DisplayMetrics from "../../../types/display-metrics";
import PagePreviewImageView from "./page-preview-image-view";
import PagePreviewPlayerView from "./page-preview-player-view";
import { ResourceMap } from "../../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  resourceMap: ResourceMap;
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
 * Component for rendering Video views
 */
class PagePreviewMediaView extends React.Component<Props, State> {

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
   * Render
   */
  public render() {
    const srcType = this.getSrcType();

    switch (srcType) {
      case ExhibitionPageResourceType.Image:
        return <PagePreviewImageView
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      case ExhibitionPageResourceType.Video:
        return <PagePreviewPlayerView
          onResize={ this.props.onResize }
          handleLayoutProperties={ this.props.handleLayoutProperties }
          view={ this.props.view }
          displayMetrics={ this.props.displayMetrics }
          scale={ this.props.scale }
          resourceMap={ this.props.resourceMap }/>;
      default:
    }

    return null;
  }

  /**
   * Resolves a src type from resources. Defaults to image
   * 
   * @returns a src type
   */
  private getSrcType = (): ExhibitionPageResourceType => {
    const srcProperty = this.props.view.properties.find(property => property.name === "src");

    const id = srcProperty?.value;
    if (id && id.startsWith("@resources/")) {
      const resource = this.props.resourceMap[id.substring(11)];
      if (resource) {
        return resource.type;
      }
    }

    return ExhibitionPageResourceType.Image;
  }
}

export default withStyles(styles)(PagePreviewMediaView);