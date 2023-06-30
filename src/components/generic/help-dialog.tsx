import strings from "../../localization/strings";
import HelpIcon from "@mui/icons-material/Help";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from "@mui/material";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props {
  title: string;
  children: React.ReactNode;
}

/**
 * Interface representing component state
 */
interface State {
  open: boolean;
}

/**
 * React component displaying help dialogs
 */
export default class HelpDialog extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      open: false
    };
  }

  /**
   * Help render method
   */
  public render = () => {
    const { title } = this.props;
    const { open } = this.state;

    return (
      <>
        <IconButton onClick={this.onHelpDialogOpenClick} color="inherit" size="large">
          <HelpIcon htmlColor="#222" />
        </IconButton>
        <Dialog maxWidth="md" open={open}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{this.props.children}</DialogContent>
          <DialogActions>
            <Button
              onClick={this.onHelpDialogCloseClick}
              disableElevation
              variant="contained"
              color="secondary"
              autoFocus
            >
              {strings.genericDialog.close}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  /**
   * Click handler for Help dialog opening click
   */
  private onHelpDialogOpenClick = () => {
    this.setState({
      open: true
    });
  };

  /**
   * Click handler for Help dialog close click
   */
  private onHelpDialogCloseClick = () => {
    this.setState({
      open: false
    });
  };
}
