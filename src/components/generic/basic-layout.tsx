import * as React from "react";

import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/basic-layout";
import TopBar from "../top-bar/top-bar";
import { KeycloakInstance } from "keycloak-js";
import ErrorDialog from "./error-dialog";
import { History } from "history";
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import strings from "../../localization/strings";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title?: string;
  keycloak: KeycloakInstance;
  history: History;
  error?: string | Error;
  clearError?: () => void;
  onDashboardButtonClick?: () => void;
  selectedExhibition?: Exhibition;
  selectedRoom?: ExhibitionRoom;
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
    const { classes, history, keycloak } = this.props;

    return (
      <div className={ classes.root }>
        <TopBar history={ history } keycloak={ keycloak } onDashboardButtonClick={ this.props.onDashboardButtonClick } title={ this.getPageTitle() } />
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

  /**
   * Get page title
   *
   * @returns page title as string
   */
  private getPageTitle = (): string => {
    const { history, selectedExhibition, selectedRoom, title } = this.props;

    /**
     * TODO:
     * Remove this when v4 prefix can be removed from route path
     */
    if (!history.location.pathname.includes("v4")) {
      return title || "";
    }

    if (!selectedExhibition) {
      return strings.exhibitions.listTitle;
    } else if (!selectedRoom) {
      return selectedExhibition.name;
    } else {
      return selectedRoom.name;
    }
  }

}

export default withStyles(styles)(BasicLayout);