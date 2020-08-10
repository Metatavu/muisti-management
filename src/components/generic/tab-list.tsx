import React from "react";
import { WithStyles, withStyles, List, ListItem, Typography } from "@material-ui/core";
import styles from "../../styles/components/generic/tab-list";
import strings from "../../localization/strings";
import { History } from "history";
import { Link as RouterLink } from 'react-router-dom';

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles>  {
  history: History;
  tabButtons: NavigationButton[];
}

/**
 * Interface representing component state
 */
interface State {

}

interface NavigationButton {
  postfix: string;
  text: string;
}

/**
 * Component for content utility bar
 */
class TabList extends React.Component<Props, State> {

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
    return (
      <>
        { this.renderTabs() }
      </>
    );
  }

  /**
   * Renders tabs
   */
  private renderTabs = () => {
    const { classes } = this.props;
    

    return (
      <List
        disablePadding
        dense
        className={ classes.tabs }
      >
        { this.renderTabButtons() }
      </List>
    );
  }

  /**
   * Renders tab button
   *
   * @param tabButton tab button
   */
  private renderTabButtons = () => {
    const { history, tabButtons } = this.props;

    return tabButtons.map((tabButton, index) => {
      const tabButtonPath = this.getTabButtonPath(tabButton);

      return (
        <ListItem
          key={ index }
          button
          selected={ history.location.pathname.includes(tabButton.postfix) }
          component={ RouterLink }
          to={ tabButtonPath }
          disabled={ !history.location.pathname.includes("floors/") }
        >
          <Typography>{ tabButton.text }</Typography>
        </ListItem>
      );
    });
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

}

export default withStyles(styles)(TabList);