import * as React from "react";

import { WithStyles, withStyles, List, ListItem, Paper } from "@material-ui/core";
import styles from "../../styles/components/content-editor/timeline-editor";
import { ExhibitionDevice, ExhibitionPage } from "../../generated/client/models";
import Draggable from "react-draggable";
import classNames from "classnames";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
  selectedPage?: ExhibitionPage;
  onClick: (page: ExhibitionPage) => () => void;
}

/**
 * Functional component for timeline editor
 *
 * @param props component props
 */
const TimelineEditor: React.FC<Props> = (props: Props) => {
  const { devices, classes } = props;
  return (
    <List className={ classes.timeLineRowList }>
      { devices.map(device => renderTimelineRow(device, props)) }
    </List>
  );
};

/**
 * Renders single timeline row
 * 
 * @param device device
 * @param props component props
 */
const renderTimelineRow = (device: ExhibitionDevice, props: Props) => {
  const { classes, pages } = props;
  const devicePages = pages.filter(page => page.deviceId === device.id);
  return (
    <ListItem divider key={ device.id } className={ classes.timelineRow }>
      <List className={ classes.pageList }>
        { devicePages.map(page => renderDraggableItem(page, props)) }
      </List>
    </ListItem>
  );
}

/**
 * Renders page as draggable item
 * 
 * @param page page
 * @param props component props
 */
const renderDraggableItem = (page: ExhibitionPage, props: Props) => {
  const { onClick, selectedPage, classes } = props;
  const selected = selectedPage?.id === page.id;
  return (
    <Draggable
      key={ page.id }
      axis="x"
      grid={[5, 0]}
      defaultClassName={ classes.pageItem }
      bounds={ `.${classes.timelineRow}` }
    >
      <Paper
        variant="outlined"
        onClick={ onClick(page) }
        className={ classNames(classes.pageItemContent, selected ? classes.selected : "") }
      >
        { page.name }
      </Paper>
    </Draggable>
  );
}

export default withStyles(styles)(TimelineEditor);