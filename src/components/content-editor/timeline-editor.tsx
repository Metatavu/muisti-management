import * as React from "react";

import { WithStyles, withStyles, List, ListItem, Paper } from "@material-ui/core";
import styles from "../../styles/components/content-editor/timeline-editor";
import { ExhibitionDevice, ExhibitionPage } from "../../generated/client/models";
import classNames from "classnames";
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided, DraggableProvided, DraggableStateSnapshot, DroppableProvided, DroppableStateSnapshot } from 'react-beautiful-dnd';

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * TODO: Change to ExhibitionDevice when it supports page order
   */
  devices: ExtendedDevice[];
  pages: ExhibitionPage[];
  selectedPage?: ExhibitionPage;
  onClick: (page: ExhibitionPage) => () => void;
  onDragEnd: (deviceId: string) => (result: DropResult, provided: ResponderProvided) => void;
}

/**
 * TODO:
 * Remove when device includes page order
 * 
 * Interface describing device extended with page order
 */
interface ExtendedDevice extends ExhibitionDevice {
  pageOrder: string[];
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
const renderTimelineRow = (device: ExtendedDevice, props: Props) => {
  const { classes, onDragEnd } = props;
  const pages: ExhibitionPage[] = [];
  device.pageOrder.forEach(pageId => {
    const page = props.pages.find(page => page.id === pageId);
    if (page) {
      pages.push(page);
    }
  });

  return (
    <ListItem divider key={ device.id! } className={ classes.timelineRow }>
      <DragDropContext onDragEnd={ onDragEnd(device.id!) }>
        <Droppable droppableId="droppable" direction="horizontal">
          { (provided, snapshot) => renderDroppableContent(pages, props, provided, snapshot) }
        </Droppable>
      </DragDropContext>
    </ListItem>
  );
}

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
}

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
      { (provided, snapshot) => renderPageContent(page, props, provided, snapshot) }
    </Draggable>
  );
}

/**
 * Render page content
 * 
 * @param page page
 * @param props component props
 * @param provided draggable provided by Draggable parent
 * @param snapshot snapshot from draggable state
 */
const renderPageContent = (
  page: ExhibitionPage,
  props: Props,
  provided: DraggableProvided,
  snapshot: DraggableStateSnapshot
) => {
  const { classes, onClick } = props;
  const { innerRef, draggableProps, dragHandleProps } = provided;
  const { isDragging } = snapshot;
  const { selectedPage } = props;
  const selected = selectedPage?.id === page.id;

  return (
    <Paper
      ref={ innerRef }
      variant="outlined"
      onClick={ onClick(page) }
      className={
        classNames(
          classes.pageItemContent,
          selected && classes.selected,
          isDragging && classes.isDragged
        )
      }
      { ...draggableProps }
      { ...dragHandleProps }
    >
      { page.name }
    </Paper>
  );
}

export default withStyles(styles)(TimelineEditor);
