import * as React from "react";

import { WithStyles, withStyles, Divider, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import styles from "../../styles/dashboard-navigation";
import { Link as RouterLink } from 'react-router-dom';
import strings from "../../localization/strings";
import DashboardIcon from "../../resources/gfx/svg-paths/tyopoyta";
import LatestIcon from "../../resources/gfx/svg-paths/viimeisimmat";
import SettingsIcon from "../../resources/gfx/svg-paths/asetukset";
import GroupIcon from '@material-ui/icons/Group';
import DevicesIcon from '@material-ui/icons/Devices';
import TableChartIcon from '@material-ui/icons/TableChart';
import DraftsIcon from '../../resources/gfx/svg-paths/luonnokset';
import ArchivedIcon from '../../resources/gfx/svg-paths/arkistoidut';

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
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
  icon: JSX.Element;
}

/**
 * Component for dashboard navigation
 */
class DashboardNavigation extends React.Component<Props, State> {

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
    const overviewButton = { postfix: "overview", text: strings.dashboard.navigation.overviewButton, icon: <DashboardIcon /> };
    const recentButton = { postfix: "recent", text: strings.dashboard.navigation.recentButton, icon: <LatestIcon /> };
    const draftsButton = { postfix: "drafts", text: strings.dashboard.navigation.draftsButton, icon: <DraftsIcon /> };
    const archivedButton = { postfix: "archived", text: strings.dashboard.navigation.archivedButton, icon: <ArchivedIcon /> };
    const settingsButton = { postfix: "settings", text: strings.dashboard.navigation.settingsButton, icon: <SettingsIcon /> };
    const usersButton = { postfix: "users", text: strings.dashboard.navigation.usersButton, icon: <GroupIcon /> };
    const devicesButton = { postfix: "devices", text: strings.dashboard.navigation.devicesButton, icon: <DevicesIcon /> };
    const layoutsButton = { postfix: "layouts", text: strings.dashboard.navigation.layoutsButton, icon: <TableChartIcon /> };

    return <>
      { this.renderNavigationButton(overviewButton) }
      { this.renderNavigationButton(recentButton) }
      { this.renderNavigationButton(draftsButton) }
      { this.renderNavigationButton(archivedButton) }
      <Divider color="rgba(0,0,0,0.1)" variant="fullWidth" style={{ marginTop: 30, marginBottom: 30 }} />
      { this.renderNavigationButton(settingsButton) }
      { this.renderNavigationButton(usersButton) }
      { this.renderNavigationButton(devicesButton) }
      { this.renderNavigationButton(layoutsButton) }
    </>;
  }

  /**s
   * Renders navigation button
   *
   * @param navigationButton navigation button
   */
  private renderNavigationButton = (navigationButton: NavigationButton) => {
    const { locationPath } = this.props;
    return (
      <ListItem
        disableGutters
        button
        selected={ locationPath === `/dashboard/${ navigationButton.postfix }` }
        component={ RouterLink }
        to={ `/dashboard/${ navigationButton.postfix }` }
      >
        <ListItemIcon>{ navigationButton.icon }</ListItemIcon>
        <ListItemText primaryTypographyProps={{ color: "textSecondary" }} primary={ navigationButton.text } />
      </ListItem>
    );
  }
}

export default withStyles(styles)(DashboardNavigation);