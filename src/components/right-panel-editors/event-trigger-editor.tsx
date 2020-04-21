import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/exhibition-view-v3";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, MenuItem, Select, TextField, Typography } from "@material-ui/core";
import { TreeView } from "@material-ui/lab";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, ExhibitionPageEventTrigger, ExhibitionPageEventActionType, ExhibitionPageEventPropertyType, PageLayout } from "../../generated/client";
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
    jsonCode: string;
    onParseJson: (errorHandler?: ((message: string, e?: SyntaxError | undefined) => void) | undefined) => Partial<ExhibitionPage>;
    onSaveJson: ((selectedEventTrigger?: ExhibitionPageEventTrigger, parsedCode?: Partial<ExhibitionPage>) => void);
  }

  /**
   * Component state
   */
  interface State {
    error?: Error;
    loading: boolean;
    selectedClickViewId: string;
    selectedPhysicalButtonDown?: PhysicalButton;
    selectedPhysicalButtonUp?: PhysicalButton;
    selectedEventActionType?: ExhibitionPageEventActionType;
    selectedNavigationPage?: ExhibitionPage;
  }

export class EventTriggerEditor extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      selectedClickViewId: props.selectedEventTrigger.clickViewId || "",
      selectedPhysicalButtonDown: props.selectedEventTrigger.keyDown as PhysicalButton,
      selectedPhysicalButtonUp: props.selectedEventTrigger.keyUp as PhysicalButton
    };
  }

  /**
   * Component did mount handler
   */
  public componentDidMount = () => {

    const selectedTrigger = this.props.selectedEventTrigger;

    if (selectedTrigger !== undefined) {
      const events = selectedTrigger.events;

      if (events !== undefined && events.length > 0) {
        this.setState({
          selectedEventActionType: events[0].action,
          selectedNavigationPage: this.findPageById(this.resolveSelectedPageId())
        });

      }
    }
  }

  /**
   * Component did update handler
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (prevProps.selectedEventTrigger !== this.props.selectedEventTrigger) {
      this.setState({
        selectedNavigationPage: this.findPageById(this.resolveSelectedPageId())
      });
    }
  }

  /**
   * Render
   */
  public render() {

    const classes = this.props.classes;

    return(
      <div style={{ marginTop: theme.spacing(2) }}>
        { this.renderClickViewIdSelect() }
        { this.renderPhysicalButtonSelections() }
        <Typography variant="h6" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}>{ strings.exhibition.eventTriggers.delayTitle }</Typography>
        <TextField
          type="delay"
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.eventTriggers.delay }
          variant="filled"
          value={ this.props.selectedEventTrigger?.delay }
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
    const { selectedClickViewId } = this.state;
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
          value={ selectedClickViewId || "" }
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
    const { selectedPhysicalButtonDown, selectedPhysicalButtonUp } = this.state;
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
          value={ selectedPhysicalButtonDown || "" }
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
          value={ selectedPhysicalButtonUp || "" }
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
    const selectedActionType = this.state.selectedEventActionType;

    const eventActionTypeList = Object.keys(ExhibitionPageEventActionType).map((actionType, index) => {
      return <MenuItem key={ `eventActionType-${ index }` } value={ actionType.toLowerCase() }>{ actionType }</MenuItem>
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Select
          variant="filled"
          fullWidth
          value={ selectedActionType ? selectedActionType : "hide" }
          onChange={ (event: React.ChangeEvent<{ value: unknown }>) => this.onSelectEventActionType(event) }
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
    const event = this.state.selectedEventActionType?.toLowerCase();

    if (event === ExhibitionPageEventActionType.Hide) {
    return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
    }

    if (event === ExhibitionPageEventActionType.Show) {
      return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
    }

    if (event === ExhibitionPageEventActionType.Setuservalue) {
      return this.renderSetUserValueSettings();
    }

    if (event === ExhibitionPageEventActionType.Navigate) {
      return this.renderNavigateSettings();
    }

    if (event === ExhibitionPageEventActionType.Setsrc) {
      return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
    }

    if (event === ExhibitionPageEventActionType.Settext) {
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

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">{ strings.exhibition.eventTriggers.variableName }</Typography>
        <TextField
          type="name"
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.eventTriggers.variableName }
          variant="filled"
          value={ (this.doesEventTypeMatch() && selectedEventTrigger.events![0].properties[0].value) ? selectedEventTrigger.events![0].properties[0].value : ""  }
          onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onUserVariableChange(event) }
        />

        <Typography variant="h6">{ strings.exhibition.eventTriggers.variableValue }</Typography>
        <TextField
          type="name"
          className={ classes.textResourceEditor } 
          label={ strings.exhibition.eventTriggers.variableValue }
          variant="filled"
          value={ (this.doesEventTypeMatch() && selectedEventTrigger.events![0].properties[1].value) ? selectedEventTrigger.events![0].properties[1].value : "" }
          onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onUserVariableValueChange(event) }
        />
      </div>
    );
  }

  /**
   * Check if selected event action type matches the selected event trigger from parent
   */
  private doesEventTypeMatch = (): boolean => {
    const { selectedEventTrigger } = this.props;
    const selectedEventActionType = this.state.selectedEventActionType?.toLowerCase();
    return (selectedEventTrigger.events?.length !== 0 && selectedEventTrigger.events![0].action === selectedEventActionType);
  }

  /**
   * Render navigation settings
   */
  private renderNavigateSettings = () => {
    const event = this.state.selectedEventActionType?.toLowerCase();

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">{ strings.exhibition.eventTriggers.selectPage }</Typography>
        <Select
          variant="filled"
          fullWidth
          name={ event }
          value={ this.state.selectedNavigationPage ? this.state.selectedNavigationPage.id: "" }
          onChange={ (e: React.ChangeEvent<{ value: unknown; name?: unknown }>) => this.onNavigationPageChange(e) }
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
   * Finds a page by it's id
   * 
   * @returns page by page id or undefined if not found
   */
  private findPageById = (id?: string | null): ExhibitionPage | undefined => {
    return id ? this.props.pages.find(page => page.id === id) : undefined;
  }

  /**
   * Resolves selected navigate event page id 
   * 
   * @return selected navigate event page id or null if not found
   */
  private resolveSelectedPageId = (): string | null => {
    const navigateEvent = (this.props.selectedEventTrigger.events || []).find(event => event.action === ExhibitionPageEventActionType.Navigate);
    if (navigateEvent) {
      const pageIdProperty =  navigateEvent.properties.find(property => property.name === "pageId");
      return pageIdProperty?.value || null;
    }

    return null;
  }

  /**
   * Event handler for changing delay
   * @param event react change event
   */
  private onDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const parsedCode = this.props.onParseJson();
    const trigger = this.props.selectedEventTrigger;
    let newValue = event.target.value;

    if (!isNumber(newValue)) {
      newValue = "0";
    }

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);
    if (index > -1) {
      parsedCode.eventTriggers[index].delay = Number(newValue);
      this.props.onSaveJson(parsedCode.eventTriggers[index], parsedCode);
    }
  }

  /**
   * Event handler for changing delay
   * @param event react change event
   */
  private onUserVariableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsedCode = this.props.onParseJson();
    const trigger = this.props.selectedEventTrigger;
    const newValue = event.target.value;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1) {
      parsedCode.eventTriggers[index].events![0].properties[0].value = newValue;
      this.props.onSaveJson(parsedCode.eventTriggers[index], parsedCode);
    }
  }

  /**
   * Event handler for changing delay
   * @param event react change event
   */
  private onUserVariableValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsedCode = this.props.onParseJson();
    const trigger = this.props.selectedEventTrigger;
    const newValue = event.target.value;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1) {
      parsedCode.eventTriggers[index].events![0].properties[1].value = newValue;
      this.props.onSaveJson(parsedCode.eventTriggers[index], parsedCode);
    }
  }

  /**
   * Event handler for navigation page change
   * @param event react change event
   */
  private onNavigationPageChange = (event: React.ChangeEvent<{ value: unknown; name?: unknown }>) => {
    const parsedCode = this.props.onParseJson();
    const newValue = event.target.value as string;
    const action = event.target.name as string;
    const trigger = this.props.selectedEventTrigger;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1) {
      const eventIndex = parsedCode.eventTriggers[index].events!.findIndex(e => action === e.action);

      if (eventIndex > -1) {
        parsedCode.eventTriggers[index].events![eventIndex].properties[0].value= newValue
        const newSelectedPage = this.findPageById(newValue);
        this.setState({
          selectedNavigationPage: newSelectedPage
        });

        this.props.onSaveJson(trigger, parsedCode);
      }
    }
  }

  /**
   * On select click view id action handler
   * @param event react change event
   */
  private onSelectClickViewId = (event: React.ChangeEvent<{ value: unknown }>) => {
    const parsedCode = this.props.onParseJson();
    const trigger = this.props.selectedEventTrigger;
    const value = event.target.value as string;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1) {
      parsedCode.eventTriggers[index].clickViewId = value;
      this.props.onSaveJson(parsedCode.eventTriggers[index], parsedCode);
    }

    this.setState({ selectedClickViewId: event.target.value as string });
  }

  /**
   * Physical button select event hadler
   *
   * @param event React changeEvent
   */
  private onSelectPhysicalButton = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    const name = event.target.name;
    const value = event.target.value as PhysicalButton;
    switch (name) {
      case "DOWN":
        this.setState({ selectedPhysicalButtonDown: value });
      break;
      case "UP":
        this.setState({ selectedPhysicalButtonUp: value });
      break;
      default:
      break;
    }
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
    this.clearEventActionFromJson(value);

    this.setState({
      selectedEventActionType: value,
      selectedNavigationPage: undefined
    });
  }

  /**
   * Clear event action from json handler
   * @param event react change event
   */
  private clearEventActionFromJson = (actionType: ExhibitionPageEventActionType) => {

    const parsedCode = this.props.onParseJson();
    const trigger = this.props.selectedEventTrigger;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1 && parsedCode.eventTriggers[index].events?.length !== 0 && parsedCode.eventTriggers[index].events![0].action === actionType) {
      return;
    }

    let newAction;
    if (actionType !== ExhibitionPageEventActionType.Setuservalue) {
        newAction = this.createAction(this.getActionName(actionType), actionType, ExhibitionPageEventPropertyType.String);
    } else {
      newAction = this.createSetUserAction("testVariable", ExhibitionPageEventPropertyType.String, "testValue", ExhibitionPageEventPropertyType.String);
    }

    if (index > -1) {
        parsedCode.eventTriggers[index].events! = [newAction];
        this.props.onSaveJson(trigger, parsedCode);
    }
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
   * Create action based on the given values
   * @param nameValue name value
   * @param actionType given action type
   * @param propertyType exhibition page event property type
   */
  private createAction = (nameValue: string, actionType: ExhibitionPageEventActionType, propertyType: ExhibitionPageEventPropertyType) => {

    const newAction = {
      action: actionType,
      properties: [
        {
          name: nameValue,
          value: "",
          type: propertyType
        }
      ]
    };

    return newAction;
  }

  /**
   * Create setUserAction event with given params
   * @param variableName variable name
   * @param variableNameType type of the variable name
   * @param variableValue value of the variable
   * @param variableValueType type of the given variable
   */
  private createSetUserAction = (
    variableName: string,
    variableNameType: ExhibitionPageEventPropertyType,
    variableValue: string,
    variableValueType: ExhibitionPageEventPropertyType) => {

    const newAction = {
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
    return newAction;
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
