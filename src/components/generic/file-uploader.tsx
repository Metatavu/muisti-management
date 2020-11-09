import * as React from "react";
import { withStyles, WithStyles, Button, CircularProgress } from "@material-ui/core";
import styles from "../../styles/dialog";
import { DropzoneDialog } from "material-ui-dropzone";
import strings from "../../localization/strings";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  open?: boolean;
  uploadKey?: string;
  buttonText?: string;
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
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, controlled, buttonText } = this.props;

    if (this.state.uploading) {
      return (
        <div className={ classes.imageUploadLoaderContainer }>
          <CircularProgress color="secondary" style={{ alignSelf: "center" }}></CircularProgress>
        </div>
      );
    }

    return (
      <>
        { !controlled &&
          <Button disableElevation variant="contained" color="secondary" onClick={ this.onOpenClick }>
            { buttonText || strings.generic.loadNew }
          </Button>
        }

        { this.renderUploadDialog() }
      </>
    );
  }

  /**
   * Render upload dialog
   */
  private renderUploadDialog = () => {
    const { allowedFileTypes, controlled, maxFileSize, filesLimit } = this.props;

    return (
      <DropzoneDialog
        acceptedFiles={ allowedFileTypes }
        open={ controlled ? this.props.open : this.state.dialogOpen }
        onClose={ controlled ? this.props.onClose : this.onClose }
        onSave={ this.onSave }
        cancelButtonText={ strings.fileUpload.cancel }
        submitButtonText={ strings.fileUpload.upload }
        maxFileSize={ maxFileSize || 200000000 }
        showPreviewsInDropzone={ false }
        filesLimit={ filesLimit || Number.MAX_SAFE_INTEGER  }
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
    if (!this.props.controlled) {
      this.openDialog();
    }
  }

  /**
   * Event handler for dialog close click
   */
  private onClose = () => {
    if (!this.props.controlled) {
      this.closeDialog();
    }
  }

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
  }
}

export default withStyles(styles)(FileUploader);
