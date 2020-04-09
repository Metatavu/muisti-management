import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

// eslint-disable-next-line max-len
import { WithStyles, withStyles, Typography, Grid, Divider, CircularProgress } from "@material-ui/core";
import styles from "../../styles/dashboard-recent-view";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import { Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardLayout from "./dashboard-layout";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Interface representing component state
 */
interface State {
  error?: string | Error;
  loading: boolean;
}

/**
 * Component for dashboard settings view
 */
class DashboardSettingsView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history } = this.props;

    if (this.state.loading) {
      return (
        <DashboardLayout history={ history }>
          <CircularProgress />
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout history={ history }>
        <div className={ classes.titleGrid }>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item key="title">
              <Typography variant="h2" component="span">
                { strings.dashboard.settings.title }
              </Typography>
            </Grid>
          </Grid>
        </div>
        <Divider />
        <div className={ classes.content }>
        </div>
    </DashboardLayout>
    );
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
    setSelectedExhibition: (exhibition: Exhibition) => dispatch(setSelectedExhibition(exhibition))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardSettingsView));