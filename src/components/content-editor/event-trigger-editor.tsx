import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, MenuItem, Select, TextField, Typography, Button, List, ListItem, ListItemSecondaryAction, IconButton, FormControl, InputLabel, Divider, Paper } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, ExhibitionPageEventTrigger, ExhibitionPageEventActionType, ExhibitionPageEventPropertyType, ExhibitionPageEvent, ExhibitionPageEventProperty, PageLayoutView } from "../../generated/client";
import { PhysicalButton, PhysicalButtonData } from '../../types';
import strings from "../../localization/strings";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint";
import _ from "lodash";
import theme from "../../styles/theme";
import produce from "immer";
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
    selectedEventTrigger: ExhibitionPageEventTrigger;
    pages: ExhibitionPage[];
    onSave: (selectedEventTrigger: ExhibitionPageEventTrigger) => void;
  }

  /**
   * Component state
   */
  interface State {
    error?: Error;
    loading: boolean;
    selectedPageEventIndex?: number;
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
    };
  }

  /**
   * Component render method
   */
  public render() {
    return(
      <div style={{ marginTop: theme.spacing(2) }}>
        { this.renderTriggerName() }
        { this.renderPhysicalButtonSelects() }
        { this.renderDeviceGroupEventNameField() }
        { this.renderDelayField() }
        <Paper variant="outlined" square style={{ marginTop: theme.spacing(2) }} >
          <div style={{ display: "flex", justifyContent: "space-between", padding: theme.spacing(1), paddingLeft: theme.spacing(2), alignItems: "center" }}>
            <Typography variant="h5">
              { strings.contentEditor.editor.eventTriggers.actions }
            </Typography>
            <IconButton
              title={ strings.contentEditor.editor.eventTriggers.addEvent }
              color="primary"
              onClick={ this.onAddPageEventClick }
              >
              <AddIcon />
            </IconButton>
          </div>
          <Divider />
          { this.renderActionList() }
          <Divider />
          { this.renderEventOptions() }
        </Paper>
      </div>
    );
  }

  /**
   * Render trigger name
   */
  private renderTriggerName = () => {
    const { classes, selectedEventTrigger } = this.props;
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.contentEditor.editor.eventTriggers.variableName }
        </Typography>
        <TextField
          fullWidth={ false }
          name="name"
          className={ classes.textResourceEditor }
          value={ selectedEventTrigger.name }
          onChange={ this.onEventTriggerNameChange }
        />
      </div>
    );
  }

  /**
   * Render physical button selections
   */
  private renderPhysicalButtonSelects = () => {
    const trigger = this.props.selectedEventTrigger;
    const physicalButtons: PhysicalButtonData[] = [];

    _.forIn(PhysicalButton, value => {
      physicalButtons.push({
        name: `${strings.contentEditor.editor.eventTriggers.physicalButton} ${value}`,
        value: value
      });
    });

    const menuItems = physicalButtons.map((button, index) => {
      return (
        <MenuItem key={ `physicalButtonDown-${index}` } value={ button.value }>
          { button.name }
        </MenuItem>
      );
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.contentEditor.editor.eventTriggers.physicalButtonDownTitle }
        </Typography>
        <FormControl>
          <InputLabel>
            { strings.contentEditor.editor.eventTriggers.physicalButton }
          </InputLabel>
          <Select
            label={ strings.contentEditor.editor.eventTriggers.physicalButton }
            name="keyDown"
            value={ trigger.keyDown || "" }
            onChange={ this.onEventTriggerChange }
            >
            <MenuItem key={ `clickViewId-empty` } value="">
              { strings.removeSelection }
            </MenuItem>
            { menuItems }
          </Select>
        </FormControl>
        <Typography variant="h6" style={{ marginTop: theme.spacing(2) }}>
          { strings.contentEditor.editor.eventTriggers.physicalButtonUpTitle }
        </Typography>
        <FormControl>
          <InputLabel>
            { strings.contentEditor.editor.eventTriggers.physicalButton }
          </InputLabel>
          <Select
            label={ strings.contentEditor.editor.eventTriggers.physicalButton }
            name="keyUp"
            value={ trigger.keyUp || "" }
            onChange={ this.onEventTriggerChange }
            >
            <MenuItem key={ `clickViewId-empty` } value="">
              { strings.removeSelection }
            </MenuItem>
            { menuItems }
          </Select>
        </FormControl>
      </div>
    );
  }

  /**
   * Renders device group event name field
   */
  private renderDeviceGroupEventNameField = () => {
    const { classes } = this.props;
    return (
      <>
        <Typography
          variant="h6"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        >
          { strings.contentEditor.editor.eventTriggers.deviceGroupEventTitle }
        </Typography>
        <TextField
          type="text"
          className={ classes.textResourceEditor }
          label={ strings.contentEditor.editor.eventTriggers.deviceGroupEvent }
          name="deviceGroupEvent"
          value={ this.props.selectedEventTrigger?.deviceGroupEvent || "" }
          onChange={ this.onEventTriggerChange }
        />
      </>
    );
  }

  /**
   * Renders delay field
   */
  private renderDelayField = () => {
    const { classes } = this.props;
    return (
      <>
        <Typography
          variant="h6"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        >
          { strings.contentEditor.editor.eventTriggers.delayTitle }
        </Typography>
        <TextField
          className={ classes.textResourceEditor } 
          label={ strings.contentEditor.editor.eventTriggers.delay }
          name="delay"
          value={ this.props.selectedEventTrigger?.delay || 0 }
          onChange={ this.onEventTriggerChange }
        />
      </>
    );
  }

  /**
   * Render action list
   */
  private renderActionList = () => {
    const { selectedEventTrigger } = this.props;

    const events = selectedEventTrigger.events || [];
    const eventItems = events.map((event, index) => {
      return (
        <ListItem
          key={ index }
          button
          onClick={ this.onPageEventClick(index) }
        >
          <Typography style={{ marginLeft: theme.spacing(1) }} variant="h6">
            { event.action }
          </Typography>
          <ListItemSecondaryAction>
            <IconButton
              size="small"
              edge="end"
              aria-label="delete"
              onClick={ this.onPageEventDeleteClick(index) }
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return (
      <List disablePadding >
        { eventItems }
      </List>
    );
  }

  /**
   * Render event options
   */
  private renderEventOptions = () => {
    const { selectedEventTrigger } = this.props;
    const { selectedPageEventIndex } = this.state;

    if (selectedPageEventIndex === undefined || !selectedEventTrigger.events || !selectedEventTrigger.events.length) {
      return null;
    }

    return (
      <div style={{ padding: theme.spacing(1), paddingTop: theme.spacing(2) }}>
        <Typography style={{ marginLeft: theme.spacing(1) }} variant="h5">
          { strings.contentEditor.editor.eventTriggers.options }
        </Typography>
        { this.renderEventActionTypeSelect() }
        { this.renderEventActionSettings() }
      </div>
    );

  }

  /**
   * Render event action type list
   */
  private renderEventActionTypeSelect = () => {
    const selectedActionType = this.getSelectedEventActionType();
    const eventActionTypeList = Object.values(ExhibitionPageEventActionType).map((actionType, index) => {

      /**
       * TODO: Remove these when all page event action types have been implemented
       */
      if (
        actionType === ExhibitionPageEventActionType.Setuservalue ||
        actionType === ExhibitionPageEventActionType.Navigate
      ) {
        return (
          <MenuItem key={ `eventActionType-${ index }` } value={ actionType.toLowerCase() }>
            { actionType }
          </MenuItem>
        );
      }

      return null;
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Select
          value={ selectedActionType || "" }
          onChange={ this.onSelectEventActionType }
        >
          { eventActionTypeList }
        </Select>
      </div>
    );
  }

  /**
   * Render event action settings based on the selected event action type
   */
  private renderEventActionSettings = () => {
    switch (this.getSelectedEventActionType()) {
      case ExhibitionPageEventActionType.Hide:
      case ExhibitionPageEventActionType.Show:
      case ExhibitionPageEventActionType.Setsrc:
      case ExhibitionPageEventActionType.Settext:
        return <h5>{ strings.comingSoon }</h5>;
        /**
         * TODO: Needs implementation
         */
      case ExhibitionPageEventActionType.Setuservalue:
        return this.renderSetUserValueSettings();
      case ExhibitionPageEventActionType.Navigate:
        return this.renderNavigateSettings();
      case ExhibitionPageEventActionType.Triggerdevicegroupevent:
        return this.renderDeviceGroupEventSettings();
      default:
        return <></>;
    }
  }

  /**
   * Render set user value settings
   */
  private renderSetUserValueSettings = () => {
    const { classes } = this.props;
    const actionType = this.getSelectedEventActionType();
    if (actionType !== ExhibitionPageEventActionType.Setuservalue) {
      return;
    }

    const event = this.getCurrentPageEvent();
    const userValuePropertyName = event ? event.properties.find(property => property.name === "name") : undefined;
    const userValuePropertyValue = event ? event.properties.find(property => property.name === "value") : undefined;

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.contentEditor.editor.eventTriggers.variableName }
        </Typography>
        <TextField
          fullWidth={ false }
          name="name"
          className={ classes.textResourceEditor } 
          value={ userValuePropertyName?.value || "" }
          onChange={ this.onEventTriggerEventPropertyChange }
        />

        <Typography variant="h6">
          { strings.contentEditor.editor.eventTriggers.variableValue }
        </Typography>
        <TextField
          fullWidth={ false }
          name="value"
          className={ classes.textResourceEditor }
          value={ userValuePropertyValue?.value || "" }
          onChange={ this.onEventTriggerEventPropertyChange }
        />
      </div>
    );
  }

  /**
   * Render navigation settings
   */
  private renderNavigateSettings = () => {
    if (this.getSelectedEventActionType() !== ExhibitionPageEventActionType.Navigate) {
      return;
    }

    const selectedPageEvent = this.getCurrentPageEvent();

    if (!selectedPageEvent) {
      return null;
    }

    const property = selectedPageEvent.properties.find(prop => prop.name === "pageId");
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.contentEditor.editor.eventTriggers.selectPage }
        </Typography>
        <Select
          name={ "pageId" }
          value={ property ? property.value : "" }
          onChange={ this.onEventTriggerEventPropertyChange }
        >
          { this.fetchPagesInExhibition() }
        </Select>
      </div>
    );
  }

  /**
   * Render device group event settings
   */
  private renderDeviceGroupEventSettings = () => {
    const { selectedEventTrigger, classes } = this.props;
    const actionType = this.getSelectedEventActionType();
    if (actionType !== ExhibitionPageEventActionType.Triggerdevicegroupevent) {
      return;
    }

    const event = (selectedEventTrigger.events && selectedEventTrigger.events.length) ? selectedEventTrigger.events[0] : undefined;
    const deviceGroupEventNameProperty = event ? event.properties.find(property => property.name === "name") : undefined;

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.contentEditor.editor.eventTriggers.deviceGroupEvent }
        </Typography>
        <TextField
          fullWidth={ false }
          name="name"
          className={ classes.textResourceEditor }
          value={ deviceGroupEventNameProperty?.value || "" }
          onChange={ this.onEventTriggerEventPropertyChange }
        />
      </div>
    );
  }

  /**
   * Construct view id list handler
   *
   * @param items list of JSX elements
   * @param pageLayoutViews list of page layout views
   */
  private constructViewIdList = (items: JSX.Element[], pageLayoutViews: PageLayoutView[]) => {

    pageLayoutViews.forEach((pageLayoutView, index) => {
      items.push(
        <MenuItem key={ `clickViewId-${ index }` } value={ pageLayoutView.id }>
          { pageLayoutView.name ? pageLayoutView.name : pageLayoutView.id }
        </MenuItem>
      );

      if (pageLayoutView.children.length > 0) {
        this.constructViewIdList(items, pageLayoutView.children);
      }
    });

    return items;
  }

  /**
   * Gets action type of selected event
   *
   * @returns exhibition page event action type of undefined
   */
  private getSelectedEventActionType = (): ExhibitionPageEventActionType | undefined => {
    const { selectedEventTrigger } = this.props;
    const { selectedPageEventIndex } = this.state;
    if (selectedPageEventIndex === undefined) {
      return;
    }

    const event = selectedEventTrigger.events && selectedEventTrigger.events.length ? 
      selectedEventTrigger.events[selectedPageEventIndex] :
      undefined;
    return event ? event.action : undefined;
  }

  /**
   * Get current page event
   *
   * @returns found exhibition page event or undefined
   */
  private getCurrentPageEvent = (): ExhibitionPageEvent | undefined => {
    const { selectedEventTrigger } = this.props;
    const { selectedPageEventIndex } = this.state;

    if (selectedPageEventIndex === undefined || !selectedEventTrigger.events) {
      return;
    }

    return selectedEventTrigger.events[selectedPageEventIndex];
  }

  /**
   * Render pages in exhibition
   */
  private fetchPagesInExhibition = () => {

    const pageSelectionItems = this.props.pages.map(page => {
      return (
        <MenuItem key={ `event-trigger-navigation-${page.id}` } value={ page.id }>
          { page.name }
        </MenuItem>
      );
    });
    return pageSelectionItems;
  }

  /**
   * Event handler for event trigger event property change
   *
   * @param event react change event
   */
  private onEventTriggerNameChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const trigger: ExhibitionPageEventTrigger = { ...this.props.selectedEventTrigger };
    const key = event.target.name;
    const value = event.target.value as string;
    if (!key) {
      return;
    }

    trigger.name = value;
    this.props.onSave(trigger);
  }

  /**
   * Event handler for event trigger change
   *
   * @param event React change event
   */
  private onEventTriggerChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { selectedEventTrigger, onSave } = this.props;
    const propertyName = event.target.name as keyof ExhibitionPageEventTrigger;
    const value = event.target.value as string === "" ? undefined : event.target.value;

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
  }

  /**
   * Event handler for add page event click
   */
  private onAddPageEventClick = () => {
    const { onSave } = this.props;
    const newPageEvent: ExhibitionPageEvent = {
      action: ExhibitionPageEventActionType.Navigate,
      properties: []
    };

    const trigger: ExhibitionPageEventTrigger = { ...this.props.selectedEventTrigger };
    if (!trigger.events) {
      trigger.events = [];
    }

    trigger.events = [ ...trigger.events, newPageEvent ];

    this.setState({
      selectedPageEventIndex: trigger.events ? trigger.events.length - 1 : undefined
    });

    onSave(trigger);
  }

  /**
   * Event handler for page event click
   *
   * @param pageEventIndex page event index
   */
  private onPageEventClick = (pageEventIndex: number) => () => {
    this.setState({
      selectedPageEventIndex: pageEventIndex
    });
  }

  /**
   * Event handler for page event delete click
   *
   * @param pageEventIndex page event index 
   */
  private onPageEventDeleteClick = (pageEventIndex: number) => () => {
    const { onSave } = this.props;

    const trigger: ExhibitionPageEventTrigger = { ...this.props.selectedEventTrigger };
    if (!trigger.events) {
      return;
    }

    trigger.events = produce(trigger.events, draft => {
      draft.splice(pageEventIndex, 1);
    });

    onSave(trigger);
  }

  /**
   * Event handler for event trigger event property change
   *
   * @param event react change event
   */
  private onEventTriggerEventPropertyChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { onSave } = this.props;
    const { selectedPageEventIndex } = this.state;

    const trigger: ExhibitionPageEventTrigger = { ...this.props.selectedEventTrigger };
    const propertyName = event.target.name;
    const propertyValue = event.target.value as string;
    if (propertyName === undefined || !trigger.events || selectedPageEventIndex === undefined) {
      return;
    }

    trigger.events = produce(trigger.events, draft => {
      const propertyIndex = draft[selectedPageEventIndex].properties.findIndex(property => property.name === propertyName);
      if (propertyIndex === -1) {
        draft[selectedPageEventIndex].properties.push({
          name: propertyName,
          value: propertyValue,
          type: ExhibitionPageEventPropertyType.String
        });
      } else {
        draft[selectedPageEventIndex].properties[propertyIndex].value = propertyValue;
      }
    });

    onSave(trigger);
  }

  /**
   * On select event action handler
   *
   * @param event react change event
   */
  private onSelectEventActionType = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as ExhibitionPageEventActionType;

    /**
     * TODO: If we assume that each event trigger contains only one event, do we want to clear the existing values on select?
     */
    this.overwriteEventInJson(value);
  }

  /**
   * Overwrite event in json handler
   *
   * @param actionType new event action type
   */
  private overwriteEventInJson = (actionType: ExhibitionPageEventActionType) => {
    const { onSave } = this.props;
    const { selectedPageEventIndex } = this.state;
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;
    if (selectedPageEventIndex === undefined) {
      return;
    }

    const newAction = this.createEvent(actionType);

    if (!trigger.events) {
      trigger.events = [];
      trigger.events.push(newAction);
    } else {
      trigger.events = produce(trigger.events, draft => {
        draft.splice(selectedPageEventIndex, 1, newAction);
      });
    }

    onSave(trigger);
  }

  /**
   * Get event properties based on action type
   *
   * @param actionType ExhibitionPageEventActionType
   * @returns list of exhibition page event properties
   */
  private getEventPropertiesByType = (actionType: ExhibitionPageEventActionType): ExhibitionPageEventProperty[] => {
    switch (actionType) {
      case ExhibitionPageEventActionType.Hide: return [];
      case ExhibitionPageEventActionType.Show: return [];
      case ExhibitionPageEventActionType.Navigate:
        return [this.getStringProperty("pageId")];
      case ExhibitionPageEventActionType.Setsrc: return [];
      case ExhibitionPageEventActionType.Settext: return [];
      case ExhibitionPageEventActionType.Setuservalue:
        return [
          this.getStringProperty("name"),
          this.getStringProperty("value")
        ];
      case ExhibitionPageEventActionType.Triggerdevicegroupevent:
        return [this.getStringProperty("name")];
      default: return [];
    }
  }

  /**
   * Get string type property
   *
   * @param name property name
   * @param value property value
   * @returns exhibition page event property
   */
  private getStringProperty = (name: string, value?: string): ExhibitionPageEventProperty => {
    return {
      name: name,
      value: value || "",
      type: ExhibitionPageEventPropertyType.String
    };
  }

  /**
   * Create event based on the given values
   *
   * @param actionType given action type
   * @returns exhibition page event
   */
  private createEvent = (actionType: ExhibitionPageEventActionType): ExhibitionPageEvent => {
    const eventProperties: ExhibitionPageEventProperty[] = this.getEventPropertiesByType(actionType);
    const newEvent: ExhibitionPageEvent = {
      action: actionType,
      properties: eventProperties
    };

    return newEvent;
  }
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
