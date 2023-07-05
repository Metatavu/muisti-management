import { ExhibitionPageResourceType } from "../../generated/client";
import styles from "../../styles/components/generic/tab-item";
import { ExhibitionPageTabResource } from "../content-editor/constants";
import { Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import ReactHtmlParser from "react-html-parser";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  index: number;
  resource: ExhibitionPageTabResource;
  visible: boolean;
}

/**
 * React functional component for tab items
 *
 * @param props component props
 */
const TabItem: React.FC<Props> = (props: Props) => {
  const { classes, resource, index, visible } = props;

  return (
    <div
      hidden={!visible}
      id={`simple-tabpanel-${index}`}
      className={visible ? classes.visible : classes.hidden}
    >
      {renderTabContent(resource, props)}
    </div>
  );
};

/**
 * Get tab content by content type
 *
 * @param resource tab resource
 * @param props component props
 * @returns content as React element
 */
const renderTabContent = (resource: ExhibitionPageTabResource, props: Props) => {
  const { type, data } = resource;
  switch (type) {
    case ExhibitionPageResourceType.Text:
      return getTextContent(data);
    case ExhibitionPageResourceType.Html:
      return getHtmlContent(data);
    case ExhibitionPageResourceType.Image:
      return getImageContent(data, props);
    case ExhibitionPageResourceType.Video:
      return getVideoContent(data, props);
    case ExhibitionPageResourceType.Svg:
      return getSvgContent(data);
    default:
      return null;
  }
};

/**
 * Get text content
 *
 * @param text text string
 * @returns text as React element
 */
const getTextContent = (text: string) => {
  return <Typography variant="body1">{text}</Typography>;
};

/**
 * Get html content
 *
 * @param htmlData html data
 * @returns html data as React element
 */
const getHtmlContent = (htmlString: string) => {
  const html = new DOMParser().parseFromString(htmlString, "text/html");
  return ReactHtmlParser(html.body.innerHTML);
};

/**
 * Get image content
 *
 * @param imageUrl image url
 * @param props component props
 * @returns image as React element
 */
const getImageContent = (imageUrl: string, props: Props) => {
  const { classes } = props;

  return (
    <div className={classes.mediaContainer}>
      <img src={imageUrl} alt="preview" className={classes.image} />
    </div>
  );
};

/**
 * Get video content
 *
 * @param videoUrl video url
 * @param props component props
 * @returns video as React element
 */
const getVideoContent = (videoUrl: string, props: Props) => {
  const { classes } = props;
  return (
    <div className={classes.mediaContainer}>
      <video autoPlay={true} controls={true} className={classes.video}>
        <source src={videoUrl} />
      </video>
    </div>
  );
};

/**
 * Get SVG content
 *
 * @param svg svg string
 */
const getSvgContent = (svgString: string) => {
  const svg = new DOMParser().parseFromString(svgString, "application/xml");
  return ReactHtmlParser(svg.body.innerHTML);
};

export default withStyles(styles)(TabItem);
