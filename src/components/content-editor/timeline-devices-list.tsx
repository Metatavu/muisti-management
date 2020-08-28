import * as React from "react";

import { WithStyles, withStyles, List, ListItem } from "@material-ui/core";
import styles from "../../styles/components/content-editor/timeline-devices-list";
import { ExhibitionDevice } from "../../generated/client/models";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  devices: ExhibitionDevice[];
  selectedDevice?: ExhibitionDevice;
  onClick: (device: ExhibitionDevice) => () => void;
}

/**
 * Functional component for timeline devices list
 *
 * @param props component props
 */
const TimelineDevicesList: React.FC<Props> = ({
  devices,
  selectedDevice,
  onClick,
  classes
}) => {
  return (
    <List className={ classes.list }>
      {
        devices.map(device => {
          return (
            <ListItem
              button
              divider
              key={ device.id }
              selected={ selectedDevice && selectedDevice.id === device.id }
              onClick={ onClick(device) }
              className={ classes.listItem }
            >
              { device.name || "" }
            </ListItem>
          );
        })
      }
    </List>
  );
};

export default withStyles(styles)(TimelineDevicesList);