import * as React from "react";
import { withStyles, WithStyles, Button, CircularProgress } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneDialog } from "material-ui-dropzone";
import strings from "../../localization/strings";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  uploadKey?: string;
  allowedFileTypes: string[];
  buttonText: string;

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
  dialogOpen: boolean;
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
      dialogOpen: false,
      uploading: false
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    
    if (this.state.uploading) {
      return (
        <div className={ classes.imageUploadLoaderContainer }>
          <CircularProgress color="secondary" style={{ alignSelf: "center" }}></CircularProgress>
        </div>
      );
    }

    return (
      <>
        <Button disableElevation variant="contained" color="secondary" onClick={ this.onOpenClick }>
          { this.props.buttonText }          
        </Button>

        { this.renderUploadDialog() }
      </>
    );
  }

  /**
   * Render upload dialog
   */
  private renderUploadDialog = () => {
    const { allowedFileTypes } = this.props;

    return (
      <DropzoneDialog
        acceptedFiles={ allowedFileTypes }
        open={ this.state.dialogOpen }
        onClose={ this.onClose }
        onSave={ this.onSave }
        cancelButtonText={ strings.fileUpload.cancel }
        submitButtonText={ strings.fileUpload.upload }
        filesLimit={ 1 }
        maxFileSize={ 200000000 }
        showPreviewsInDropzone={ false }
      />
    );
  }

  /**
   * Open upload image dialog
   */
  private openDialog = () => {
    this.setState({
      dialogOpen: true
    });
  }

  /**
   * Close upload image dialog
   */
  private closeDialog = () => {
    this.setState({
      dialogOpen: false
    });
  }

  /**
   * Event handler for dialog open button click
   */
  private onOpenClick = () => {
    this.openDialog();
  }

  /**
   * Event handler for dialog close click
   */
  private onClose = () => {
    this.closeDialog();
  }

  /**
   * Event handler for dialog save click
   */
  private onSave = async (files: File[]) => {
    this.setState({ uploading: true })
    this.closeDialog();
    await this.props.onSave(files, this.props.uploadKey);
    this.setState({ uploading: false });
  }
}

export default withStyles(styles)(FileUploader);
