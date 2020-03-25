import * as React from "react";

import { WithStyles, withStyles, IconButton, Typography } from "@material-ui/core";
import styles from "../../styles/basic-layout";
import SignOutIcon from "@material-ui/icons/ExitToAppSharp";
import BackIcon from "@material-ui/icons/ArrowBackSharp";
import MenuIcon from "@material-ui/icons/MenuSharp";
import { KeycloakInstance } from "keycloak-js";
import ErrorDialog from "./error-dialog";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
  keycloak?: KeycloakInstance;
  error?: string | Error;
  clearError?: () => void;
  onBackButtonClick?: () => void;
  onDashboardButtonClick?: () => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for basic application layout
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
      <div className={ classes.root }>
        <header className={ classes.header }>
          { this.props.onBackButtonClick &&
            <IconButton size="small" className={ classes.menuBtn } edge="start" onClick={ this.props.onDashboardButtonClick }>
              <MenuIcon />
            </IconButton>
          }
          { this.props.onBackButtonClick &&
            <IconButton size="small" className={ classes.backBtn } edge="start" onClick={ this.props.onBackButtonClick }>
              <BackIcon />
            </IconButton>
          }
          <Typography variant="h6" className={ classes.title }>
            { this.props.title }
          </Typography>
          <IconButton size="small" className={ classes.logoutBtn } edge="start" onClick={ this.onLogOutClick }>
            <SignOutIcon />
          </IconButton>
        </header>
        <div className={ classes.content }>
          { this.props.children }
        </div>
        { this.renderErrorDialog() }
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