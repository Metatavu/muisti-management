import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setExhibitions } from "../../actions/exhibitions";

// eslint-disable-next-line max-len
import { WithStyles, withStyles, Divider, Container } from "@material-ui/core";
import styles from "../../styles/dashboard-floor-plan";
import { History } from "history";
import DashboardNavigation from "./dashboard-navigation";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import { Exhibition } from "../../generated/client";
import ErrorDialog from "../generic/error-dialog";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  error?: string | Error;
  clearError?: () => void;
  history: History;
  children?: React.ReactNode;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions?: Exhibition[];
  setExhibitions: typeof setExhibitions;
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
}

/**
 * Component for dashboard base floorPlan
 */
class DashboardFloorPlan extends React.Component<Props, State> {

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
   * Component render method
   */
  public render() {
    const { classes, history, keycloak } = this.props;
    const locationPath = history.location.pathname;

    const firstName = keycloak.profile && keycloak.profile.firstName ? keycloak.profile.firstName : "";
    const lastName = keycloak.profile && keycloak.profile.lastName ? keycloak.profile.lastName : "";
    const initials = `${ firstName.charAt(0).toUpperCase() }${ lastName.charAt(0).toUpperCase() }`;

    return (
      <div className={ classes.root }>
        <div className={ classes.navigation }>
          <div className={ classes.navigationTopContent }>
            <div className={ classes.userElement }>
                <div className={ classes.userAvatar }><p>{ initials }</p></div>
            <h4>{ firstName }</h4>
            </div>
            <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />
            <DashboardNavigation locationPath={ locationPath } />
          </div>
        </div>
        <div className={ classes.content }>
          <Container >
            { this.props.children }
          </Container>
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
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken,
    exhibitions: state.exhibitions.exhibitions
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setExhibitions: (exhibitions: Exhibition[]) => dispatch(setExhibitions(exhibitions))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardFloorPlan));