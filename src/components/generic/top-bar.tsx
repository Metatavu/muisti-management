import * as React from "react";

import { WithStyles, withStyles, IconButton, Typography, List, ListItem } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { History } from "history";
import styles from "../../styles/top-bar";
import HomeIcon from "@material-ui/icons/Home";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { KeycloakInstance } from "keycloak-js";
import strings from "../../localization/strings";
import Breadcrumbs from "./breadcrumbs";
import ActionBar from "./action-bar";
import { BreadcrumbData, ActionButton } from "../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  breadcrumbs: BreadcrumbData[];
  actionBarButtons?: ActionButton[];
  noBackButton?: boolean;
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
    const { classes, keycloak, history, breadcrumbs, noBackButton, title } = this.props;

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
            <Typography variant="body1">{ firstName } { lastName }</Typography>
            <div className={ classes.userAvatar } onClick={ this.onLogOutClick }>
              <p>{ initials }</p>
            </div>
          </div>
        </div>

        <div className={ classes.middleRow }>
          { this.props.history.length > 1 && !noBackButton &&
            <IconButton size="small" className={ classes.backBtn } edge="start" onClick={ () => this.props.history.goBack() }>
              <ArrowBackIcon />
            </IconButton>
          }

          <Typography variant="h1" className={ classes.title }>{ title }</Typography>
        </div>

        <div className={ classes.bottomRow }>
          { history.location.pathname.includes("v4") &&
            <>
              { history.location.pathname.includes("exhibitions/") &&
                this.renderTabs()
              }
              { this.renderActionBar() }
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
    // Remove commenting when users view is done
    //const usersButton = { postfix: "users", text: strings.header.navigation.usersButton };
    const deviceModelsButton = { postfix: "deviceModels", text: strings.header.navigation.devicesButton };
    const layoutsButton = { postfix: "layouts", text: strings.header.navigation.layoutsButton };
    const floorPlansButton = { postfix: "floorPlans", text: strings.header.navigation.spacesButton };

    return (
      <List
        disablePadding
        dense
        className={ classes.navList }
      >
        { this.renderNavigationButton(exhibitionsButton) }
        { this.renderNavigationButton(layoutsButton) }
        { this.renderNavigationButton(floorPlansButton) }
        {/* Remove commenting when users view is done */}
        {/* { this.renderNavigationButton(usersButton) } */}
        { this.renderNavigationButton(deviceModelsButton) }
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

    const isV4Path = history.location.pathname.includes("v4");
    const v3ExhibitionPath = "/dashboard/overview";
    const targetUrl = isV4Path ? `/v4/${navigationButton.postfix}` : (
      navigationButton.postfix === "exhibitions" ? v3ExhibitionPath : `/dashboard/${navigationButton.postfix}`
    );
    const selected = history.location.pathname.includes(targetUrl);

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
    const contentsTab = { postfix: "content", text: strings.header.tabs.exhibitionContentsTab };

    return (
      <List
        disablePadding
        dense
        className={ classes.tabs }
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

    const tabButtonPath = this.getTabButtonPath(tabButton);

    return (
      <ListItem
        button
        selected={ history.location.pathname.includes(tabButton.postfix) }
        component={ RouterLink }
        to={ tabButtonPath }
        disabled={ !history.location.pathname.includes("floors/") }
      >
        <Typography>{ tabButton.text }</Typography>
      </ListItem>
    );
  }

  /**
   * Renders action bar
   */
  private renderActionBar = () => {
    const { classes, actionBarButtons } = this.props;

    return (
      <div className={ classes.toolbar }>
        <ActionBar buttons={ actionBarButtons || [] } />
      </div>
    );
  }

  /**
   * Get new path.
   *
   * @param tabButton navigation button
   */
  private getTabButtonPath = (tabButton: NavigationButton): string => {
    const { history } = this.props;

    const currentPath = history.location.pathname;
    switch (tabButton.postfix) {
      case "content":
        return currentPath.replace("floorplan", tabButton.postfix);
      case "floorplan":
        return currentPath.replace("content", tabButton.postfix);
      default:
        return currentPath;
    }
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