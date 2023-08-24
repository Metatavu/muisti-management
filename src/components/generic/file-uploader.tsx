import strings from "../../localization/strings";
import styles from "../../styles/dialog";
import { Button, CircularProgress } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { DropzoneDialog } from "mui-file-dropzone";
import * as React from "react";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  open?: boolean;
  uploadKey?: string;
  buttonText?: string;
  /**
   * File size in megabytes
   */
  maxFileSize?: number;
  controlled?: boolean;
  filesLimit?: number;
  allowedFileTypes: string[];
  onClose?: () => void;

  /**
   * Event callback for upload save click
   *
   * @param files files
   * @param key  upload key
   */
  onSave(files: File[], key?: string): void;
}

/**
 * Component states
 */
interface State {
  dialogOpen?: boolean;
  uploading: boolean;
}

/**
 * Generic file uploader UI component
 */
class FileUploader extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      uploading: false
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = () => {
    const { controlled } = this.props;
    if (!controlled) {
      this.setState({ dialogOpen: false });
    }
  };

  /**
   * Component render method
   */
  public render() {
    const { classes, controlled, buttonText } = this.props;

    if (this.state.uploading) {
      return (
        <div className={classes.imageUploadLoaderContainer}>
          <CircularProgress color="secondary" style={{ alignSelf: "center" }} />
        </div>
      );
    }

    return (
      <>
        {!controlled && (
          <Button disableElevation variant="contained" color="secondary" onClick={this.onOpenClick}>
            {buttonText || strings.generic.loadNew}
          </Button>
        )}

        {this.renderUploadDialog()}
      </>
    );
  }

  /**
   * Render upload dialog
   */
  private renderUploadDialog = () => {
    const { allowedFileTypes, controlled, maxFileSize, filesLimit } = this.props;
    const bytes = maxFileSize ? maxFileSize * 1000000 : 2000000;

    return (
      <DropzoneDialog
        acceptedFiles={allowedFileTypes}
        open={controlled ? this.props.open : this.state.dialogOpen}
        onClose={controlled ? this.props.onClose : this.onClose}
        onSave={this.onSave}
        cancelButtonText={strings.fileUpload.cancel}
        submitButtonText={strings.fileUpload.upload}
        showPreviewsInDropzone={false}
        maxFileSize={bytes}
        filesLimit={filesLimit || 1}
        fileObjects={[]}
      />
    );
  };

  /**
   * Open upload image dialog
   */
  private openDialog = () => {
    this.setState({
      dialogOpen: true
    });
  };

  /**
   * Close upload image dialog
   */
  private closeDialog = () => {
    this.setState({
      dialogOpen: false
    });
  };

  /**
   * Event handler for dialog open button click
   */
  private onOpenClick = () => {
    if (!this.props.controlled) {
      this.openDialog();
    }
  };

  /**
   * Event handler for dialog close click
   */
  private onClose = () => {
    if (!this.props.controlled) {
      this.closeDialog();
    }
  };

  /**
   * Event handler for dialog save click
   */
  private onSave = async (files: File[]) => {
    const { controlled } = this.props;

    this.setState({ uploading: true });

    if (!controlled) {
      this.closeDialog();
    }

    this.props.onSave(files, this.props.uploadKey);
    this.setState({ uploading: false });
  };
}

export default withStyles(styles)(FileUploader);
