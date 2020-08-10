import React from "react";
import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/components/generic/content-utility-bar";
import { History } from "history";
import TabList from "./tab-list";
import { ActionButton } from "../../types";
import ActionBar from "./action-list";
import strings from "../../localization/strings";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles>  {
  noTabs?: boolean;
  history: History;
  actionBarButtons?: ActionButton[];
}

/**
 * Interface representing component state
 */
interface State {

}

/**
 * Component for content utility bar
 */
class ContentUtilityBar extends React.Component<Props, State> {

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
    const { history, noTabs } = this.props;

    const floorplanTab = { postfix: "floorplan", text: strings.header.tabs.floorPlanTab };
    const contentsTab = { postfix: "content", text: strings.header.tabs.exhibitionContentsTab };

    return (
      <>
        { history.location.pathname.includes("exhibitions/") && !noTabs &&
          <TabList history={ history } tabButtons={ [floorplanTab, contentsTab] } />
        }
        { this.renderActionBar() }
      </>
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

}

export default withStyles(styles)(ContentUtilityBar);