import * as React from "react";
import { IconButton, Dialog, Paper, Typography } from "@mui/material";
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import styles from "../../styles/components/content-editor/resource-editor";
import MediaLibrary from "../right-panel-editors/media-library";
import { AccessToken, MediaType } from "../../types";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CloseIcon from '@mui/icons-material/Close';
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
        size="large"
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
            <IconButton onClick={ closeDialog } size="large">
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
  )
}

export default withStyles(styles)(MediaLibraryButton);