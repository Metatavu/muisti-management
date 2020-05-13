import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/basic-layout";
import TopBar from "../top-bar/top-bar";
import { KeycloakInstance } from "keycloak-js";
import ErrorDialog from "./error-dialog";
import { History } from "history";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
  keycloak: KeycloakInstance;
  history: History;
  error?: string | Error;
  clearError?: () => void;
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
    const { classes, history } = this.props;
    const locationPath = history.location.pathname;

    return (
      <div className={ classes.root }>
        <TopBar locationPath={ locationPath } title={ this.props.title } keycloak={ this.props.keycloak } onDashboardButtonClick={ this.props.onDashboardButtonClick } />
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