import * as React from "react";
import { WithStyles, withStyles, IconButton, Dialog, Paper, Typography } from "@material-ui/core";
import styles from "../../styles/components/content-editor/resource-editor";
import MediaLibrary from "../right-panel-editors/media-library";
import { AccessToken, MediaType } from "../../types";
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import CloseIcon from '@material-ui/icons/Close';
import strings from "../../localization/strings";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  mediaType: MediaType;
  currentUrl: string;
  onUpdate: (url: string) => void;
}

/**
 * Component for dynamic resource editor
 * 
 * @param props component props
 */
const MediaLibraryButton: React.FC<Props> = (props: Props) => {
  const { classes, accessToken, currentUrl, mediaType, onUpdate } = props;
  const [ open, setOpen ] = React.useState(false);
  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return (
    <>
      <IconButton
        className={ classes.iconButton }
        onClick={ openDialog }
      >
        <FolderOpenIcon/>
      </IconButton>
      <Dialog
        open={ open }
        onBackdropClick={ closeDialog }
      >
        <Paper className={ classes.mediaLibraryDialog }>
          <div className={ classes.mediaLibraryDialogTitle }>
            <Typography variant="h3">
              { strings.mediaLibrary.selectMedia }
            </Typography>
            <IconButton onClick={ closeDialog }>
              <CloseIcon/>
            </IconButton>
          </div>
          <MediaLibrary
            startsOpen
            accessToken={ accessToken }
            mediaType={ mediaType }
            currentUrl={ currentUrl }
            onUrlChange={ (newUrl: string) => {
              onUpdate(newUrl);
              closeDialog();
            }}
          />
        </Paper>
      </Dialog>
    </>
  );
}

export default withStyles(styles)(MediaLibraryButton);