import strings from "../../localization/strings";
import styles from "../../styles/components/generic/top-bar";
import { ActionButton, BreadcrumbData, NavigationButton } from "../../types";
import ActionBar from "./action-bar";
import Breadcrumbs from "./breadcrumbs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { IconButton, List, ListItem, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { Link as RouterLink } from "react-router-dom";

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
  error?: string | Error;
  clearError?: () => void;
  hideHeader?: boolean;
}

/**
 * Component for top bar
 */
class TopBar extends React.Component<Props, {}> {
  private navigationButtons: NavigationButton[] = [
    {
      postfix: "exhibitions",
      label: strings.header.navigation.exhibitionsButton
    },
    {
      postfix: "deviceModels",
      label: strings.header.navigation.devicesButton
    },
    { postfix: "layouts", label: strings.header.navigation.layoutsButton },
    {
      postfix: "floorPlans",
      label: strings.header.navigation.spacesButton
    },
    {
      postfix: "fleetManagement",
      label: strings.header.navigation.fleetManagementButton
    }
  ];

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
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
      actionBarButtons,
      hideHeader
    } = this.props;

    const firstName = keycloak.profile?.firstName ?? "";
    const lastName = keycloak.profile?.lastName ?? "";
    const initials = `${firstName.charAt(0).toUpperCase()}`;

    return (
      <header className={classes.root} style={hideHeader ? { display: "none" } : {}}>
        <div className={classes.topRow}>
          <div className={classes.breadcrumbs}>
            <Breadcrumbs history={history} breadcrumbs={breadcrumbs} />
          </div>

          <nav className={classes.nav}>{this.renderNavigation()}</nav>

          <div className={classes.user}>
            <Typography variant="body1">
              {firstName} {lastName}
            </Typography>
            <div className={classes.userAvatar} onClick={this.onLogOutClick}>
              <p>{initials}</p>
            </div>
          </div>
        </div>

        <div className={classes.middleRow}>
          {this.props.history.length > 1 && !noBackButton && (
            <IconButton
              size="small"
              className={classes.backBtn}
              edge="start"
              onClick={() => this.props.history.goBack()}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

          <Typography variant="h1" className={classes.title}>
            {title}
          </Typography>
        </div>

        <div className={classes.bottomRow}>
          <ActionBar buttons={actionBarButtons || []} />
        </div>
      </header>
    );
  }

  /**
   * Renders navigation
   */
  private renderNavigation = () => {
    const { classes } = this.props;
    return (
      <List disablePadding dense className={classes.navList}>
        {this.navigationButtons.map(this.renderNavigationButton)}
      </List>
    );
  };

  /**
   * Renders navigation button
   *
   * @param navigationButton navigation button
   */
  private renderNavigationButton = (navigationButton: NavigationButton) => {
    const { history } = this.props;
    const { label, postfix } = navigationButton;

    const targetUrl = `/${postfix}`;
    const selected = history.location.pathname.includes(targetUrl);

    return (
      <ListItem button selected={selected} component={RouterLink} to={targetUrl} key={postfix}>
        <Typography>{label}</Typography>
      </ListItem>
    );
  };

  /**
   * Handle logout
   */
  private onLogOutClick = () => {
    const { keycloak } = this.props;

    if (keycloak) {
      keycloak.logout();
    }
  };
}

export default withStyles(styles)(TopBar);
