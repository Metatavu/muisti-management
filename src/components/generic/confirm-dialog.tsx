import * as React from "react";

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography, Box } from "@material-ui/core";
import { ConfirmDialogData } from "../../types";

/**
 * Interface representing component properties
 */
interface Props {
  open: boolean;
  confirmDialogData: ConfirmDialogData;
}

/**
 * Interface representing component state
 */
interface State { }

/**
 * React component displaying confirm dialogs
 */
export default class ConfirmDialog extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = { };
  }

  /**
   * Component render method
   */
  public render = () => {
    const {
      open,
      confirmDialogData
    } = this.props;

    const dialogText = confirmDialogData.deletePossible ? confirmDialogData.text : confirmDialogData.contentTitle;

    return (
      <>
        <Dialog
          open={ open }
          onClose={ confirmDialogData.onClose }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle disableTypography id="alert-dialog-title">{ confirmDialogData?.title }</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              { dialogText }
              { this.renderErrorMessage() }
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={ confirmDialogData.onCancel } color="primary">
              { confirmDialogData?.cancelButtonText }
            </Button>
            <Button
              disabled={ confirmDialogData ? !confirmDialogData?.deletePossible : false }
              disableElevation
              variant="contained"
              onClick={ confirmDialogData.onConfirm }
              color="secondary"
              autoFocus
            >
              { confirmDialogData?.positiveButtonText }
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  /**
   * Renders content specific error messages
   */
  private renderErrorMessage = () => {
    const { confirmDialogData } = this.props;

    if ( !confirmDialogData || confirmDialogData.deletePossible) {
      return null;
    }

    const contentMessage = confirmDialogData.contentSpecificMessages?.map(message => {
      const names = message.names.map(name => <Typography>{ name }</Typography>);
      return (
        <Box mt={ 2 } >
          <Typography>{ message.localizedMessage }</Typography>
          { names }
        </Box>
      );
    });

    return contentMessage;
  }
}