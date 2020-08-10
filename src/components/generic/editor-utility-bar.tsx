import React from "react";
import { WithStyles, withStyles } from "@material-ui/core";
import styles from "../../styles/components/generic/content-utility-bar";
import { History } from "history";
import { ActionButton } from "../../types";
import ActionBar from "./action-list";
import DeviceList from "./device-list";
import { ExhibitionDevice } from "../../generated/client";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles>  {
  history: History;
  devices?: ExhibitionDevice[];
  actionBarButtons?: ActionButton[];
  setSelectedDevice?: (deviceId: string) => ExhibitionDevice | undefined;
}

/**
 * Interface representing component state
 */
interface State {

}

/**
 * Component for editor utility bar
 */
class EditorUtilityBar extends React.Component<Props, State> {

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
    const { history, devices, setSelectedDevice } = this.props;

    return (
      <>
        <DeviceList history={ history } devices={ devices } setSelectedDevice={ setSelectedDevice } />
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

export default withStyles(styles)(EditorUtilityBar);