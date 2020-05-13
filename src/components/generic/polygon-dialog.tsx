import * as React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@material-ui/core";

/**
 * Interface representing component properties
 */
interface Props {
  title: string;
  text: string;
  roomName?: string;
  positiveButtonText: string;
  cancelButtonText: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
export default class PolygonDialog extends React.Component<Props, State> {

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
      onConfirm,
      roomName} = this.props;
    return (
      <>
        <Dialog
          open={ open }
          onClose={ onClose }
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle disableTypography id="polygon-dialog-title">{ title }</DialogTitle>
          <DialogContent>
            <TextField fullWidth type="text" label={ text } value={ roomName || "" } onChange={ this.props.onNameChange }/>        
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
