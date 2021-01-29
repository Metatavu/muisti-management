import * as React from "react";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@material-ui/core";
import HelpIcon from "@material-ui/icons/Help";
import strings from "../../localization/strings";

/**
 * Interface representing component properties
 */
interface Props {
  title: string;
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
      <IconButton onClick={ this.onHelpDialogOpenClick } color="inherit">
        <HelpIcon htmlColor="#222"/>
      </IconButton>
      <Dialog
        maxWidth="lg"
        open={ open }
      >
        <DialogTitle
          disableTypography
        >
          { title }
        </DialogTitle>
        <DialogContent>
          { this.props.children }
        </DialogContent>
        <DialogActions>
          <Button
            onClick={ this.onHelpDialogCloseClick }
            disableElevation
            variant="contained"
            color="secondary"
            autoFocus
          >
            { strings.genericDialog.close }
          </Button>
        </DialogActions>
      </Dialog>
      </>
    );
  }

  /**
   * Click handler for Help dialog opening click
   */
  private onHelpDialogOpenClick = () => {
    this.setState({
      open: true
    })
  }

    /**
   * Click handler for Help dialog close click
   */
  private onHelpDialogCloseClick = () => {
    this.setState({
      open: false
    })
  }
}
