import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props {
  title: string;
  positiveButtonText: string;
  cancelButtonText?: string;

  /**
   * On close handler
   */
  onClose: () => void;

  /**
   * On cancel handler
   */
  onCancel: () => void;

  /**
   * On confirm handler
   */
  onConfirm: () => void | Promise<void>;
  open: boolean;
  error: boolean;
  fullScreen?: boolean;
  fullWidth?: boolean;
  disableEnforceFocus?: boolean;
  children: React.ReactNode;
  confirmDisabled?: boolean;
  loading?: boolean;
}

/**
 * React component displaying confirm dialogs
 */
export default class GenericDialog extends React.Component<Props, {}> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component render method
   */
  public render = () => {
    const {
      open,
      positiveButtonText,
      cancelButtonText,
      onClose,
      onCancel,
      title,
      onConfirm,
      error,
      fullScreen,
      fullWidth,
      disableEnforceFocus,
      children,
      confirmDisabled,
      loading
    } = this.props;

    return (
      <Dialog
        disableEnforceFocus={disableEnforceFocus}
        open={open}
        onClose={onClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullScreen={fullScreen}
        fullWidth={fullWidth}
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>{children}</DialogContent>
        <DialogActions>
          <Button onClick={onCancel} color="primary">
            {cancelButtonText}
          </Button>
          <Button
            disableElevation
            variant="contained"
            disabled={error || confirmDisabled || loading}
            onClick={onConfirm}
            color="secondary"
            autoFocus
          >
            {positiveButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
}
