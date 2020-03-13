import * as React from "react";

import { WithStyles, withStyles } from '@material-ui/core';
import styles from "../../styles/page-preview";
import PagePreviewComponentEditor from "./components/page-preview-component";
import { PageLayoutView, PageLayoutViewProperty, ExhibitionPageResource } from "../../generated/client";
import DisplayMetrics from "../../types/display-metrics";
import { CSSProperties } from "@material-ui/core/styles/withStyles";
import AndroidUtils from "../../utils/android-utils";
import { ResourceMap } from "../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  view?: PageLayoutView;
  resources?: ExhibitionPageResource[];
  scale: number;
  displayMetrics: DisplayMetrics;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for page layout preview
 */
class PagePreview extends React.Component<Props, State> {

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

    const height = this.props.displayMetrics.heightPixels * this.props.scale;
    const width = this.props.displayMetrics.widthPixels * this.props.scale;

    return (
      <div className={ classes.root } style={{ position: "absolute", width: width, height: height  }}>
        <PagePreviewComponentEditor 
          view={ this.props.view } 
          displayMetrics={ this.props.displayMetrics } 
          scale={ this.props.scale } 
          resourceMap={ this.getResourceMap() }
          handleLayoutProperties={ this.onHandleLayoutProperties }/>
      </div>
    );
  }

  /**
   * Handles an unknown property logging
   * 
   * @param property unknown property
   * @param reason reason why the property was unknown
   */
  private handleUnknownProperty = (property: PageLayoutViewProperty, reason: string) => {
    console.log(`PagePreview: don't know how to handle layout property because ${reason}`, property.name, property.value);
  }

  /**
   * Handles a child component layouting 
   * 
   * @param childProperties child component properties
   * @param childStyles child component styles
   * @return modified child component styles
   */
  private onHandleLayoutProperties = (childProperties: PageLayoutViewProperty[], childStyles: CSSProperties): CSSProperties => {
    const result = { ...childStyles };

    childProperties
      .filter(property => property.name.startsWith("layout_"))
      .forEach(property => {
        switch (property.name) {
          case "layout_width":
            if ("match_parent" === property.value) {
              result.width = "100%";
            } else {
              this.handleUnknownProperty(property, "Unknown value");
            }
          break;
          case "layout_height":
            if ("match_parent" === property.value) {
              result.height = "100%";
            } else {
              const px = AndroidUtils.stringToPx(this.props.displayMetrics, property.value, this.props.scale);
              if (px) {
                result.height = px
              } else {
                this.handleUnknownProperty(property, "Unknown value");
              }  
            }
          break;
          default:
            this.handleUnknownProperty(property, "Unknown layout property");
          break;
        }
      });

    return result;
  }

  /**
   * Returns resources as a map
   * 
   * @returns resources as a map
   */
  private getResourceMap = () => {
    const result: ResourceMap = {};

    (this.props.resources || []).forEach((resource) => {
      result[resource.id] = resource;
    });

    return result;
  }

}

export default withStyles(styles)(PagePreview);