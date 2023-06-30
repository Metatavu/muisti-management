import {
  ExhibitionPageResourceType,
  PageLayoutView,
  PageLayoutViewProperty
} from "../../../generated/client";
import styles from "../../../styles/page-preview";
import { ResourceMap } from "../../../types";
import DisplayMetrics from "../../../types/display-metrics";
import PagePreviewImageView from "./page-preview-image-view";
import PagePreviewPlayerView from "./page-preview-player-view";
import { CSSProperties } from "@mui/material/styles";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import { ContentRect } from "react-measure";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view: PageLayoutView;
  parentView?: PageLayoutView;
  selectedView?: PageLayoutView;
  layer: number;
  resourceMap: ResourceMap;
  scale: number;
  displayMetrics: DisplayMetrics;
  onResize?: (contentRect: ContentRect) => void;
  handleLayoutProperties: (
    properties: PageLayoutViewProperty[],
    styles: CSSProperties
  ) => CSSProperties;
  onViewClick?: (view: PageLayoutView) => void;
}

/**
 * Interface representing component state
 */
interface State {}

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
    const {
      view,
      parentView,
      selectedView,
      layer,
      onResize,
      handleLayoutProperties,
      displayMetrics,
      scale,
      resourceMap,
      onViewClick
    } = this.props;

    const srcType = this.getSrcType();

    switch (srcType) {
      case ExhibitionPageResourceType.Image:
        return (
          <PagePreviewImageView
            onResize={onResize}
            handleLayoutProperties={handleLayoutProperties}
            view={view}
            parentView={parentView}
            selectedView={selectedView}
            layer={layer}
            displayMetrics={displayMetrics}
            scale={scale}
            resourceMap={resourceMap}
            onViewClick={onViewClick}
          />
        );
      case ExhibitionPageResourceType.Video:
        return (
          <PagePreviewPlayerView
            onResize={onResize}
            handleLayoutProperties={handleLayoutProperties}
            view={view}
            parentView={parentView}
            selectedView={selectedView}
            layer={layer}
            displayMetrics={displayMetrics}
            scale={scale}
            resourceMap={resourceMap}
            onViewClick={onViewClick}
          />
        );
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
    const srcProperty = this.props.view.properties.find((property) => property.name === "src");

    const id = srcProperty?.value;
    if (id && id.startsWith("@resources/")) {
      const resource = this.props.resourceMap[id.substring(11)];
      if (resource) {
        return resource.type;
      }
    }

    return ExhibitionPageResourceType.Image;
  };
}

export default withStyles(styles)(PagePreviewMediaView);
