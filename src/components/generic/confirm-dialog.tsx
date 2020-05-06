import * as React from "react";

import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@material-ui/core";

/**
 * Interface representing component properties
 */
interface Props {
  title: string;
  text: string;
  positiveButtonText: string;
  cancelButtonText: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

/**
 * Interface representing component state
 */
interface State {

}

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
  public render() {
    const { 
      open,
      text,
      positiveButtonText,
      cancelButtonText,
      onClose,
      onCancel,
      title,
      onConfirm} = this.props;
    return (
      <>
        <Dialog
          open={ open }
          onClose={ onClose }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle disableTypography id="alert-dialog-title">{ title }</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              { text }
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={ onCancel } color="primary">
              { cancelButtonText }
            </Button>
            <Button disableElevation variant="contained" onClick={ onConfirm } color="secondary" autoFocus>
              { positiveButtonText }
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
