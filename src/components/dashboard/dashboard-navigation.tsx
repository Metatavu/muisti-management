import * as React from "react";

import { WithStyles, withStyles, Button, Divider } from "@material-ui/core";
import styles from "../../styles/dashboard-navigation";
import clsx from "clsx";
import { Link as RouterLink } from 'react-router-dom';
import strings from "../../localization/strings";
import EqualizerIcon from '@material-ui/icons/Equalizer';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LayersIcon from '@material-ui/icons/Layers';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import GroupIcon from '@material-ui/icons/Group';
import DevicesIcon from '@material-ui/icons/Devices';
import TableChartIcon from '@material-ui/icons/TableChart';

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
    const overviewButton = { postfix: "overview", text: strings.dashboard.navigation.overviewButton, icon: <EqualizerIcon /> };
    const recentButton = { postfix: "recent", text: strings.dashboard.navigation.recentButton, icon: <AccessTimeIcon /> };
    const draftsButton = { postfix: "drafts", text: strings.dashboard.navigation.draftsButton, icon: <LayersIcon /> };
    const archivedButton = { postfix: "archived", text: strings.dashboard.navigation.archivedButton, icon: <DeleteIcon /> };
    const settingsButton = { postfix: "settings", text: strings.dashboard.navigation.settingsButton, icon: <SettingsIcon /> };
    const usersButton = { postfix: "users", text: strings.dashboard.navigation.usersButton, icon: <GroupIcon /> };
    const devicesButton = { postfix: "devices", text: strings.dashboard.navigation.devicesButton, icon: <DevicesIcon /> };
    const layoutsButton = { postfix: "layouts", text: strings.dashboard.navigation.layoutsButton, icon: <TableChartIcon /> };

    return <>
      { this.renderNavigationButton(overviewButton) }
      { this.renderNavigationButton(recentButton) }
      { this.renderNavigationButton(draftsButton) }
      { this.renderNavigationButton(archivedButton) }
      <Divider />
      { this.renderNavigationButton(settingsButton) }
      { this.renderNavigationButton(usersButton) }
      { this.renderNavigationButton(devicesButton) }
      { this.renderNavigationButton(layoutsButton) }
    </>;
  }

  /**
   * Renders navigation button
   *
   * @param navigationButton navigation button
   */
  private renderNavigationButton = (navigationButton: NavigationButton) => {
    const { classes, locationPath } = this.props;
    return (
      <Button component={ RouterLink }
        to={ `/dashboard/${ navigationButton.postfix }` }
        className={ clsx(classes.btn, { [classes.selected]: locationPath === `/dashboard/${ navigationButton.postfix }` }) }
      >
        { navigationButton.icon }
        { navigationButton.text }
      </Button>
    );
  }
}

export default withStyles(styles)(DashboardNavigation);