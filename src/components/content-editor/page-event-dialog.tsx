import {
  ExhibitionPage,
  ExhibitionPageEvent,
  ExhibitionPageEventActionType,
  ExhibitionPageEventProperty,
  ExhibitionPageEventPropertyType,
  PageLayoutView,
  PageLayoutWidgetType,
  VisitorVariable,
  VisitorVariableType
} from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";
import GenericDialog from "../generic/generic-dialog";
import { Box, MenuItem, Select, TextField, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import produce from "immer";
import * as React from "react";

/**
 * Interface describing component props
 */
interface Props extends WithStyles<typeof styles> {
  selectedEvent?: ExhibitionPageEvent;
  visitorVariables: VisitorVariable[];
  dialogOpen: boolean;
  creatingNew: boolean;
  pages: ExhibitionPage[];
  view?: PageLayoutView;
  availableLanguages: string[];
  onCreate: (pageEvent: ExhibitionPageEvent) => void;
  onUpdate: (pageEvent: ExhibitionPageEvent) => void;
  onCloseOrCancel: () => void;
}

/**
 * Interface describing component state
 */
interface State {
  pageEvent?: ExhibitionPageEvent;
}

/**
 * Component for page event dialog
 */
class PageEventDialog extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    this.setState({ pageEvent: this.props.selectedEvent });
  };

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous life cycle props
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (JSON.stringify(prevProps.selectedEvent) !== JSON.stringify(this.props.selectedEvent)) {
      this.setState({ pageEvent: this.props.selectedEvent });
    }
  };

  /**
   * Component render
   */
  public render = () => {
    return this.renderPageEventDialog();
  };

  /**
   * Renders page event dialog
   */
  private renderPageEventDialog = () => {
    const { dialogOpen, creatingNew, onCloseOrCancel } = this.props;

    const saveButtonAction = creatingNew
      ? this.createPageEventHandler
      : this.updatePageEventHandler;

    return (
      <GenericDialog
        fullWidth
        title={strings.contentEditor.editor.eventTriggers.options}
        open={dialogOpen}
        cancelButtonText={strings.generic.cancel}
        positiveButtonText={strings.generic.save}
        onCancel={onCloseOrCancel}
        onConfirm={saveButtonAction}
        onClose={onCloseOrCancel}
        error={false}
      >
        <Typography>{strings.contentEditor.editor.eventTriggers.optionsInstructions}</Typography>
        {this.renderEventActionTypeSelect()}
        {this.renderEventActionSettings()}
      </GenericDialog>
    );
  };

  /**
   * Renders event action type select
   */
  private renderEventActionTypeSelect = () => {
    const selectedActionType = this.state.pageEvent?.action;

    return (
      <Box mt={2}>
        <TextField
          select
          fullWidth
          value={selectedActionType || ""}
          onChange={this.onSelectEventActionType}
        >
          <MenuItem value={ExhibitionPageEventActionType.Navigate}>
            {strings.contentEditor.editor.eventTriggers.actionTypes.navigate}
          </MenuItem>
        </TextField>
      </Box>
    );
  };

  /**
   * Render event action settings based on the selected event action type
   */
  private renderEventActionSettings = () => {
    const { pageEvent } = this.state;

    if (!pageEvent) {
      return null;
    }

    switch (pageEvent.action) {
      case ExhibitionPageEventActionType.Setuservalue:
        return this.renderSetUserValueSettings();
      case ExhibitionPageEventActionType.Navigate:
        return this.renderNavigateSettings();
      case ExhibitionPageEventActionType.Triggerdevicegroupevent:
        return this.renderDeviceGroupEventSettings();
      case ExhibitionPageEventActionType.ExecuteWebScript:
        return this.renderExecuteWebScriptSettings();
      case ExhibitionPageEventActionType.StartVisitorSession:
        return this.renderStartVisitorSessionSettings();
      /**
       * TODO: Needs implementation
       */
      case ExhibitionPageEventActionType.Hide:
      case ExhibitionPageEventActionType.Show:
      case ExhibitionPageEventActionType.Setsrc:
      case ExhibitionPageEventActionType.Settext:
        return <h5>{strings.comingSoon}</h5>;
      default:
        return <></>;
    }
  };

  /**
   * Render set user value settings
   */
  private renderSetUserValueSettings = () => {
    const { classes, visitorVariables } = this.props;

    const event = this.state.pageEvent;
    const userValuePropertyName = event
      ? event.properties.find((property) => property.name === "name")
      : undefined;
    const userValuePropertyValue = event
      ? event.properties.find((property) => property.name === "value")
      : undefined;
    const variableName = userValuePropertyName?.value || "";
    const variableValue = userValuePropertyValue?.value || "";

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          {strings.contentEditor.editor.eventTriggers.variableName}
        </Typography>

        <Select
          fullWidth={false}
          name="name"
          value={variableName}
          onChange={this.onEventTriggerEventPropertyChange}
          className={classes.selectResourceEditor}
        >
          {visitorVariables.map((visitorVariable) => {
            return <MenuItem value={visitorVariable.name}>{visitorVariable.name}</MenuItem>;
          })}
        </Select>

        <Typography variant="h6">
          {strings.contentEditor.editor.eventTriggers.variableValue}
        </Typography>

        {this.renderSetUserValueSettingValueInput(variableName, variableValue)}
      </div>
    );
  };

  /**
   * Renders input for set user variable trigger
   *
   * @param variableName variable name
   * @param variableValue variable value
   */
  private renderSetUserValueSettingValueInput = (variableName: string, variableValue: string) => {
    const { classes, visitorVariables } = this.props;

    const visitorVariable = visitorVariables.find((item) => item.name === variableName);
    const visitorVariableType = visitorVariable?.type || VisitorVariableType.Text;

    if (visitorVariableType === VisitorVariableType.Enumerated) {
      const values = visitorVariable?._enum || [];
      return (
        <Select
          fullWidth={false}
          name="value"
          value={variableValue}
          onChange={this.onEventTriggerEventPropertyChange}
          className={classes.selectResourceEditor}
        >
          {values.map((value) => {
            return <MenuItem value={value}>{value}</MenuItem>;
          })}
        </Select>
      );
    }

    if (visitorVariableType === VisitorVariableType.Boolean) {
      return (
        <Select
          fullWidth={false}
          name="value"
          value={variableValue}
          onChange={this.onEventTriggerEventPropertyChange}
          className={classes.selectResourceEditor}
        >
          <MenuItem value={"true"}>
            {strings.contentEditor.editor.eventTriggers.variableBooleanTrue}
          </MenuItem>
          <MenuItem value={"false"}>
            {strings.contentEditor.editor.eventTriggers.variableBooleanFalse}
          </MenuItem>
        </Select>
      );
    }

    return (
      <TextField
        fullWidth={false}
        name="value"
        type={visitorVariableType === VisitorVariableType.Number ? "number" : "text"}
        className={classes.textResourceEditor}
        value={variableValue}
        onChange={this.onEventTriggerEventPropertyChange}
      />
    );
  };

  /**
   * Render navigation settings
   */
  private renderNavigateSettings = () => {
    const event = this.state.pageEvent;

    if (!event) {
      return null;
    }

    const property = event.properties.find((prop) => prop.name === "pageId");
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          {strings.contentEditor.editor.eventTriggers.selectPage}
        </Typography>
        <TextField
          fullWidth
          select
          name={"pageId"}
          value={property ? property.value : ""}
          onChange={this.onEventTriggerEventPropertyChange}
        >
          {this.renderPagesInExhibition()}
        </TextField>
      </div>
    );
  };

  /**
   * Render pages in exhibition
   */
  private renderPagesInExhibition = () => {
    return [...this.props.pages]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((page) => (
        <MenuItem key={`event-trigger-navigation-${page.id}`} value={page.id}>
          {page.name}
        </MenuItem>
      ));
  };

  /**
   * Render device group event settings
   */
  private renderDeviceGroupEventSettings = () => {
    const { classes } = this.props;

    const event = this.state.pageEvent;

    if (!event) {
      return null;
    }

    const deviceGroupEventNameProperty = event
      ? event.properties.find((property) => property.name === "name")
      : undefined;

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          {strings.contentEditor.editor.eventTriggers.deviceGroupEvent}
        </Typography>
        <TextField
          fullWidth={false}
          name="name"
          className={classes.textResourceEditor}
          value={deviceGroupEventNameProperty?.value || ""}
          onChange={this.onEventTriggerEventPropertyChange}
        />
      </div>
    );
  };

  /**
   * Renders execute web script settings
   */
  private renderExecuteWebScriptSettings = () => {
    const { classes, view } = this.props;

    const event = this.state.pageEvent;
    if (!event) {
      return null;
    }

    const webViewOptions = this.getWebViewsInLayout(view);
    if (webViewOptions.length < 1) {
      return (
        <div style={{ marginTop: theme.spacing(2) }}>
          <Typography>{strings.contentEditor.editor.eventTriggers.noWebViews}</Typography>
        </div>
      );
    }

    const webViewProperty = event.properties.find((prop) => prop.name === "webViewId");
    const scriptProperty = event.properties.find((prop) => prop.name === "script");

    return (
      <>
        <div style={{ marginTop: theme.spacing(2) }}>
          <Typography variant="h6">
            {strings.contentEditor.editor.eventTriggers.selectPage}
          </Typography>
          <Select
            name={"webViewId"}
            value={webViewProperty?.value ?? ""}
            onChange={this.onEventTriggerEventPropertyChange}
          >
            {this.renderWebViewOptions(webViewOptions)}
          </Select>
        </div>
        <div style={{ marginTop: theme.spacing(2) }}>
          <TextField
            fullWidth={false}
            name="script"
            className={classes.textResourceEditor}
            value={scriptProperty?.value ?? ""}
            onChange={this.onEventTriggerEventPropertyChange}
          />
        </div>
      </>
    );
  };

  /**
   * Renders web view options
   *
   * @param webViewOptions list of page layout views
   * @returns options as JSX Elements or undefined if no options found
   */
  private renderWebViewOptions = (webViewOptions: PageLayoutView[]): JSX.Element[] | undefined => {
    return webViewOptions.map((view) => (
      <MenuItem key={view.id} value={view.id}>
        {view.name ?? view.id}
      </MenuItem>
    ));
  };

  /**
   * Renders start visitor session action settings
   */
  private renderStartVisitorSessionSettings = () => {
    const event = this.state.pageEvent;
    if (!event) {
      return null;
    }

    const language = event.properties.find((prop) => prop.name === "language")?.value;

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">
          {strings.contentEditor.editor.eventTriggers.selectLanguage}
        </Typography>
        <Select
          name={"language"}
          value={language}
          onChange={this.onEventTriggerEventPropertyChange}
        >
          {this.renderLanguageOptions()}
        </Select>
      </div>
    );
  };

  /**
   * Renders language options
   *
   * @returns options as JSX Elements or undefined if no options found
   */
  private renderLanguageOptions = (): JSX.Element[] | undefined => {
    const { availableLanguages } = this.props;

    return availableLanguages.map((language) => (
      <MenuItem key={language} value={language}>
        {language}
      </MenuItem>
    ));
  };

  /**
   * Event handler for create page event
   */
  private createPageEventHandler = () => {
    const { onCreate } = this.props;
    const { pageEvent } = this.state;

    if (!pageEvent) {
      return;
    }

    onCreate(pageEvent);
  };

  /**
   * Event handler for update page event
   */
  private updatePageEventHandler = () => {
    const { onUpdate } = this.props;
    const { pageEvent } = this.state;

    if (!pageEvent) {
      return;
    }

    onUpdate(pageEvent);
  };

  /**
   * On select event action handler
   *
   * @param event react change event
   */
  private onSelectEventActionType = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ pageEvent: this.createPageEvent(value as ExhibitionPageEventActionType) });

  /**
   * Create event based on the given values
   *
   * @param actionType given action type
   * @returns exhibition page event
   */
  private createPageEvent = (actionType: ExhibitionPageEventActionType): ExhibitionPageEvent => {
    const eventProperties: ExhibitionPageEventProperty[] =
      this.getEventPropertiesByType(actionType);
    const pageEvent: ExhibitionPageEvent = {
      action: actionType,
      properties: eventProperties
    };

    return pageEvent;
  };

  /**
   * Get event properties based on action type
   *
   * @param actionType ExhibitionPageEventActionType
   * @returns list of exhibition page event properties
   */
  private getEventPropertiesByType = (
    actionType: ExhibitionPageEventActionType
  ): ExhibitionPageEventProperty[] => {
    switch (actionType) {
      case ExhibitionPageEventActionType.Navigate:
        return [this.getStringProperty("pageId")];
      case ExhibitionPageEventActionType.Setuservalue:
        return [this.getStringProperty("name"), this.getStringProperty("value")];
      case ExhibitionPageEventActionType.Triggerdevicegroupevent:
        return [this.getStringProperty("name")];
      case ExhibitionPageEventActionType.ExecuteWebScript:
        return [this.getStringProperty("webViewId"), this.getStringProperty("script")];
      default:
        return [];
    }
  };

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
  };

  /**
   * Get web views in page layout
   *
   * @param view page layout view
   * @returns web views as page layout views
   */
  private getWebViewsInLayout = (view?: PageLayoutView): PageLayoutView[] => {
    const webViews: PageLayoutView[] = [];
    if (view) {
      if (view.widget === PageLayoutWidgetType.WebView) {
        webViews.push(view);
      }

      if (view.children) {
        view.children.forEach((childView) => {
          webViews.push(...this.getWebViewsInLayout(childView));
        });
      }
    }

    return webViews;
  };

  /**
   * Event handler for event trigger event property change
   *
   * @param event react change event
   */
  private onEventTriggerEventPropertyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { pageEvent } = this.state;

    const propertyName = event.target.name;
    const propertyValue = event.target.value as string;

    if (propertyName === undefined || !pageEvent) {
      return;
    }

    const tempEvent = produce(pageEvent, (draft) => {
      const propertyIndex = draft.properties.findIndex(
        (property) => property.name === propertyName
      );
      if (propertyIndex === -1) {
        draft.properties.push({
          name: propertyName,
          value: propertyValue,
          type: ExhibitionPageEventPropertyType.String
        });
      } else {
        draft.properties[propertyIndex].value = propertyValue;
      }
    });

    this.setState({
      pageEvent: tempEvent
    });
  };
}

export default withStyles(styles)(PageEventDialog);
