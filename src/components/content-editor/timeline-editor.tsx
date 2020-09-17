import * as React from "react";

import { WithStyles, withStyles, List, ListItem, Paper, Typography } from "@material-ui/core";
import styles from "../../styles/components/content-editor/timeline-editor";
import { ExhibitionDevice, ExhibitionPage, ContentVersion } from "../../generated/client/models";
import classNames from "classnames";
import theme from "../../styles/theme";
import strings from "../../localization/strings";
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';
import { PreviewDeviceData } from "../../types";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  contentVersion: ContentVersion;
  devices: ExhibitionDevice[];
  previewDevicesData: PreviewDeviceData[];
  pages: ExhibitionPage[];
  selectedContentVersion?: ContentVersion;
  selectedDevice?: ExhibitionDevice;
  selectedPage?: ExhibitionPage;
  onClick: (contentVersion: ContentVersion, page: ExhibitionPage) => () => void;
  onDragEnd: (contentVersionId: string, deviceId: string) => (result: DropResult, provided: ResponderProvided) => void;
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
  const { classes, onDragEnd, contentVersion, pages } = props;
  const devicePages: ExhibitionPage[] = pages
    .filter(page => page.deviceId === device.id && page.contentVersionId === contentVersion.id)
    .sort((page1, page2) => page1.orderNumber - page2.orderNumber);

  return (
    <ListItem divider key={ device.id } className={ classes.timelineRow }>
      <DragDropContext onDragEnd={ onDragEnd(contentVersion.id!, device.id!) }>
        <Droppable droppableId="droppable" direction="horizontal">
          { (provided, snapshot) => renderDroppableContent(devicePages, props, provided, snapshot) }
        </Droppable>
      </DragDropContext>
    </ListItem>
  );
};

/**
 * Renders timeline row droppable content
 *
 * @param pages pages
 * @param props component props
 * @param provided droppable provided by Droppable parent
 * @param snapshot snapshot from droppable state
 */
const renderDroppableContent = (
  pages: ExhibitionPage[],
  props: Props,
  provided: DroppableProvided,
  snapshot: DroppableStateSnapshot
) => {
  const { classes } = props;
  const { droppableProps, innerRef, placeholder } = provided;
  return (
    <List
      ref={ innerRef }
      className={
        classNames(
          classes.pageList,
          snapshot.isDraggingOver && classes.isDraggedOver
        )
      }
      { ...droppableProps }
    >
      { pages.map((page, index) => renderDraggablePage(index, page, props)) }
      { placeholder }
    </List>
  );
};

/**
 * Renders page as draggable item
 *
 * @param index page index in pages list
 * @param page page
 * @param props component props
 */
const renderDraggablePage = (index: number, page: ExhibitionPage, props: Props) => {
  return (
    <Draggable
      key={ page.id }
      draggableId={ page.id ?? "" }
      index={ index }
    >
      { (provided, snapshot) => renderPageContent(index, page, props, provided, snapshot) }
    </Draggable>
  );
};

/**
 * Render page content
 *
 * @param index index
 * @param page page
 * @param props component props
 * @param provided draggable provided by Draggable parent
 * @param snapshot snapshot from draggable state
 */
const renderPageContent = (
  index: number,
  page: ExhibitionPage,
  props: Props,
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot
) => {
  const { classes, previewDevicesData, contentVersion, onClick } = props;
  const { innerRef, draggableProps, dragHandleProps } = provided;
  const { isDragging } = snapshot;
  const { selectedPage } = props;
  const deviceInPreview = previewDevicesData.find(previewData => previewData.device.id === page.deviceId);
  const inPreview = page.id === deviceInPreview?.page?.id;
  const selected = selectedPage?.id === page.id;
  const isDeviceIndexPage = index === 0;

  return (
    <Paper
      ref={ innerRef }
      variant="outlined"
      onClick={ onClick(contentVersion, page) }
      className={
        classNames(
          classes.pageItemContent,
          inPreview && classes.inPreview,
          selected && classes.selected,
          isDragging && classes.isDragged
        )
      }
      { ...draggableProps }
      { ...dragHandleProps }
    >
      { page.name }
      { isDeviceIndexPage &&
        <Typography
          variant="body1"
          style={{
            marginLeft: theme.spacing(1),
            fontSize: 12
          }}
        >
          { `(${strings.contentEditor.editor.indexPageId})` }
        </Typography>
      }
    </Paper>
  );
};

export default withStyles(styles)(TimelineEditor);
