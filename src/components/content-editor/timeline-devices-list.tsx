import * as React from "react";

import { WithStyles, withStyles, List, ListItem } from "@material-ui/core";
import styles from "../../styles/components/content-editor/timeline-devices-list";
import { ExhibitionDevice, ContentVersion } from "../../generated/client/models";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  contentVersion?: ContentVersion;
  selectedContentVersion?: ContentVersion;
  devices: ExhibitionDevice[];
  selectedDevice?: ExhibitionDevice;
  onClick?: (device: ExhibitionDevice, contentVersion?: ContentVersion) => () => void;
}

/**
 * Functional component for timeline devices list
 *
 * @param props component props
 */
const TimelineDevicesList: React.FC<Props> = ({
  contentVersion,
  selectedContentVersion,
  devices,
  selectedDevice,
  onClick,
  classes
}) => {
  const contentVersionSelected = selectedContentVersion?.id === contentVersion?.id;

  return (
    <List className={ classes.list }>
      {
        devices.map(device => {
          const deviceSelected = selectedDevice?.id === device.id;
          return (
            <ListItem
              button
              divider
              key={ device.id }
              selected={ deviceSelected && (!selectedContentVersion || contentVersionSelected) }
              onClick={ onClick && onClick(device, contentVersion) }
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