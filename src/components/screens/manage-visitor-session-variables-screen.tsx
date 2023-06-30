import { setDeviceModels } from "../../actions/devices";
import Api from "../../api/api";
import { Config } from "../../constants/configuration";
import {
  DeviceModel,
  Visitor,
  VisitorSession,
  VisitorSessionVariable,
  VisitorVariable,
  VisitorVariableType
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/screens/manage-visitor-session-variables-screen";
import { AccessToken, ActionButton, ConfirmDialogData } from "../../types";
import ConfirmDialog from "../generic/confirm-dialog";
import { MqttListener } from "../generic/mqtt-listener";
import TagListener from "../generic/tag-listener";
import WithDebounce from "../generic/with-debounce";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import {
  Checkbox,
  CircularProgress,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import produce from "immer";
import { KeycloakInstance } from "keycloak-js";
import moment from "moment";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

const config = Config.getConfig();

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  error?: Error;
  foundSessions?: VisitorSession[];
  foundVisitors?: Visitor[];
  selectedSession?: VisitorSession;
  variableDataList?: SessionVariableData[];
  selectedVariableData?: SessionVariableData;
  languages: string[];
  dataChanged: boolean;
  confirmEmptyOpen: boolean;
  confirmDialogData: ConfirmDialogData;
}

interface SessionVariableData {
  sessionVariable: VisitorSessionVariable;
  visitorVariable: VisitorVariable;
}

/**
 * Component for manage visitor session variables screen
 */
export class ManageVisitorSessionVariablesScreen extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);

    this.state = {
      loading: false,
      languages: [],
      dataChanged: false,
      confirmEmptyOpen: false,
      confirmDialogData: {
        deletePossible: true,
        title: strings.manageVisitorSessionVariables.confirmEmptyTitle,
        text: strings.manageVisitorSessionVariables.confirmEmptyText,
        onClose: this.onConfirmEmptyClose,
        onCancel: this.onConfirmEmptyClose,
        onConfirm: this.emptyVariableValue,
        cancelButtonText: strings.genericDialog.cancel,
        positiveButtonText: strings.genericDialog.confirm
      }
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { history, keycloak } = this.props;
    const { error, dataChanged } = this.state;

    return (
      <BasicLayout
        history={history}
        title={strings.manageVisitorSessionVariables.title}
        breadcrumbs={[]}
        actionBarButtons={this.getActionButtons()}
        keycloak={keycloak}
        error={error}
        clearError={() => this.setState({ error: undefined })}
        dataChanged={dataChanged}
        openDataChangedPrompt
      >
        {this.resolveComponentToRender()}
      </BasicLayout>
    );
  };

  /**
   * Resolves what component to render inside basic layout
   */
  private resolveComponentToRender = () => {
    const { classes } = this.props;
    const { loading, foundSessions, selectedSession } = this.state;

    if (loading) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary"></CircularProgress>
        </div>
      );
    }

    if (!foundSessions) {
      return this.renderTagListener();
    }

    if (!selectedSession) {
      return this.renderSessionList();
    }

    return this.renderSessionVariablesEditor();
  };

  /**
   * Renders tag listener
   */
  private renderTagListener = () => {
    return (
      <MqttListener onError={this.onMqttError}>
        {(mqtt) => (
          <TagListener
            threshold={75}
            mqtt={mqtt}
            antenna={config.mqttConfig.resetVisitorVariableAntenna}
            hide={false}
            onTagRegister={this.onTagRegister}
          />
        )}
      </MqttListener>
    );
  };

  /**
   * Renders session list
   */
  private renderSessionList = () => {
    const { classes } = this.props;
    const { foundSessions } = this.state;

    if (!foundSessions) {
      return null;
    }

    return (
      <div className={classes.sessionListContainer}>
        <List className={classes.sessionList}>
          {foundSessions.length > 0 ? (
            foundSessions.map(this.renderSessionListItem)
          ) : (
            <Typography>{strings.manageVisitorSessionVariables.noActiveSessionsFound}</Typography>
          )}
        </List>
      </div>
    );
  };

  /**
   * Renders session list item
   *
   * @param session visitor session
   */
  private renderSessionListItem = (session: VisitorSession) => {
    return (
      <ListItem key={session.id} onClick={this.setSelectedSession(session)}>
        <ListItemText
          primary={this.displaySessionVisitors(session)}
          secondary={this.displaySessionLastModifiedAt(session)}
        />
      </ListItem>
    );
  };

  /**
   * Renders session variable editor
   */
  private renderSessionVariablesEditor = () => {
    const { classes } = this.props;

    return (
      <div className={classes.editorLayout}>
        <ElementNavigationPane title={strings.manageVisitorSessionVariables.title}>
          {this.renderSessionVariablesList()}
        </ElementNavigationPane>
        <div className={classes.editorContainer}>{this.renderEditor()}</div>
      </div>
    );
  };

  /**
   * Renders session variable list
   */
  private renderSessionVariablesList = () => {
    const { variableDataList } = this.state;

    return (
      <List disablePadding>
        {variableDataList && variableDataList.length > 0 ? (
          [...variableDataList]
            .sort(this.sortVariablesByName)
            .map(this.renderSessionVariableListItem)
        ) : (
          <Typography>{strings.manageVisitorSessionVariables.noVariables}</Typography>
        )}
      </List>
    );
  };

  /**
   * Renders session variable
   *
   * @param variableData session variable data
   */
  private renderSessionVariableListItem = (variableData: SessionVariableData) => {
    const { selectedVariableData } = this.state;
    const { sessionVariable, visitorVariable } = variableData;
    const { name, value } = sessionVariable;
    const selected = name === selectedVariableData?.sessionVariable.name;

    return (
      <ListItem
        button
        key={visitorVariable.id || name}
        selected={selected}
        onClick={this.setSelectedSessionVariable(variableData)}
      >
        <ListItemText primary={name} secondary={value} />
      </ListItem>
    );
  };

  /**
   * Renders variable editor
   */
  private renderEditor = () => {
    const { classes } = this.props;
    const { selectedVariableData } = this.state;

    if (selectedVariableData) {
      return (
        <>
          <Typography variant="h3" className={classes.variableTitle}>
            {selectedVariableData.sessionVariable.name}
          </Typography>
          {this.renderValueField()}
          {this.renderConfirmDeleteDialog()}
        </>
      );
    }
  };

  /**
   * Renders value field for variable editor
   */
  private renderValueField = () => {
    const { classes } = this.props;
    const { selectedVariableData } = this.state;

    if (!selectedVariableData) {
      return null;
    }

    const { type, _enum } = selectedVariableData.visitorVariable;
    const { name, value } = selectedVariableData.sessionVariable;
    switch (type) {
      case VisitorVariableType.Enumerated:
        if (!_enum) {
          return null;
        }

        return (
          <TextField
            select
            className={classes.variableValue}
            label={strings.manageVisitorSessionVariables.value}
            name={name}
            value={value ?? ""}
            onChange={this.onVariableValueChange(type)}
          >
            {_enum.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        );
      case VisitorVariableType.Boolean:
        return (
          <FormControlLabel
            className={classes.variableValue}
            label=""
            control={
              <Checkbox
                name={name}
                checked={value === "true"}
                onChange={this.onVariableValueChange(type)}
                color="primary"
              />
            }
          />
        );
      case VisitorVariableType.Number:
        return (
          <WithDebounce
            className={classes.variableValue}
            label={strings.manageVisitorSessionVariables.value}
            name={name}
            value={value ?? ""}
            onChange={this.onVariableValueChange(type)}
            component={(props) => <TextField type="number" {...props} />}
          />
        );
      case VisitorVariableType.Text:
      default:
        return (
          <WithDebounce
            className={classes.variableValue}
            label={strings.manageVisitorSessionVariables.value}
            name={name}
            value={value ?? ""}
            onChange={this.onVariableValueChange(type)}
            component={(props) => <TextField {...props} />}
          />
        );
    }
  };

  /**
   * Render empty variable confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedVariableData, confirmDialogData, confirmEmptyOpen } = this.state;

    if (!selectedVariableData) {
      return null;
    }

    return <ConfirmDialog open={confirmEmptyOpen} confirmDialogData={confirmDialogData} />;
  };

  /**
   * Display session visitors
   *
   * @param session visitor session
   */
  private displaySessionVisitors = (session: VisitorSession) => {
    const { foundVisitors } = this.state;
    if (!foundVisitors) {
      return;
    }

    const sessionVisitors = foundVisitors.filter((visitor) =>
      session.visitorIds.some((visitorId) => visitorId === visitor.id)
    );

    if (sessionVisitors.length < 1) {
      return;
    }

    const visitorNames = sessionVisitors.map(({ firstName, lastName, email }) => {
      return !firstName && !lastName ? email : `${firstName} ${lastName}`;
    });

    return visitorNames.join(", ");
  };

  /**
   * Displays session last modified
   *
   * @param session visitor session
   */
  private displaySessionLastModifiedAt = (session: VisitorSession) => {
    return strings.formatString(
      strings.manageVisitorSessionVariables.lastModifiedAt,
      moment(session.modifiedAt).fromNow()
    );
  };

  /**
   * Returns action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { selectedVariableData, dataChanged } = this.state;

    if (!selectedVariableData) {
      return [];
    }

    return [
      {
        name: strings.manageVisitorSessionVariables.saveButton,
        action: this.onSaveSession,
        disabled: !dataChanged
      },
      {
        name: strings.manageVisitorSessionVariables.emptyButton,
        action: this.onEmptyClick
      }
    ];
  };

  /**
   * Event handler for tag register
   *
   * @param tag tag that was read
   */
  private onTagRegister = async (tag: string) => {
    const { accessToken, exhibitionId } = this.props;
    if (!accessToken) {
      return;
    }

    this.setState({ loading: true });

    try {
      const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
      const foundSessions = await visitorSessionsApi.listVisitorSessions({
        exhibitionId: exhibitionId,
        tagId: tag
      });

      const visitorIds: string[] = [];
      foundSessions.forEach((session) => {
        const newVisitors = session.visitorIds.filter((visitorId) =>
          visitorIds.every((existingVisitorId) => existingVisitorId !== visitorId)
        );

        if (newVisitors.length > 0) {
          newVisitors.forEach((visitor) => visitorIds.push(visitor));
        }
      });

      const visitorsApi = Api.getVisitorsApi(accessToken);
      const foundVisitors = await Promise.all(
        visitorIds.map((visitorId) => visitorsApi.findVisitor({ exhibitionId, visitorId }))
      );

      this.setState({
        foundSessions,
        foundVisitors,
        loading: false
      });
    } catch (error) {
      this.setState({
        error: error
      });
    }
  };

  /**
   * Event handler for mqtt error
   *
   * @param error mqtt error
   */
  private onMqttError = (error: Error) => {
    this.setState({
      error: error
    });
  };

  /**
   * Sets selected session
   *
   * @param selectedSession selected session
   */
  private setSelectedSession = (selectedSession: VisitorSession) => async () => {
    const { accessToken, exhibitionId } = this.props;
    if (!accessToken) {
      return;
    }

    const sessionVariables = selectedSession.variables;
    if (sessionVariables && sessionVariables.length > 0) {
      this.setState({ loading: true });

      const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);
      const visitorVariables = await visitorVariablesApi.listVisitorVariables({ exhibitionId });
      const modifiableVariables = visitorVariables.filter((variable) => variable.editableFromUI);

      const variableDataList: SessionVariableData[] = [];
      for (const sessionVariable of sessionVariables) {
        const visitorVariable = modifiableVariables.find(
          (variable) => variable.name === sessionVariable.name
        );
        if (visitorVariable) {
          variableDataList.push({
            visitorVariable,
            sessionVariable
          });
        }
      }

      this.setState({
        variableDataList,
        loading: false
      });
    }

    this.setState({ selectedSession });
  };

  /**
   * Sets selected session variable
   *
   * @param selectedVariableData selected variable data
   */
  private setSelectedSessionVariable = (selectedVariableData: SessionVariableData) => () => {
    this.setState({ selectedVariableData });
  };

  /**
   * Event handler for variable value change
   *
   * @param type visitor variable type
   * @param event React change event
   */
  private onVariableValueChange =
    (type: VisitorVariableType) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const { selectedSession, selectedVariableData, variableDataList } = this.state;
      if (!selectedSession || !selectedVariableData || !variableDataList) {
        return;
      }

      const updatedValue = this.getUpdatedVariableValue(type, event);

      this.setState(
        produce((draft: State) => {
          draft.selectedVariableData!.sessionVariable.value = updatedValue;
          draft.dataChanged = true;
          draft.variableDataList = variableDataList.map((variableData) =>
            variableData.visitorVariable.id === selectedVariableData.visitorVariable.id
              ? draft.selectedVariableData!
              : variableData
          );

          draft.selectedSession!.variables = draft.variableDataList.map(
            (variableData) => variableData.sessionVariable
          );
        })
      );
    };

  /**
   * Returns updated variable value based on given type and event data
   *
   * @param type visitor variable type
   * @param event React change event
   */
  private getUpdatedVariableValue = (
    type: VisitorVariableType,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value, checked } = event.target;
    switch (type) {
      case VisitorVariableType.Boolean:
        return `${checked}`;
      case VisitorVariableType.Number:
        return `${value}`;
      case VisitorVariableType.Enumerated:
      case VisitorVariableType.Text:
      default:
        return value;
    }
  };

  /**
   * Event handler for save session
   */
  private onSaveSession = async () => {
    const { selectedSession, selectedVariableData } = this.state;
    if (!selectedSession || !selectedVariableData) {
      return;
    }

    this.setState({ loading: true });
    const updatedSession = await this.updateVisitorSession(selectedSession);

    this.setState({
      selectedSession: updatedSession,
      dataChanged: false,
      loading: false
    });
  };

  /**
   * Empties variable value
   */
  private emptyVariableValue = async () => {
    const { selectedVariableData, selectedSession, variableDataList } = this.state;
    if (
      !selectedSession ||
      !selectedSession.variables ||
      !selectedVariableData ||
      !variableDataList
    ) {
      return;
    }

    this.setState({ loading: true });

    const selectedSessionVariable = selectedVariableData.sessionVariable;
    const updatedSession = await this.updateVisitorSession({
      ...selectedSession,
      variables: selectedSession.variables.filter(
        (variable) => variable.name !== selectedSessionVariable.name
      )
    });

    const updatedVariableDataList = variableDataList.filter(
      (variableData) => variableData.sessionVariable.name !== selectedSessionVariable.name
    );

    this.setState({
      dataChanged: false,
      selectedSession: updatedSession,
      variableDataList: updatedVariableDataList,
      selectedVariableData: undefined,
      confirmEmptyOpen: false,
      loading: false
    });
  };

  /**
   * Updates visitor session to API
   *
   * @param visitorSession updated visitor session
   * @returns updated visitor session from API
   */
  private updateVisitorSession = async (visitorSession: VisitorSession) => {
    const { accessToken, exhibitionId } = this.props;

    const visitorSessionId = visitorSession.id!;
    const sessionsApi = Api.getVisitorSessionsApi(accessToken);
    return await sessionsApi.updateVisitorSession({
      exhibitionId,
      visitorSessionId,
      visitorSession
    });
  };

  /**
   * Event handler for empty click
   */
  private onEmptyClick = () => {
    this.setState({ confirmEmptyOpen: true });
  };

  /**
   * Event handler for confirm empty dialog close
   */
  private onConfirmEmptyClose = () => {
    this.setState({ confirmEmptyOpen: false });
  };

  /**
   * Sorts variables by name
   *
   * @param a visitor variable A
   * @param b visitor variable B
   */
  private sortVariablesByName = (a: SessionVariableData, b: SessionVariableData) => {
    const nameA = a.sessionVariable.name.toUpperCase();
    const nameB = b.sessionVariable.name.toUpperCase();
    if (nameA === nameB) {
      return 0;
    }

    return nameA < nameB ? -1 : 1;
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak as KeycloakInstance,
  accessToken: state.auth.accessToken as AccessToken
});

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => ({
  setDeviceModels: (deviceModels: DeviceModel[]) => dispatch(setDeviceModels(deviceModels))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(ManageVisitorSessionVariablesScreen));
