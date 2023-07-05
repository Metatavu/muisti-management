import { ContentVersion, ExhibitionDevice } from "../../generated/client/models";
import styles from "../../styles/components/content-editor/timeline-devices-list";
import { List, ListItem } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

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
    <List className={classes.list}>
      {devices.map((device) => {
        const deviceSelected = selectedDevice?.id === device.id;
        return (
          <ListItem
            button
            divider
            key={device.id}
            selected={deviceSelected && (!selectedContentVersion || contentVersionSelected)}
            onClick={onClick && onClick(device, contentVersion)}
            className={classes.listItem}
          >
            {device.name || ""}
          </ListItem>
        );
      })}
    </List>
  );
};

export default withStyles(styles)(TimelineDevicesList);
