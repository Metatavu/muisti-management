import * as React from "react";

import { WithStyles, withStyles, List, ListItem } from "@material-ui/core";
import styles from "../../styles/components/generic/toolbar";
import { ExhibitionDevice } from "../../generated/client/models";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  devices: ExhibitionDevice[];
  selectedDevice?: ExhibitionDevice;
  onClick: (device: ExhibitionDevice) => (e: React.MouseEvent) => void;
}

/**
 * Functional component for timeline devices list
 *
 * @param props component props
 */
const TimelineDevicesList: React.FC<Props> = ({ devices, selectedDevice, onClick }: Props) => {
  return (
    <List
      style={{ width: 250 }}
    >
      { 
        devices.map(device => {
          return (
            <ListItem
              button
              divider
              key={ device.id }
              selected={ selectedDevice && selectedDevice.id === device.id }
              onClick={ onClick(device) }
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