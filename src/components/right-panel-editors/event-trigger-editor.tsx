import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/exhibition-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { TreeView } from "@material-ui/lab";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, ExhibitionPageEventTrigger, ExhibitionPageEventActionType, ExhibitionPageEventPropertyType, PageLayout, ExhibitionPageEvent } from "../../generated/client";
import { AccessToken, PhysicalButton, PhysicalButtonData } from '../../types';
import strings from "../../localization/strings";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint";
import _ from "lodash";
import theme from "../../styles/theme";

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

    const classes = this.props.classes;

    return(
      <div style={{ marginTop: theme.spacing(2) }}>
        { this.renderClickViewIdSelect() }
        { this.renderPhysicalButtonSelections() }
        <Typography
          variant="h6"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        >
          { strings.exhibition.eventTriggers.delayTitle }
        </Typography>
        <TextField
          type="delay"
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.eventTriggers.delay }
          variant="filled"
          value={ this.props.selectedEventTrigger?.delay || 0 }
          onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onDelayChange(event) }
        />
        <Typography variant="h6" style={{ marginTop: theme.spacing(2) }}>{ strings.exhibition.eventTriggers.actions }</Typography>
        <TreeView>
          { this.renderEventActionTypeSelect() }
          { this.props.selectedEventTrigger &&
            this.renderEventActionSettings()
          }
        </TreeView>
      </div>
    );
  }

  /**
   * Render click view id select
   */
  private renderClickViewIdSelect = () => {
    const { selectedEventTrigger } = this.props;
    const clickViewId = selectedEventTrigger.clickViewId;
    const clickViewIdList = this.props.layout.data.children.map((pageLayoutView, index) => {
      return <MenuItem key={ `clickViewId-${index}` } value={ pageLayoutView.id }> { pageLayoutView.id }</MenuItem>
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">{ strings.exhibition.eventTriggers.clickViewIdTitle }</Typography>
        <Select
          variant="filled"
          label={ strings.exhibition.eventTriggers.clickViewId }
          fullWidth
          value={ clickViewId || "" }
          onChange={ this.onSelectClickViewId }
        >
          { clickViewIdList }
        </Select>
      </div>
    );
  }

  /**
   * Render physical button selections
   */
  private renderPhysicalButtonSelections = () => {
    const trigger = this.props.selectedEventTrigger;
    const physicalButtons: PhysicalButtonData[] = [];

    _.forIn(PhysicalButton, value => {
      physicalButtons.push({
        name: `${strings.exhibition.eventTriggers.physicalButton} ${value}`,
        value: value
      });
    });

    const menuItems = physicalButtons.map((button, index) => {
      return <MenuItem key={ `physicalButtonDown-${index}` } value={ button.value }> { button.name }</MenuItem>
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">{ strings.exhibition.eventTriggers.physicalButtonDownTitle }</Typography>
        <Select
          variant="filled"
          label={ strings.exhibition.eventTriggers.physicalButton }
          fullWidth
          name="DOWN"
          value={ trigger.keyDown || "" }
          onChange={ this.onSelectPhysicalButton }
        >
          { menuItems }
        </Select>
        <Typography variant="h6" style={{ marginTop: theme.spacing(2) }}>{ strings.exhibition.eventTriggers.physicalButtonUpTitle }</Typography>
        <Select
          variant="filled"
          label={ strings.exhibition.eventTriggers.physicalButton }
          fullWidth
          name="UP"
          value={ trigger.keyUp || "" }
          onChange={ this.onSelectPhysicalButton }
        >
          { menuItems }
        </Select>
      </div>
    );
  }

  /**
   * Render event action type list
   */
  private renderEventActionTypeSelect = () => {
    const selectedActionType = this.getSelectedEventActionType();
    const eventActionTypeList = Object.keys(ExhibitionPageEventActionType).map((actionType, index) => {
      return <MenuItem key={ `eventActionType-${ index }` } value={ actionType.toLowerCase() }>{ actionType }</MenuItem>
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
    const actionType = this.getSelectedEventActionType();

    if (actionType === ExhibitionPageEventActionType.Hide) {
    return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
    }

    if (actionType === ExhibitionPageEventActionType.Show) {
      return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
    }

    if (actionType === ExhibitionPageEventActionType.Setuservalue) {
      return this.renderSetUserValueSettings();
    }

    if (actionType === ExhibitionPageEventActionType.Navigate) {
      return this.renderNavigateSettings();
    }

    if (actionType === ExhibitionPageEventActionType.Setsrc) {
      return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
    }

    if (actionType === ExhibitionPageEventActionType.Settext) {
      return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
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
        <Typography variant="h6">{ strings.exhibition.eventTriggers.variableName }</Typography>
        <TextField
          name="name"
          className={ classes.textResourceEditor } 
          variant="filled"
          value={ userValuePropertyName?.value || "" }
          onChange={ this.onUserValueChange }
        />

        <Typography variant="h6">{ strings.exhibition.eventTriggers.variableValue }</Typography>
        <TextField
          name="value"
          className={ classes.textResourceEditor }
          variant="filled"
          value={ userValuePropertyValue?.value || "" }
          onChange={ this.onUserValueChange }
        />
      </div>
    );
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
   * Render navigation settings
   */
  private renderNavigateSettings = () => {
    const event = this.getSelectedEventActionType();
    const selectedNavigationPageId = this.resolveSelectedPageId();

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">{ strings.exhibition.eventTriggers.selectPage }</Typography>
        <Select
          variant="filled"
          fullWidth
          name={ event }
          value={ selectedNavigationPageId || "" }
          onChange={ this.onNavigationPageChange }
        >
          { this.fetchPagesInExhibition() }
        </Select>
      </div>
    );
  }

  /**
   * Render pages in exhibition
   */
  private fetchPagesInExhibition = () => {

    const pageSelectionItems = this.props.pages.map(page => {
      return (
        <MenuItem key={ `event-trigger-navigation-${page.id}` } value={ page.id }> { page.name }</MenuItem>
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
   * Event handler for changing delay
   * @param event react change event
   */
  private onDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;
    let newValue = event.target.value;

    if (!isNumber(newValue)) {
      newValue = "0";
    }

    trigger.delay = Number(newValue);
    this.props.onSave(trigger);
  }

  /**
   * Event handler for changing user value
   * @param event react change event
   */
  private onUserValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;
    const propertyName = event.target.name;
    const propertyValue = event.target.value;
    if (!trigger.events || !trigger.events.length) {
      return;
    }

    if (!trigger.events[0].properties || !trigger.events[0].properties.length) {
      return;
    }

    const propertyIndex = trigger.events[0].properties.findIndex(property => property.name === propertyName);
    if (propertyIndex === -1) {
      trigger.events[0].properties.push({
        name: propertyName,
        value: propertyValue,
        type: ExhibitionPageEventPropertyType.String
      });
    } else {
      trigger.events[0].properties[propertyIndex].value = propertyValue;
    }
    
    this.props.onSave(trigger);
  }

  /**
   * Event handler for navigation page change
   * @param event react change event
   */
  private onNavigationPageChange = (event: React.ChangeEvent<{ value: unknown; name?: unknown }>) => {
    const newValue = event.target.value as string;
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;
    if (this.getSelectedEventActionType() !== ExhibitionPageEventActionType.Navigate) {
      return;
    }

    trigger.events![0].properties[0].value = newValue;
    this.props.onSave(trigger);
  }

  /**
   * On select click view id action handler
   * @param event react change event
   */
  private onSelectClickViewId = (event: React.ChangeEvent<{ value: unknown }>) => {
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;
    const value = event.target.value as string;
    trigger.clickViewId = value;

    this.props.onSave(trigger);
  }

  /**
   * Physical button select event hadler
   *
   * @param event React changeEvent
   */
  private onSelectPhysicalButton = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    const name = event.target.name;
    const value = event.target.value as PhysicalButton;
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;
    switch (name) {
      case "DOWN":
        trigger.keyDown = value;
      break;
      case "UP":
        trigger.keyUp = value;
      break;
      default:
      break;
    }

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
    const trigger = { ...this.props.selectedEventTrigger } as ExhibitionPageEventTrigger;
    if (trigger.events?.length !== 0 && trigger.events![0].action === actionType) {
      return;
    }

    let newAction: ExhibitionPageEvent;
    if (actionType !== ExhibitionPageEventActionType.Setuservalue) {
      newAction = this.createEvent(this.getActionName(actionType), actionType, ExhibitionPageEventPropertyType.String);
    } else {
      newAction = this.createSetUserEvent("testVariable", ExhibitionPageEventPropertyType.String, "testValue", ExhibitionPageEventPropertyType.String);
    }

    trigger.events = [newAction];
    this.props.onSave(trigger);
  }

  /**
   * Get correct action name
   * @param actionType ExhibitionPageEventActionType
   * TODO: Make this a bit more nice
   */
  private getActionName = (actionType: ExhibitionPageEventActionType): string => {
    switch (actionType) {
      case ExhibitionPageEventActionType.Hide: return "";
      case ExhibitionPageEventActionType.Show: return "";
      case ExhibitionPageEventActionType.Navigate: return "pageId";
      case ExhibitionPageEventActionType.Setsrc: return "";
      case ExhibitionPageEventActionType.Settext: return "";
      default: return "";
    }
  }

  /**
   * Create event based on the given values
   * @param nameValue name value
   * @param actionType given action type
   * @param propertyType exhibition page event property type
   */
  private createEvent = (
    nameValue: string,
    actionType: ExhibitionPageEventActionType,
    propertyType: ExhibitionPageEventPropertyType
  ): ExhibitionPageEvent => {
    
    const newEvent: ExhibitionPageEvent = {
      action: actionType,
      properties: [
        {
          name: nameValue,
          value: "",
          type: propertyType
        }
      ]
    };

    return newEvent;
  }

  /**
   * Create setUserEvent event with given params
   * @param variableName variable name
   * @param variableNameType type of the variable name
   * @param variableValue value of the variable
   * @param variableValueType type of the given variable
   */
  private createSetUserEvent = (
    variableName: string,
    variableNameType: ExhibitionPageEventPropertyType,
    variableValue: string,
    variableValueType: ExhibitionPageEventPropertyType
  ): ExhibitionPageEvent => {
    
    const newEvent: ExhibitionPageEvent = {
      action: ExhibitionPageEventActionType.Setuservalue,
      properties: [
        {
          name: "name",
          value: variableName,
          type: variableNameType
        },
        {
          name: "value",
          value: variableValue,
          type: variableValueType
        }
      ]
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
