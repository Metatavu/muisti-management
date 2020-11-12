import * as React from "react";

import { WithStyles, withStyles, IconButton, Typography, List, ListItem } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { History } from "history";
import styles from "../../styles/components/generic/top-bar";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { KeycloakInstance } from "keycloak-js";
import strings from "../../localization/strings";
import Breadcrumbs from "./breadcrumbs";
import { BreadcrumbData, ActionButton } from "../../types";
import ContentUtilityBar from "./content-utility-bar";
import EditorUtilityBar from "./editor-utility-bar";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  breadcrumbs: BreadcrumbData[];
  actionBarButtons?: ActionButton[];
  noBackButton?: boolean;
  noTabs?: boolean;
  keycloak: KeycloakInstance;
  title: string;
  error?: string | Error;
  clearError?: () => void;
}

/**
 * Interface representing component state
 */
interface State {
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
    };
  }

  /**
   * Component render method
   */
  public render() {
    const {
      classes,
      keycloak,
      history,
      breadcrumbs,
      noBackButton,
      title,
      noTabs,
      actionBarButtons
    } = this.props;

    const firstName = (keycloak.profile && keycloak.profile.firstName) ?? "";
    const lastName = (keycloak.profile && keycloak.profile.lastName) ?? "";
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
            <IconButton
              size="small"
              className={ classes.backBtn }
              edge="start"
              onClick={ () => this.props.history.goBack() }
            >
              <ArrowBackIcon />
            </IconButton>
          }

          <Typography variant="h1" className={ classes.title }>{ title }</Typography>
        </div>

        <div className={ classes.bottomRow }>
          { !history.location.pathname.includes("timeline") &&
            <ContentUtilityBar
              history={ history }
              actionBarButtons={ actionBarButtons }
              noTabs={ noTabs }
            />
          }
          { history.location.pathname.includes("timeline") &&
            <EditorUtilityBar
              history={ history }
              actionBarButtons={ actionBarButtons }
            />
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

    const targetUrl = `/${navigationButton.postfix}`;
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
