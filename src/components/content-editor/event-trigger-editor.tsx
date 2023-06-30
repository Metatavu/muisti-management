import { setSelectedExhibition } from "../../actions/exhibitions";
import {
  Exhibition,
  ExhibitionPage,
  ExhibitionPageEvent,
  ExhibitionPageEventTrigger,
  PageLayoutView,
  VisitorVariable
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";
import { PhysicalButton, PhysicalButtonData } from "../../types";
import HelpDialog from "../generic/help-dialog";
import PageEventDialog from "./page-event-dialog";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ChevronRight";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import produce from "immer";
import { KeycloakInstance } from "keycloak-js";
// TODO: Code mirror related imports.
// import "codemirror/lib/codemirror.css";
// import "codemirror/theme/material.css";
// import "codemirror/mode/javascript/javascript";
// import "codemirror/addon/lint/lint.css";
// import "codemirror/addon/lint/lint";
import _ from "lodash";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  selectedEventTrigger?: ExhibitionPageEventTrigger;
  view?: PageLayoutView;
  pages: ExhibitionPage[];
  visitorVariables: VisitorVariable[];
  availableLanguages: string[];
  onSave: (selectedEventTrigger: ExhibitionPageEventTrigger) => void;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  selectedPageEventIndex?: number;
  showPageEventDialog: boolean;
  addingNewPageEvent: boolean;
}

/**
 * Component for event trigger editor
 */
class EventTriggerEditor extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      showPageEventDialog: false,
      addingNewPageEvent: false
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        {this.renderTriggerName()}
        <Paper variant="outlined" square style={{ marginTop: theme.spacing(2) }}>
          <Box display="flex" justifyContent="space-between" p={1} pl={2} alignItems="center">
            <Typography variant="h5">
              {strings.contentEditor.editor.eventTriggers.actions}
            </Typography>
            <IconButton
              title={strings.contentEditor.editor.eventTriggers.addEvent}
              color="primary"
              onClick={this.onAddPageEventClick}
              size="large"
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Divider />
          {this.renderActionList()}
          <Divider />
          {this.renderEventOptions()}
        </Paper>
        <Box mt={2}>{this.renderAdvancedSettings()}</Box>
      </div>
    );
  };

  /**
   * Render advanced settings
   */
  private renderAdvancedSettings = () => {
    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2">{strings.contentEditor.advanced}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {this.renderPhysicalButtonSelects()}
          {this.renderDeviceGroupEventNameField()}
          {this.renderDelayField()}
        </AccordionDetails>
      </Accordion>
    );
  };

  /**
   * Render trigger name
   */
  private renderTriggerName = () => {
    const { classes, selectedEventTrigger } = this.props;

    if (!selectedEventTrigger) {
      return null;
    }

    return (
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <TextField
          label={strings.contentEditor.editor.eventTriggers.eventName}
          fullWidth={false}
          name="name"
          className={classes.textResourceEditor}
          value={selectedEventTrigger.name}
          onChange={this.onEventTriggerNameChange}
        />
        <HelpDialog title={strings.contentEditor.editor.eventTriggers.eventName}>
          <Typography>{strings.helpDialogs.contentEditor.events.nameDescription}</Typography>
        </HelpDialog>
      </Box>
    );
  };

  /**
   * Render physical button selections
   */
  private renderPhysicalButtonSelects = () => {
    const trigger = this.props.selectedEventTrigger;
    const physicalButtons: PhysicalButtonData[] = [];

    _.forIn(PhysicalButton, (value) => {
      physicalButtons.push({
        name: `${strings.contentEditor.editor.eventTriggers.physicalButton} ${value}`,
        value: value
      });
    });

    const menuItems = physicalButtons.map((button, index) => {
      return (
        <MenuItem key={`physicalButtonDown-${index}`} value={button.value}>
          {button.name}
        </MenuItem>
      );
    });

    return (
      <Box>
        <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {strings.contentEditor.editor.eventTriggers.physicalButtonDownTitle}
          </Typography>
          <HelpDialog title={strings.contentEditor.editor.eventTriggers.physicalButtonDownTitle}>
            <Typography>
              {strings.helpDialogs.contentEditor.events.physicalButtonDownDescription}
            </Typography>
          </HelpDialog>
        </Box>
        <FormControl>
          <InputLabel>{strings.contentEditor.editor.eventTriggers.physicalButton}</InputLabel>
          <Select
            label={strings.contentEditor.editor.eventTriggers.physicalButton}
            name="keyDown"
            value={trigger?.keyDown || ""}
            onChange={this.onEventTriggerChange}
          >
            <MenuItem key={`clickViewId-empty`} value="">
              {strings.removeSelection}
            </MenuItem>
            {menuItems}
          </Select>
        </FormControl>
        <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {strings.contentEditor.editor.eventTriggers.physicalButtonUpTitle}
          </Typography>
          <HelpDialog title={strings.contentEditor.editor.eventTriggers.physicalButtonUpTitle}>
            <Typography>
              {strings.helpDialogs.contentEditor.events.physicalButtonUpDescription}
            </Typography>
          </HelpDialog>
        </Box>
        <FormControl>
          <InputLabel>{strings.contentEditor.editor.eventTriggers.physicalButton}</InputLabel>
          <Select
            label={strings.contentEditor.editor.eventTriggers.physicalButton}
            name="keyUp"
            value={trigger?.keyUp || ""}
            onChange={this.onEventTriggerChange}
          >
            <MenuItem key={`clickViewId-empty`} value="">
              {strings.removeSelection}
            </MenuItem>
            {menuItems}
          </Select>
        </FormControl>
      </Box>
    );
  };

  /**
   * Renders device group event name field
   */
  private renderDeviceGroupEventNameField = () => {
    const { classes } = this.props;
    return (
      <Box>
        <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h6"
            style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
          >
            {strings.contentEditor.editor.eventTriggers.deviceGroupEventTitle}
          </Typography>
          <HelpDialog title={strings.contentEditor.editor.eventTriggers.deviceGroupEventTitle}>
            <Typography>
              {strings.helpDialogs.contentEditor.events.deviceGroupEventDescription}
            </Typography>
          </HelpDialog>
        </Box>
        <TextField
          type="text"
          className={classes.textResourceEditor}
          label={strings.contentEditor.editor.eventTriggers.deviceGroupEvent}
          name="deviceGroupEvent"
          value={this.props.selectedEventTrigger?.deviceGroupEvent || ""}
          onChange={this.onEventTriggerChange}
        />
      </Box>
    );
  };

  /**
   * Renders delay field
   */
  private renderDelayField = () => {
    const { classes } = this.props;
    return (
      <Box>
        <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {strings.contentEditor.editor.eventTriggers.delayTitle}
          </Typography>
          <HelpDialog title={strings.contentEditor.editor.eventTriggers.delayTitle}>
            <Typography>
              {strings.helpDialogs.contentEditor.events.delayEventDescription}
            </Typography>
          </HelpDialog>
        </Box>
        <TextField
          className={classes.textResourceEditor}
          label={strings.contentEditor.editor.eventTriggers.delay}
          name="delay"
          value={this.props.selectedEventTrigger?.delay || 0}
          onChange={this.onEventTriggerChange}
        />
      </Box>
    );
  };

  /**
   * Render action list
   */
  private renderActionList = () => {
    const { selectedEventTrigger } = this.props;

    const events = selectedEventTrigger?.events || [];
    const eventItems = events.map((event, index) => {
      return (
        <ListItem key={index} button onClick={this.onPageEventClick(index)}>
          <ListItemText
            primary={strings.contentEditor.editor.eventTriggers.actionTypes[event.action]}
            secondary={event.action}
          />
          <ListItemSecondaryAction>
            <IconButton
              size="small"
              edge="end"
              aria-label="delete"
              onClick={this.onPageEventDeleteClick(index)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return <List disablePadding>{eventItems}</List>;
  };

  /**
   * Render event options
   */
  private renderEventOptions = () => {
    const { selectedEventTrigger, visitorVariables, pages, view, availableLanguages } = this.props;

    const { showPageEventDialog, addingNewPageEvent, selectedPageEventIndex } = this.state;

    const selectedEvent = selectedEventTrigger?.events?.find(
      (event, index) => index === selectedPageEventIndex
    );

    return (
      <PageEventDialog
        selectedEvent={selectedEvent}
        pages={pages}
        visitorVariables={visitorVariables}
        creatingNew={addingNewPageEvent}
        dialogOpen={showPageEventDialog}
        view={view}
        availableLanguages={availableLanguages}
        onCloseOrCancel={() => this.setState({ showPageEventDialog: false })}
        onCreate={this.onAddNewPageEventClick}
        onUpdate={this.updateEventInJson}
      />
    );
  };

  /**
   * Construct view id list handler
   *
   * @param items list of JSX elements
   * @param pageLayoutViews list of page layout views
   */
  private constructViewIdList = (items: JSX.Element[], pageLayoutViews: PageLayoutView[]) => {
    pageLayoutViews.forEach((pageLayoutView, index) => {
      items.push(
        <MenuItem key={`clickViewId-${index}`} value={pageLayoutView.id}>
          {pageLayoutView.name ? pageLayoutView.name : pageLayoutView.id}
        </MenuItem>
      );

      if (pageLayoutView.children.length > 0) {
        this.constructViewIdList(items, pageLayoutView.children);
      }
    });

    return items;
  };

  /**
   * Event handler for event trigger event property change
   *
   * @param event react change event
   */
  private onEventTriggerNameChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => {
    const { selectedEventTrigger } = this.props;
    const key = event.target.name;

    if (!selectedEventTrigger || !key) {
      return;
    }

    this.props.onSave({ ...selectedEventTrigger, name: event.target.value as string });
  };

  /**
   * Event handler for event trigger change
   *
   * @param event React change event
   */
  private onEventTriggerChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { selectedEventTrigger, onSave } = this.props;

    if (!selectedEventTrigger) {
      return;
    }

    const propertyName = event.target.name as keyof ExhibitionPageEventTrigger;
    const value = (event.target.value as string) === "" ? undefined : event.target.value;

    switch (propertyName) {
      case "delay":
        const valueString = value as string;
        onSave({
          ...selectedEventTrigger,
          [propertyName]: isNumber(valueString) ? Number(valueString) : 0
        });
        break;
      case "clickViewId":
      case "deviceGroupEvent":
        onSave({ ...selectedEventTrigger, [propertyName]: value as string });
        break;
      case "keyUp":
      case "keyDown":
        onSave({ ...selectedEventTrigger, [propertyName]: value as PhysicalButton });
        break;
      default:
        console.warn("Error in onEventTriggerChange: Unknown or invalid property name");
        break;
    }
  };

  /**
   * Event handler for add new page event click
   */
  private onAddPageEventClick = () => {
    this.setState({
      showPageEventDialog: true,
      addingNewPageEvent: true,
      selectedPageEventIndex: undefined
    });
  };

  /**
   * Event handler for add page event click
   *
   * @param newPageEvent new page event to be saved
   */
  private onAddNewPageEventClick = (newPageEvent: ExhibitionPageEvent) => {
    const { selectedEventTrigger, onSave } = this.props;

    if (!selectedEventTrigger) {
      return;
    }

    const updatedTrigger: ExhibitionPageEventTrigger = {
      ...selectedEventTrigger,
      events: [...(selectedEventTrigger.events || []), newPageEvent]
    };

    this.setState({
      selectedPageEventIndex: updatedTrigger.events ? updatedTrigger.events.length - 1 : undefined,
      showPageEventDialog: false,
      addingNewPageEvent: false
    });

    onSave(updatedTrigger);
  };

  /**
   * Event handler for page event click
   *
   * @param pageEventIndex page event index
   */
  private onPageEventClick = (pageEventIndex: number) => () => {
    this.setState({
      selectedPageEventIndex: pageEventIndex,
      showPageEventDialog: true,
      addingNewPageEvent: false
    });
  };

  /**
   * Event handler for page event delete click
   *
   * @param pageEventIndex page event index
   */
  private onPageEventDeleteClick = (pageEventIndex: number) => () => {
    const { selectedEventTrigger, onSave } = this.props;

    if (!selectedEventTrigger || !selectedEventTrigger.events) {
      return;
    }

    onSave({
      ...selectedEventTrigger,
      events: selectedEventTrigger.events.filter((event, index) => index !== pageEventIndex)
    });

    this.setState({ selectedPageEventIndex: undefined });
  };

  /**
   * Event handler for updating page event in json
   *
   * @param updatedPageEvent updated page event
   */
  private updateEventInJson = (updatedPageEvent: ExhibitionPageEvent) => {
    const { onSave } = this.props;
    const { selectedPageEventIndex } = this.state;
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;

    if (selectedPageEventIndex === undefined) {
      return;
    }

    if (!trigger.events) {
      trigger.events = [];
      trigger.events.push(updatedPageEvent);
    } else {
      trigger.events = produce(trigger.events, (draft) => {
        draft.splice(selectedPageEventIndex, 1, updatedPageEvent);
      });
    }

    this.setState({
      showPageEventDialog: false,
      addingNewPageEvent: false
    });

    onSave(trigger);
  };
}

/**
 * Returns whether string contains valid number
 *
 * @param value value to be checked
 * @return whether string contains valid number
 */
function isNumber(value: string): boolean {
  return !!/^[0-9.]+$/.exec(value);
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setSelectedExhibition: (exhibition: Exhibition) => dispatch(setSelectedExhibition(exhibition))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventTriggerEditor));
