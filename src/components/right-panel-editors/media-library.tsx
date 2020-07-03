import * as React from "react";
import strings from "../../localization/strings";
import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  mediaType: MediaType;
  currentUrl: string;
  onUrlChange: (newUrl: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  MEDIA = "media"
}

/**
 * Component for media library
 */
const MediaLibrary = withStyles(styles)(class MediaLibrary extends React.Component<Props, State> {

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
   * Component render method
   */
  public render() {

    return (
      <div>Mediakirjasto</div>
    );
  }
});

export default MediaLibrary;