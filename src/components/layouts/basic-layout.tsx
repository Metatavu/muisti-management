import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/components/generic/basic-layout";
import TopBar from "../generic/top-bar";
import { KeycloakInstance } from "keycloak-js";
import ErrorDialog from "../generic/error-dialog";
import { History } from "history";
import { BreadcrumbData, ActionButton } from "../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
  keycloak: KeycloakInstance;
  history: History;
  breadcrumbs: BreadcrumbData[];
  actionBarButtons?: ActionButton[];
  noBackButton?: boolean;
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
    const { classes, history, title, breadcrumbs, actionBarButtons, noBackButton, keycloak } = this.props;

    return (
      <div className={ classes.root }>
        <TopBar
          history={ history }
          keycloak={ keycloak }
          breadcrumbs={ breadcrumbs }
          actionBarButtons={ actionBarButtons }
          noBackButton={ noBackButton }
          onDashboardButtonClick={ this.props.onDashboardButtonClick }
          title={ title }
        />
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
      return <ErrorDialog error={ this.props.error } onClose={ this.props.clearError } />;
    }

    return null;
  }

}

export default withStyles(styles)(BasicLayout);