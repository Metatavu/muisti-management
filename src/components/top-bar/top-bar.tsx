import * as React from "react";

import { WithStyles, withStyles, IconButton, Typography, Breadcrumbs, List, ListItem, Button } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import styles from "../../styles/top-bar";
import HomeIcon from "@material-ui/icons/Home";
import ChevronRight from "@material-ui/icons/ChevronRight";
import ArrowLeftIcon from "@material-ui/icons/ArrowLeftSharp";
import { KeycloakInstance } from "keycloak-js";
import strings from "../../localization/strings";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
  keycloak: KeycloakInstance;
  error?: string | Error;
  clearError?: () => void;
  onDashboardButtonClick?: () => void;
  locationPath: string;
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
 * Component for basic application layout
 */
class TopBar extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, keycloak } = this.props;

    const firstName = keycloak.profile && keycloak.profile.firstName ? keycloak.profile.firstName : "";
    const lastName = keycloak.profile && keycloak.profile.lastName ? keycloak.profile.lastName : "";
    const initials = `${ firstName.charAt(0).toUpperCase() }${ lastName.charAt(0).toUpperCase() }`;

    return (
      <header className={ classes.root }>
        <div className={ classes.topRow }>

          {/* Breadcrumb */}
          <Breadcrumbs separator={ <ChevronRight /> }>
            <Typography variant="h6">{ strings.exhibition.onProduction }</Typography>
            <Typography color="textPrimary" variant="h5" className={ classes.title }>
              { this.props.title }
            </Typography>
          </Breadcrumbs>

          <div>
            {/* Navigation */}
            <nav className={ classes.nav }>
              { this.props.onDashboardButtonClick &&
                <IconButton size="small" className={ classes.homeBtn } edge="start" onClick={ this.props.onDashboardButtonClick }>
                  <HomeIcon />
                </IconButton>
              }
              { this.renderNavigation() }
          </nav>
          </div>

          <div className={ classes.user }>
            {/* User */}
            <Typography variant="body1">Matti Meikäläinen</Typography>
            <div className={ classes.userAvatar } onClick={ this.onLogOutClick }>
              <p>{ initials }</p>
            </div>
          </div>

        </div>
        <div className={ classes.middleRow }>

          {/* Takaisin painike ja sivun title */}
          { this.props.onDashboardButtonClick &&
            <IconButton size="small" className={ classes.homeBtn } edge="start" onClick={ this.props.onDashboardButtonClick }>
              <ArrowLeftIcon />
            </IconButton>
          }
          <Typography variant="h1">{ this.props.title }</Typography>

        </div>
        <div className={ classes.bottomRow }>

          {/* Tänne tabit ja toolbar */}
          { this.renderTabs() }
          { this.renderToolbar() }

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
    const { locationPath } = this.props;
    return (
      <ListItem
        button
        selected={ locationPath === `/exhibitions/${ navigationButton.postfix }` }
        component={ RouterLink }
        to={ `/exhibitions/${ navigationButton.postfix }` }
      >
        <Typography>{ navigationButton.text }</Typography>
      </ListItem>
    );
  }

  /**
   * Renders tabs
   *
   */
  private renderTabs = () => {
    const { classes } = this.props;
    const floorplanTab = { postfix: "floorplan", text: strings.header.tabs.floorPlanTab };
    const contentsTab = { postfix: "exhibition-contents", text: strings.header.tabs.exhibitionContentsTab };

    return (
      <List
        disablePadding
        dense
        className={ classes.navList }
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
    const { locationPath } = this.props;
    return (
      <ListItem
        button
        selected={ locationPath === `/exhibitions/${ tabButton.postfix }` }
        component={ RouterLink }
        to={ `/exhibitions/${ tabButton.postfix }` }
      >
        <Typography>{ tabButton.text }</Typography>
      </ListItem>
    );
  }

  /**
   * Renders toolbar
   *
   */
  private renderToolbar = () => {
    const { classes } = this.props;

    return (
      <Button>Save</Button>
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