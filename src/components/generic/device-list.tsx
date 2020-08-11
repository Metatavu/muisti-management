import React from "react";
import { WithStyles, withStyles, List, ListItem, Typography } from "@material-ui/core";
import styles from "../../styles/components/generic/tab-list";
import { History } from "history";
import { ExhibitionDevice } from "../../generated/client";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles>  {
  history: History;
  devices?: ExhibitionDevice[];
  setSelectedDevice?: (deviceId: string) => ExhibitionDevice | undefined;
}

/**
 * Interface representing component state
 */
interface State {
  selectedDevice?: ExhibitionDevice;
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
    const { devices } = this.props;
    const { selectedDevice } = this.state;

    if (!devices) {
      throw new Error("devices array prop missing from basiclayout");
    }

    return devices.map(device => {
      return (
        <ListItem
          button
          selected={ selectedDevice && selectedDevice.id === device.id }
          onClick={ this.selectDeviceTab(device) }
        >
          <Typography>{ device.name }</Typography>
        </ListItem>
      );
    });
  }

  /**
   * Sets selected device to view
   */
  private selectDeviceTab = (device: ExhibitionDevice) => () => {
    const { setSelectedDevice } = this.props;

    if (!device.id) {
      return;
    }

    if (!setSelectedDevice) {
      throw new Error("setSelectedDevice function prop missing from basiclayout");
    }

    this.setState({
      selectedDevice: setSelectedDevice(device.id)
    });
  }

}

export default withStyles(styles)(TabList);
