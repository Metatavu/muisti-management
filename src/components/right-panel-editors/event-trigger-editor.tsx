import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/exhibition-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, ExhibitionPageEventTrigger, ExhibitionPageEventActionType, ExhibitionPageEventPropertyType, PageLayout, ExhibitionPageEvent, ExhibitionPageEventProperty, PageLayoutView } from "../../generated/client";
import { AccessToken, PhysicalButton, PhysicalButtonData } from '../../types';
import strings from "../../localization/strings";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint";
import _ from "lodash";
import theme from "../../styles/theme";
import produce from "immer";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
    history: History;
    accessToken: AccessToken;
    selectedEventTrigger: ExhibitionPageEventTrigger;
    pages: ExhibitionPage[];
    layout: PageLayout;
    onSave: (selectedEventTrigger: ExhibitionPageEventTrigger) => void;
  }

  /**
   * Component state
   */
  interface State {
    error?: Error;
    loading: boolean;
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
        { this.renderClickViewIdSelect() }
        { this.renderPhysicalButtonSelects() }
        { this.renderDeviceGroupEventNameField() }
        { this.renderDelayField() }

        <Typography variant="h6" style={{ marginTop: theme.spacing(2) }}>
          { strings.exhibition.eventTriggers.actions }
        </Typography>
        { this.renderEventActionTypeSelect() }
        { this.props.selectedEventTrigger &&
          this.renderEventActionSettings()
        }
      </div>
    );
  }

  /**
   * Render click view id select
   */
  private renderClickViewIdSelect = () => {
    const { selectedEventTrigger, layout } = this.props;
    const clickViewId = selectedEventTrigger.clickViewId;
    const tempList: JSX.Element[] = [];
    const clickViewIdList = this.constructViewIdList(tempList, layout.data.children);

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.exhibition.eventTriggers.clickViewIdTitle }
        </Typography>
        <Select
          variant="filled"
          label={ strings.exhibition.eventTriggers.clickViewId }
          fullWidth
          name="clickViewId"
          value={ clickViewId || "" }
          onChange={ this.onEventTriggerChange }
        >
          <MenuItem key={ `clickViewId-empty` } value="">
            { strings.removeSelection }
          </MenuItem>
          { clickViewIdList }
        </Select>
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
        name: `${strings.exhibition.eventTriggers.physicalButton} ${value}`,
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
          { strings.exhibition.eventTriggers.physicalButtonDownTitle }
        </Typography>
        <Select
          variant="filled"
          label={ strings.exhibition.eventTriggers.physicalButton }
          fullWidth
          name="keyDown"
          value={ trigger.keyDown || "" }
          onChange={ this.onEventTriggerChange }
        >
          <MenuItem key={ `clickViewId-empty` } value="">
            { strings.removeSelection }
          </MenuItem>
          { menuItems }
        </Select>
        <Typography variant="h6" style={{ marginTop: theme.spacing(2) }}>
          { strings.exhibition.eventTriggers.physicalButtonUpTitle }
        </Typography>
        <Select
          variant="filled"
          label={ strings.exhibition.eventTriggers.physicalButton }
          fullWidth
          name="keyUp"
          value={ trigger.keyUp || "" }
          onChange={ this.onEventTriggerChange }
        >
          <MenuItem key={ `clickViewId-empty` } value="">
            { strings.removeSelection }
          </MenuItem>
          { menuItems }
        </Select>
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
          { strings.exhibition.eventTriggers.deviceGroupEventTitle }
        </Typography>
        <TextField
          type="text"
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.eventTriggers.deviceGroupEvent }
          variant="filled"
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
          { strings.exhibition.eventTriggers.delayTitle }
        </Typography>
        <TextField
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.eventTriggers.delay }
          variant="filled"
          name="delay"
          value={ this.props.selectedEventTrigger?.delay || 0 }
          onChange={ this.onEventTriggerChange }
        />
      </>
    );
  }

  /**
   * Render event action type list
   */
  private renderEventActionTypeSelect = () => {
    const selectedActionType = this.getSelectedEventActionType();
    const eventActionTypeList = Object.keys(ExhibitionPageEventActionType).map((actionType, index) => {
      return (
        <MenuItem key={ `eventActionType-${ index }` } value={ actionType.toLowerCase() }>
          { actionType }
        </MenuItem>
      );
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Select
          variant="filled"
          fullWidth
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
    const { classes, selectedEventTrigger } = this.props;
    const actionType = this.getSelectedEventActionType();
    if (actionType !== ExhibitionPageEventActionType.Setuservalue) {
      return;
    }

    const event = (selectedEventTrigger.events && selectedEventTrigger.events.length) ? selectedEventTrigger.events[0] : undefined;
    const userValuePropertyName = event ? event.properties.find(property => property.name === "name") : undefined;
    const userValuePropertyValue = event ? event.properties.find(property => property.name === "value") : undefined;

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.exhibition.eventTriggers.variableName }
        </Typography>
        <TextField
          name="name"
          className={ classes.textResourceEditor } 
          variant="filled"
          value={ userValuePropertyName?.value || "" }
          onChange={ this.onEventTriggerEventPropertyChange }
        />

        <Typography variant="h6">
          { strings.exhibition.eventTriggers.variableValue }
        </Typography>
        <TextField
          name="value"
          className={ classes.textResourceEditor }
          variant="filled"
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

    const selectedNavigationPageId = this.resolveSelectedPageId();

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          { strings.exhibition.eventTriggers.selectPage }
        </Typography>
        <Select
          variant="filled"
          fullWidth
          name={ "pageId" }
          value={ selectedNavigationPageId || "" }
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
          { strings.exhibition.eventTriggers.deviceGroupEvent }
        </Typography>
        <TextField
          name="name"
          className={ classes.textResourceEditor } 
          variant="filled"
          value={ deviceGroupEventNameProperty?.value || "" }
          onChange={ this.onEventTriggerEventPropertyChange }
        />
      </div>
    );
  }

  /**
   * Construct view id list handler
   */
  private constructViewIdList = (items: JSX.Element[], pageLayoutViews: PageLayoutView[]) => {

    pageLayoutViews.forEach((pageLayoutView, index) => {
      items.push(
        <MenuItem key={ `clickViewId-${index}` } value={ pageLayoutView.id }>
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
   */
  private getSelectedEventActionType = (): ExhibitionPageEventActionType | undefined => {
    const { selectedEventTrigger } = this.props;
    const event = selectedEventTrigger.events && selectedEventTrigger.events.length ? selectedEventTrigger.events[0] : undefined;
    return event ? event.action : undefined;
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
   * Resolves selected navigate event page id 
   * 
   * @return selected navigate event page id or null if not found
   */
  private resolveSelectedPageId = (): string | null => {
    const navigateEvent = (this.props.selectedEventTrigger.events || []).find(event => event.action === ExhibitionPageEventActionType.Navigate);
    if (navigateEvent) {
      const pageIdProperty = navigateEvent.properties.find(property => property.name === "pageId");
      return pageIdProperty?.value || null;
    }

    return null;
  }

  /**
   * Event handler for event trigger change
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
   * Event handler event trigger event property change
   * @param event react change event
   */
  private onEventTriggerEventPropertyChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const trigger: ExhibitionPageEventTrigger = { ...this.props.selectedEventTrigger };
    const propertyName = event.target.name;
    const propertyValue = event.target.value as string;
    if (propertyName === undefined || !trigger.events || !trigger.events.length) {
      return;
    }

    if (!trigger.events[0].properties || !trigger.events[0].properties.length) {
      return;
    }

    trigger.events = produce(trigger.events, draft => {
      const propertyIndex = draft[0].properties.findIndex(property => property.name === propertyName);
      if (propertyIndex === -1) {
        draft[0].properties.push({
          name: propertyName,
          value: propertyValue,
          type: ExhibitionPageEventPropertyType.String
        });
      } else {
        draft[0].properties[propertyIndex].value = propertyValue;
      }
    });

    this.props.onSave(trigger);
  }

  /**
   * On select event action handler
   * @param event react change event
   */
  private onSelectEventActionType = (event: React.ChangeEvent<{ value: unknown }>)=> {
    const value = event.target.value as ExhibitionPageEventActionType;

    /**
     * TODO: If we assume that each event trigger contains only one event, do we want to clear the existing values on select?
     */
    this.overwriteEventInJson(value);
  }

  /**
   * Overwrite event in json handler
   * @param actionType new event action type
   */
  private overwriteEventInJson = (actionType: ExhibitionPageEventActionType) => {
    const trigger: ExhibitionPageEventTrigger = Object.assign({}, this.props.selectedEventTrigger);
    if (trigger.events?.length !== 0 && trigger.events![0].action === actionType) {
      return;
    }

    const newAction = this.createEvent(actionType);
    trigger.events = [newAction];
    this.props.onSave(trigger);
  }

  /**
   * Get event properties based on action type
   * @param actionType ExhibitionPageEventActionType
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
   * @param name property name
   */
  private getStringProperty = (name: string, value?: string): ExhibitionPageEventProperty => {
    return {
      name: name,
      value: value || "",
      type: ExhibitionPageEventPropertyType.String
    }
  }

  /**
   * Create event based on the given values
   * @param actionType given action type
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
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken
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
