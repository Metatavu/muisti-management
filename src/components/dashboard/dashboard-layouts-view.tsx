import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setSelectedLayout } from "../../actions/layouts";

// eslint-disable-next-line max-len
import { WithStyles, withStyles, Typography, Grid, Divider, CircularProgress, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@material-ui/core";
import styles from "../../styles/dashboard-recent-view";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import { PageLayout } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardLayout from "./dashboard-layout";
import defaultLayoutImage from "../../resources/gfx/muisti-logo.png";
import moment from "moment";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  layouts: PageLayout[];
  setSelectedLayout: typeof setSelectedLayout;
}

/**
 * Interface representing component state
 */
interface State {
  error?: string | Error;
  loading: boolean;
}

/**
 * Component for dashboard layouts view
 */
class DashboardLayoutsView extends React.Component<Props, State> {

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

    const layouts = this.props.layouts.map(layout => this.renderLayoutListItem(layout));

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
                { strings.dashboard.layouts.title }
              </Typography>
            </Grid>
          </Grid>
        </div>
        <Divider />
        <div className={ classes.content }>
          <List>
            { layouts &&
              layouts
            }
          </List>
        </div>
    </DashboardLayout>
    );
  }

  /**
   * Renders layout list item
   *
   * @param layout layout
   */
  private renderLayoutListItem = (layout: PageLayout) => {
    const layoutId = layout.id;
    if (!layoutId) {
      return;
    }

    return (
      <ListItem onClick={ () => this.openLayout(layout) }>
        <ListItemAvatar>
          <Avatar src={ defaultLayoutImage } />
        </ListItemAvatar>
        <ListItemText primary={ layout.name } secondary={ `${ strings.dashboard.layouts.lastModified } ${ moment(layout.modifiedAt).fromNow() }` } />
      </ListItem>
    );
  }

  /**
   * Opens selected layout
   *
   * @param layout layout
   */
  private openLayout = (layout: PageLayout) => {
    if (!layout.id) {
      return;
    }

    this.props.setSelectedLayout(layout);
    this.props.history.push(`/layouts/${layout.id}`);
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
    layouts: state.layouts.layouts
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardLayoutsView));