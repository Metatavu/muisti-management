import * as React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@material-ui/core";

/**
 * Interface representing component properties
 */
interface Props {
  title: string;
  positiveButtonText: string;
  cancelButtonText: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  error: boolean;
}

/**
 * Interface representing component state
 */
interface State {

}

/**
 * React component displaying confirm dialogs
 */
export default class GenericDialog extends React.Component<Props, State> {

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
    const { open, positiveButtonText, cancelButtonText, onClose, onCancel, title, onConfirm, error } = this.props;
    return (
      <Dialog
        open={ open }
        onClose={ () => onClose() }
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle disableTypography id="alert-dialog-title">{ title }</DialogTitle>
        <DialogContent>
          { this.props.children }
        </DialogContent>
        <DialogActions>
          <Button onClick={ onCancel } color="primary">
            { cancelButtonText }
          </Button>
          <Button disableElevation variant="contained" disabled={ error } onClick={ onConfirm } color="secondary" autoFocus>
            { positiveButtonText }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
