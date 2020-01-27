import * as React from "react";
import { WithStyles, withStyles, AppBar, Toolbar, IconButton, Typography, Button } from "@material-ui/core";
import styles from "../../styles/basic-layout";
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import { KeycloakInstance } from "keycloak-js";
import ErrorDialog from "./error-dialog";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  keycloak?: KeycloakInstance,
  error?: string | Error,
  clearError?: () => void
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * React component for basic application layout
 */
class BasicLayout extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <AppBar position="static" className={ classes.appBar }>
          <Toolbar variant="dense">
            <div style={{ flexGrow: 1 }} />
            <IconButton edge="start" onClick={this.onLogOutClick}>
              <SignOutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        
        { this.renderErrorDialog() }
        { this.props.children }
      </div>
    );
  }

  /**
   * Renders error dialog
   */
  private renderErrorDialog = () => {
    if (this.props.error && this.props.clearError) {
      return <ErrorDialog error={ this.props.error } onClose={ this.props.clearError } /> 
    }

    return null;
  }

  /**
   * Handle logout
   */
  private onLogOutClick = () => {
    const { keycloak } = this.props;
    if (keycloak) {
      keycloak.logout();
    }
  }

}

export default withStyles(styles)(BasicLayout);