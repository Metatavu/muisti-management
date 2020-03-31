import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/exhibition-view-v3";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, Divider, MenuItem, Select, TextField} from "@material-ui/core";
import { TreeView } from "@material-ui/lab";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, ExhibitionPageEventTrigger, ExhibitionPageEventActionType, ExhibitionPageEventPropertyType } from "../../generated/client";
import { AccessToken } from '../../types';
import strings from "../../localization/strings";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/javascript/javascript"
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/lint/lint";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
    history: History;
    accessToken: AccessToken;
    selectedEventTrigger: ExhibitionPageEventTrigger;
    pages: ExhibitionPage[];
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
    };
  }

  /**
   * Component did mount handler
   */
  public componentDidMount = async () => {
    
    const selectedTrigger = this.props.selectedEventTrigger;

    if (selectedTrigger !== undefined) {
      const events = selectedTrigger.events;

      if (events !== undefined && events.length > 0) {
        this.setState({
          selectedEventActionType: events[0].action
        });
      }
    } 
  }

  /**
   * Component did update handler
   */
  public componentDidUpdate = async (prevProps: Props) => {
    if (prevProps.selectedEventTrigger !== this.props.selectedEventTrigger) {
      this.setState({
        selectedNavigationPage: undefined
      });
    }
  }

  /**
   * Render
   */
  public render() {

    const classes = this.props.classes;

    return<>
      <TextField
        type="viewId"
        className={ classes.textResourceEditor } 
        label={ strings.exhibition.eventTriggers.viewId }
        variant="outlined"
        value={ this.props.selectedEventTrigger?.clickViewId }
      />

      <TextField
        type="delay"
        className={ classes.textResourceEditor } 
        label={ strings.exhibition.eventTriggers.delay }
        variant="outlined"
        value={ this.props.selectedEventTrigger?.delay }
        onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onDelayChange(event) }
      />
      <h4> { strings.exhibition.eventTriggers.actions }</h4>
      <TreeView>
        { this.renderEventTriggerList() }

        <Divider variant="inset" component="li" />
        { this.props.selectedEventTrigger && 
          this.renderEventActionSettings()
        }
      </TreeView>
    </>
  }

  /**
   * Render event trigger list
   */
  private renderEventTriggerList = () => {
    const selectedAction = this.state.selectedEventActionType;

    const eventList = Object.keys(ExhibitionPageEventActionType).map((event, index) => {
      return <MenuItem key={ `eventAction-${index}` } value={ event.toLowerCase() }> { event }</MenuItem>
    });

    return <>
      <Select fullWidth value={ selectedAction ? selectedAction : "hide" }
        onChange={ (event: React.ChangeEvent<{ value: unknown }>) => this.onSelectEventAction(event) }
      >
        { eventList }
      </Select>
    </>
  }

  /**
   * Render event action settings based on the selected event action type
   */
  private renderEventActionSettings = () => {
    const event = this.state.selectedEventActionType?.toLowerCase();

    if (event == ExhibitionPageEventActionType.Hide) {
    return <h5>{ strings.comingSoon }</h5>;
      /**
       * TODO: Needs implementation
       */
    }

    if (event == ExhibitionPageEventActionType.Show) {
      return<h5>{ strings.comingSoon }</h5>
      /**
       * TODO: Needs implementation
       */
    }

    if (event == ExhibitionPageEventActionType.Setuservalue) {
      return this.renderSetUserValueSettings()
    }

    if (event == ExhibitionPageEventActionType.Navigate) {
      return this.renderNavigateSettings() 
    }

    if (event == ExhibitionPageEventActionType.Setsrc) {
      return<><h5>{ strings.comingSoon }</h5></>
      /**
       * TODO: Needs implementation
       */
    }

    if (event == ExhibitionPageEventActionType.Settext) {
      return<h5>{ strings.comingSoon }</h5>
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

    return<>
      <h4>{ strings.exhibition.eventTriggers.variableName }</h4>
      <TextField
        type="name"
        className={ classes.textResourceEditor } 
        label={ strings.exhibition.eventTriggers.variableName }
        variant="outlined"
        value={ (this.doesEventTypeMatch() && selectedEventTrigger.events![0].properties[0].value) ? selectedEventTrigger.events![0].properties[0].value : ""  }
        onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onUserVariableChange(event) }
      />
      
      <h4>{ strings.exhibition.eventTriggers.variableValue }</h4>
      <TextField
        type="name"
        className={ classes.textResourceEditor } 
        label={ strings.exhibition.eventTriggers.variableValue }
        variant="outlined"
        value={ (this.doesEventTypeMatch() && selectedEventTrigger.events![0].properties[1].value) ? selectedEventTrigger.events![0].properties[1].value : "" }
        onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onUserVariableValueChange(event) }
      />
    </>
  }

  private doesEventTypeMatch = (): boolean => {
    const { selectedEventTrigger } = this.props;
    const selectedEventActionType = this.state.selectedEventActionType?.toLowerCase();
    return (selectedEventTrigger.events?.length !== 0 && selectedEventTrigger.events![0].action === selectedEventActionType)
  }

  /**
   * Render navigation settings
   */
  private renderNavigateSettings = () => {
    const event = this.state.selectedEventActionType?.toLowerCase();

    return<>
      <h4>{ strings.exhibition.eventTriggers.selectPage }</h4>
      <Select fullWidth
        name={ event }
        value={ this.state.selectedNavigationPage ? this.state.selectedNavigationPage.id: "" }
        onChange={ (e: React.ChangeEvent<{ value: unknown, name?: unknown }>) => this.onNavigationPageChange(e) }
      >
        { this.fetchPagesInExhibition() }
      </Select>
    </>
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
   * Event handler for changing delay
   */
  private onDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    const parsedCode = this.props.onParseJson()
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
   */
  private onUserVariableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsedCode = this.props.onParseJson()
    const trigger = this.props.selectedEventTrigger;
    let newValue = event.target.value;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1) {
      parsedCode.eventTriggers[index].events![0].properties[0].value = newValue;
      this.props.onSaveJson(parsedCode.eventTriggers[index], parsedCode);
    }
  }

  /**
   * Event handler for changing delay
   */
  private onUserVariableValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsedCode = this.props.onParseJson()
    const trigger = this.props.selectedEventTrigger;
    let newValue = event.target.value;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1) {
      parsedCode.eventTriggers[index].events![0].properties[1].value = newValue;
      this.props.onSaveJson(parsedCode.eventTriggers[index], parsedCode);
    }
  }

  /**
   * Event handler for navigation page change
   */
  private onNavigationPageChange = (event: React.ChangeEvent<{ value: unknown, name?: unknown }>) => {
    const parsedCode = this.props.onParseJson()
    const newValue = event.target.value as string
    const action = event.target.name as string
    const trigger = this.props.selectedEventTrigger;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1) {
      const eventIndex = parsedCode.eventTriggers[index].events!.findIndex(e => action === e.action);
      
      if (eventIndex > -1) {
        parsedCode.eventTriggers[index].events![eventIndex].properties[0].value= newValue
        const newSelectedPage = this.props.pages.find(page => page.id === newValue);
        this.setState({
          selectedNavigationPage: newSelectedPage
        })
        this.props.onSaveJson(trigger, parsedCode)
      }
    }
  }

  /**
   * On select event action handler
   */
  private onSelectEventAction = (event: React.ChangeEvent<{ value: unknown }>)=> {
    const value = event.target.value as ExhibitionPageEventActionType

    /**
     * TODO: If we assume that each event trigger contains only one event, do we want to clear the existing values on select? 
     */
    this.clearEventActionFromJson(value)

    this.setState({
      selectedEventActionType: value,
      selectedNavigationPage: undefined
    });
  }

  /**
   * Clear event action from json handler
   */
  private clearEventActionFromJson = (actionType: ExhibitionPageEventActionType) => {

    const parsedCode = this.props.onParseJson()
    const trigger = this.props.selectedEventTrigger;

    parsedCode.eventTriggers = parsedCode.eventTriggers || [];
    const index = parsedCode.eventTriggers.findIndex(eventTrigger => trigger.clickViewId === eventTrigger.clickViewId);

    if (index > -1 && parsedCode.eventTriggers[index].events?.length !== 0 && parsedCode.eventTriggers[index].events![0].action === actionType) {
      return;
    }

    var newAction;
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
   */
  private createAction = (nameValue: string, actionType: ExhibitionPageEventActionType, propertyType : ExhibitionPageEventPropertyType) => { 

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
   */
  private createSetUserAction = (variableName: string, variableNameType: ExhibitionPageEventPropertyType, variableValue: string, variableValueType :ExhibitionPageEventPropertyType) => { 

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
    accessToken: state.auth.accessToken as AccessToken,
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
