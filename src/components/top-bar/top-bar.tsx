import * as React from "react";

import { WithStyles, withStyles, IconButton, Typography, List, ListItem, Button } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { History } from "history";
import styles from "../../styles/top-bar";
import HomeIcon from "@material-ui/icons/Home";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { KeycloakInstance } from "keycloak-js";
import strings from "../../localization/strings";
import Breadcrumbs from "../generic/breadcrumbs";
import { BreadcrumbData } from "../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  breadcrumbs: BreadcrumbData[];
  keycloak: KeycloakInstance;
  title: string;
  error?: string | Error;
  clearError?: () => void;
  onDashboardButtonClick?: () => void;
}

/**
 * Interface representing component state
 */
interface State {
  navigationButtons: NavigationButton[];
}

/**
 * Interface representing navigation button
 */
interface NavigationButton {
  postfix: string;
  text: string;
}

/**
 * Component for top bar
 */
class TopBar extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      navigationButtons: []
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, keycloak, history, breadcrumbs, title } = this.props;

    const firstName = keycloak.profile && keycloak.profile.firstName ? keycloak.profile.firstName : "";
    const lastName = keycloak.profile && keycloak.profile.lastName ? keycloak.profile.lastName : "";
    const initials = `${ firstName.charAt(0).toUpperCase() }`;

    return (
      <header className={ classes.root }>

        <div className={ classes.topRow }>
          <div className={ classes.breadcrumbs }>
            <Breadcrumbs
              history={ history }
              breadcrumbs={ breadcrumbs }
            />
          </div>

          <nav className={ classes.nav }>
            { this.props.onDashboardButtonClick &&
              <IconButton size="small" className={ classes.backBtn } edge="start" onClick={ this.props.onDashboardButtonClick }>
                <HomeIcon />
              </IconButton>
            }
            { this.renderNavigation() }
          </nav>

          <div className={ classes.user }>
            <Typography variant="body1">{ firstName } { lastName}</Typography>
            <div className={ classes.userAvatar } onClick={ this.onLogOutClick }>
              <p>{ initials }</p>
            </div>
          </div>
        </div>

        <div className={ classes.middleRow }>
          { this.props.history.length > 1 &&
            <IconButton size="small" className={ classes.backBtn } edge="start" onClick={ () => this.props.history.goBack() }>
              <ArrowBackIcon />
            </IconButton>
          }

          <Typography variant="h1" className={ classes.title }>{ title }</Typography>
        </div>

        <div className={ classes.bottomRow }>
          { history.location.pathname.includes("v4/exhibitions/") &&
            <>
              { this.renderTabs() }
              { this.renderToolbar() }
            </>
          }
        </div>
      </header>
    );
  }

  /**
   * Renders navigation
   */
  private renderNavigation = () => {
    const { classes } = this.props;
    const exhibitionsButton = { postfix: "exhibitions", text: strings.header.navigation.exhibitionsButton };
    const usersButton = { postfix: "users", text: strings.header.navigation.usersButton };
    const devicesButton = { postfix: "devices", text: strings.header.navigation.devicesButton };
    const layoutsButton = { postfix: "layouts", text: strings.header.navigation.layoutsButton };
    const floorPlansButton = { postfix: "floorplans", text: strings.header.navigation.floorPlansButton };

    return (
      <List
        disablePadding
        dense
        className={ classes.navList }
      >
        { this.renderNavigationButton(exhibitionsButton) }
        { this.renderNavigationButton(layoutsButton) }
        { this.renderNavigationButton(floorPlansButton) }
        { this.renderNavigationButton(usersButton) }
        { this.renderNavigationButton(devicesButton) }
      </List>
    );
  }

  /**
   * Renders navigation button
   *
   * @param navigationButton navigation button
   */
  private renderNavigationButton = (navigationButton: NavigationButton) => {
    const { history } = this.props;

    const exhibitionPath = "/dashboard/overview";
    const targetUrl = navigationButton.postfix === "exhibitions" ? exhibitionPath : `/dashboard/${ navigationButton.postfix }`;
    const selected = history.location.pathname === targetUrl;

    return (
      <ListItem
        button
        selected={ selected }
        component={ RouterLink }
        to={ targetUrl }
      >
        <Typography>{ navigationButton.text }</Typography>
      </ListItem>
    );
  }

  /**
   * Renders tabs
   */
  private renderTabs = () => {
    const { classes } = this.props;
    const floorplanTab = { postfix: "floorplan", text: strings.header.tabs.floorPlanTab };
    const contentsTab = { postfix: "exhibition-contents", text: strings.header.tabs.exhibitionContentsTab };

    return (
      <List
        disablePadding
        dense
        className={ classes.tabs}
      >
        { this.renderTabButton(floorplanTab) }
        { this.renderTabButton(contentsTab) }
      </List>
    );
  }

  /**
   * Renders tab button
   *
   * @param tabButton tab button
   */
  private renderTabButton = (tabButton: NavigationButton) => {
    const { history } = this.props;

    return (
      <ListItem
        button
        selected={ history.location.pathname === `/exhibitions/${ tabButton.postfix }` }
        component={ RouterLink }
        to={ `/exhibitions/${ tabButton.postfix }` }
      >
        <Typography>{ tabButton.text }</Typography>
      </ListItem>
    );
  }

  /**
   * Renders toolbar
   */
  private renderToolbar = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.toolbar }>
        <Button variant="contained" disableElevation color="primary">Hide properties</Button>
        <Button variant="contained" disableElevation color="primary">Save</Button>
      </div>
    );
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


export default withStyles(styles)(TopBar);