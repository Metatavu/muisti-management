import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../../api/api";
// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
import { Box, Button, Checkbox, CircularProgress, Divider, FormControl, FormControlLabel, IconButton, InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, Typography, WithStyles, withStyles, Dialog, DialogTitle, DialogActions, DialogContent } from "@material-ui/core";
import { ContentVersion, Exhibition, Visitor, VisitorSession, VisitorSessionState, VisitorVariable } from "../../generated/client";
import strings from "../../localization/strings";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import ConfirmDialog from "../generic/confirm-dialog";
import { AccessToken, ActionButton, ConfirmDialogData } from "../../types";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/screens/visitors-management-screen";
import theme from "../../styles/theme";
import AddIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/DeleteOutlined";
import TagIcon from "@material-ui/icons/NfcOutlined";
import ElementPropertiesPane from "../layouts/element-properties-pane";
import { MqttListener } from "../generic/mqtt-listener";
import TagListener from "../generic/tag-listener";
import VisitorInformation from "./visitors/visitor-info";
import VisitorUtils from "../../utils/visitor-utils";
import produce from "immer";
import LanguageUtils from "../../utils/language-utils";
import { Config } from "../../constants/configuration";
import VisitorVariables from "./visitors/visitor-variables";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak?: KeycloakInstance;
  accessToken?: AccessToken;
  exhibitions: Exhibition[];
  exhibitionId: string;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  contentLoading: boolean;
  dataChanged: boolean;
  visitorVariables: VisitorVariable[];
  selectedVisitorVariable?: VisitorVariable;
  mqttScannerOpen: boolean;
  visitors: Visitor[];
  selectedVisitor?: Visitor;
  anonymousData: boolean;
  languages: string[];
  selectedLanguage?: string;
  visitorSessions: VisitorSession[];
  selectedSession?: VisitorSession;
  filterString: string;
  deleteDialogOpen: boolean;
  confirmDialogData: ConfirmDialogData;
}

/**
 * Component for visitors management screen
 */
export class VisitorsManagementScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      contentLoading: false,
      dataChanged: false,
      visitorVariables: [],
      mqttScannerOpen: false,
      visitors: [],
      anonymousData: true,
      languages: [],
      visitorSessions: [],
      filterString: "",
      deleteDialogOpen: false,
      confirmDialogData: {
        title: strings.visitorsManagement.delete.deleteTitle,
        text: strings.visitorsManagement.delete.deleteText,
        cancelButtonText: strings.confirmDialog.cancel,
        positiveButtonText: strings.confirmDialog.delete,
        deletePossible: true,
        onCancel: this.onCloseOrCancelClick,
        onClose: this.onCloseOrCancelClick,
        onConfirm: this.onSessionConfirmDeleteClick
      }
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchData();
    this.setState({ loading: false });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { loading, dataChanged, error, visitorVariables, selectedSession } = this.state;

    if (loading || !keycloak) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        history={ history }
        title={ strings.visitorsManagement.title }
        breadcrumbs={ [] }
        actionBarButtons={ this.getActionButtons() }
        keycloak={ keycloak }
        error={ error }
        clearError={ () => this.setState({ error: undefined }) }
        dataChanged={ dataChanged }
        openDataChangedPrompt={ true }
      >
        <Box className={ classes.editorLayout }>
          <ElementNavigationPane
            width={ 320 }
            title={ strings.visitorsManagement.activeVisitorSessions }
            actionButtonClick={ this.clearValues }
            actionButtonIcon={ <AddIcon /> }
            actionButtonTitle={ strings.visitorsManagement.startNewSession }
          >
            { this.renderActiveSessions() }
          </ElementNavigationPane>
          { this.renderContent() }
          <ElementPropertiesPane
            open={ true }
          >
            { selectedSession &&
              <VisitorVariables
                visitorVariables={ visitorVariables }
                visitorSession={ selectedSession }
                onSessionUpdate={ this.onSessionUpdate }
              />
            }
          </ElementPropertiesPane>
        </Box>
        { this.renderRFIDDialog() }
        { this.renderConfirmDeleteDialog() }
      </BasicLayout>
    );
  };

  /**
   * Renders active sessions
   */
  private renderActiveSessions = () => {

    return (
      <Box>
        <Box
          pb={ 2 }
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography>{ strings.visitorsManagement.searchGroup }</Typography>
          <Box ml={ 2 }>
            <IconButton
              title={ strings.visitorsManagement.scanRFID }
              onClick={ this.onScanTagClick }
            >
              <TagIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        <List>
          { this.renderSessionList() }
        </List>
      </Box>
    );
  }

  /**
   * Renders session list
   */
  private renderSessionList = () => {
    const { visitorSessions, selectedSession } = this.state;

    return visitorSessions.map(session =>
      <ListItem
        key={ session.id }
        button
        selected={ selectedSession && session.id === selectedSession.id }
      >
        <ListItemText
          onClick={ () => this.onSessionClick(session) }
          primary={ VisitorUtils.getVisitorSessionInfoText(session) }
          secondary={ VisitorUtils.getSessionExpiresTime(session) }
        />
        <ListItemSecondaryAction>
          <IconButton onClick={ () => this.onSessionDeleteClick(session) }>
            <DeleteIcon/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );

  }

  /**
   * Render content
   */
  private renderContent = () => {
    const { classes } = this.props;
    const {
      anonymousData,
      selectedVisitor,
      contentLoading,
      selectedSession
    } = this.state;

    if (contentLoading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <Box p={ 4 }>
        <Typography variant="h2">
          { selectedSession ? strings.visitorsManagement.editSession : strings.visitorsManagement.startNewSession }
        </Typography>
        <Box mt={ 2 } mb={ 2 }>
          <Typography>
            { selectedSession ? strings.visitorsManagement.scanMoreTicketsHelp : strings.visitorsManagement.scanTicketsHelp}
          </Typography>
          <Typography>
            { strings.visitorsManagement.sessionDuration }
          </Typography>
        </Box>
        <Box display="flex" flex={ 1 }>
          <Box flex={ 1 } mr={ 2 }>
            <Box display="flex" mb={ 4 } alignItems="center">
              <Box flex={ 6 }>
                <FormControlLabel
                  control={
                    <Checkbox
                    color="primary"
                    checked={ anonymousData }
                    name="anonymous"
                    onChange={ () => this.setState({ anonymousData: !anonymousData })}
                  />
                  }
                  label={ strings.visitorsManagement.fillWithAnonymousData }
                />
              </Box>
              <Box flex={ 2 }>
                { this.renderLanguageSelect() }
              </Box>
            </Box>
            { this.renderTagList() }
          </Box>
          <Box  flex={ 1 } ml={ 2 }>
            { selectedVisitor && this.renderTagInformation() }
          </Box>
          { this.renderTagListener() }
        </Box>
      </Box>
    );
  }

  /**
   * Renders language select
   */
  private renderLanguageSelect = () => {
    const { languages, selectedLanguage } = this.state;

    if (!selectedLanguage) {
      return null;
    }

    const selectOptions = languages.map(language => {
      return (
        <MenuItem key={ language } value={ language }>
          { language }
        </MenuItem>
      );
    });

    return (
      <Box flex={ 2 }>
        <FormControl>
          <InputLabel id="languageLabel">
            { strings.reception.selectLanguageTitle }
          </InputLabel>
          <Select
            label={ strings.reception.language }
            labelId="languageLabel"
            onChange={ this.onLanguageChange }
            value={ selectedLanguage }
          >
            { selectOptions }
          </Select>
        </FormControl>
      </Box>
    );
  }

  /**
   * Render session visitor tags
   */
  private renderTagList = () => {
    const { visitors, selectedVisitor } = this.state;

    const tags = visitors.map(visitor =>
      <ListItem
        key={ visitor.id }
        button
        selected={ visitor.tagId === selectedVisitor?.tagId }
        onClick={ () => this.fetchTagInfo(visitor.tagId) }
      >
        <ListItemText primary={ `${strings.visitorsManagement.tag} ${visitor.tagId}` } />
        <ListItemSecondaryAction>
          <IconButton onClick={ () => this.onRemoveTag(visitor.tagId) }>
            <DeleteIcon/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );

    return (
      <Box
        flex={ 1 }
        p={ 2 }
        bgcolor={ theme.palette.background.default }
      >
        { visitors.length !== 0 ?
          <List>
            { tags }
          </List>
          :
          <Typography>
            { strings.visitorsManagement.scanTicketsHelp }
          </Typography>
        }
      </Box>
    );
  }

  /**
   * Render session visitor tag information
   */
  private renderTagInformation = () => {
    const { selectedVisitor } = this.state;

    if (!selectedVisitor) {
      return null;
    }

    return (
      <Box
        display="flex"
        flex={ 1 }
        p={ 4 }
        bgcolor={ theme.palette.background.default }
        flexDirection="column"
      >
        <Typography variant="h3">
          { strings.visitorsManagement.ticketContactInformation }
        </Typography>
        <VisitorInformation
          visitor={ selectedVisitor }
          updateVisitor={ this.onUpdateVisitor }
        />
      </Box>
    );
  }

  /**
   * Renders tag listener
   */
  private renderTagListener = () => {
    const { mqttScannerOpen } = this.state;

    const antenna = Config.getConfig().mqttConfig.visitorManagementAntenna;
    if (!antenna) {
      return null;
    }

    return (
      <MqttListener onError={ error => this.setState({ error: error }) }>
        { mqtt => (
          <TagListener
            threshold={ 75 }
            mqtt={ mqtt }
            antenna={ antenna }
            hide={ true }
            onTagRegister={ mqttScannerOpen ? this.onTagSearch : this.onTagRegister }
          />
        )}
      </MqttListener>
    );
  }

  /**
   * Renders RFID dialog
   */
  private renderRFIDDialog = () => {
    const { mqttScannerOpen } = this.state;

    return (
      <Dialog
        open={ mqttScannerOpen }
        onClose={ () => this.setState({ mqttScannerOpen: false }) }
        aria-labelledby="RFID-dialog-title"
        aria-describedby="RFID-dialog-description"
        fullWidth={ true }
      >
        <DialogTitle
          disableTypography
          id="RFID-dialog-title"
        >
          { strings.visitorsManagement.searchGroup }
        </DialogTitle>
        <DialogContent>
          <Box
            flex={ 1 }
            display="flex"
            justifyContent="center"  
          >
            <Typography>{ strings.visitorsManagement.scanRFID }</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={ () => this.setState({ mqttScannerOpen: false }) }
            color="primary"
            variant="contained"
          >
            { strings.generic.cancel }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { deleteDialogOpen, confirmDialogData } = this.state;

    return (
      <ConfirmDialog
        open={ deleteDialogOpen }
        confirmDialogData={ confirmDialogData }
      />
    );
  }

  /**
   * Returns action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { dataChanged, selectedSession } = this.state;

    return [
      {
        name: strings.generic.clear,
        action: this.clearValues
      },
      {
        name: selectedSession ? strings.visitorsManagement.updateSession : strings.visitorsManagement.startSession,
        action: selectedSession ? this.updateSession : this.onStartClick,
        disabled : !dataChanged
      }
    ];
  }

  /**
   * Event handler for clear session button click
   */
  private clearValues = () => {
    this.setState({
      visitors: [],
      selectedSession: undefined,
      selectedVisitor: undefined,
      selectedVisitorVariable: undefined,
      dataChanged: false,
      deleteDialogOpen: false,
      selectedLanguage: "FI"
    });
  }

  /**
   * Updates session
   */
  private updateSession = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { visitorSessions, selectedSession, selectedLanguage } = this.state;

    if (!accessToken || !selectedSession || !selectedSession.id || !selectedLanguage) {
      return;
    }

    this.setState({
      contentLoading: true
    });

    const sessionsApi = Api.getVisitorSessionsApi(accessToken);
    const updatedSession = await sessionsApi.updateVisitorSession({
      exhibitionId: exhibitionId,
      visitorSession: { ...selectedSession, language: selectedLanguage },
      visitorSessionId: selectedSession.id
    });

    const updatedSessionList = produce(visitorSessions, draft => {
      const index = visitorSessions.findIndex(session => session.id === selectedSession.id);
      if (index > -1) {
        draft.splice(index, 1, updatedSession);
      }
    });

    this.setState({
      dataChanged: false,
      selectedSession: updatedSession,
      contentLoading: false,
      visitorSessions: updatedSessionList
    });
  }

  /**
   * Event handler for start session button click
   */
  private onStartClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedLanguage, visitors, visitorSessions } = this.state;

    if (!accessToken || !selectedLanguage) {
      return;
    }

    for await (const visitor of visitors) {
      this.updateVisitor(visitor);
    }

    const visitorSessionToCreate: VisitorSession = {
      language: selectedLanguage,
      state: VisitorSessionState.ACTIVE,
      visitorIds: visitors.map(visitor => visitor.id || ""),
    };

    const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
    const createdSession = await visitorSessionsApi.createVisitorSession({
      exhibitionId: exhibitionId,
      visitorSession: visitorSessionToCreate
    });

    this.setState({
      visitorSessions: [ ...visitorSessions, createdSession ],
    });

    this.clearValues();
  }

  /**
   * Updates visitor
   *
   * @param visitor visitor to update
   */
  private updateVisitor = async (visitor: Visitor) => {
    const { accessToken, exhibitionId } = this.props;

    if (!accessToken || !visitor.id) {
      return;
    }

    const visitorsApi = Api.getVisitorsApi(accessToken);
    await visitorsApi.updateVisitor({
      exhibitionId: exhibitionId,
      visitor: visitor,
      visitorId: visitor.id
    });
  }

  /**
   * Event handler for scan tag button click
   */
  private onScanTagClick = () => {
    this.setState({
      mqttScannerOpen: !this.state.mqttScannerOpen
    });
  }

  /**
   * Event handler for session click
   *
   * @param session clicked session
   */
  private onSessionClick = async (session: VisitorSession) => {
    const { accessToken, exhibitionId } = this.props;

    this.setState({ contentLoading: true });

    if (!accessToken) {
      return;
    }

    const visitors: Visitor[] = [];
    const visitorsApi = Api.getVisitorsApi(accessToken);

    try {
      for (const visitor of session.visitorIds) {
        const foundVisitor = await visitorsApi.findVisitor({ exhibitionId: exhibitionId, visitorId: visitor });
        visitors.push(foundVisitor);
      }
    } catch (error) {
      console.error(error);
    }

    this.setState({
      visitors: visitors,
      contentLoading: false,
      dataChanged: false,
      selectedSession: session,
      selectedLanguage: session.language
    });
  }

  /**
   * Event handler for session delete click
   *
   * @param sessionToDelete visitor session to delete
   */
  private onSessionDeleteClick = (sessionToDelete: VisitorSession) => {
    this.setState({
      selectedSession: sessionToDelete,
      deleteDialogOpen: true
    });
  }

  /**
   * Event handler for language change
   *
   * @param event react change event
   * @param child react child node
   */
  private onLanguageChange = (event: React.ChangeEvent<{ name?: string, value: any }>, child: React.ReactNode) => {
    this.setState({
      selectedLanguage: event.target.value,
      dataChanged: true
    });
  }

  /**
   * Event handler for tag click
   *
   * @param tag clicked tag
   */
  private fetchTagInfo = async (tag: string) => {
    const { accessToken, exhibitionId } = this.props;
    const { anonymousData, visitors, selectedSession } = this.state;

    if (!accessToken) {
      return;
    }

    const visitorsApi = Api.getVisitorsApi(accessToken);
    try {
      const visitorList = await visitorsApi.listVisitors({
        exhibitionId: exhibitionId,
        tagId: tag
      });

      if (visitorList.length > 1) {
        this.setState({ error: new Error(strings.visitorsManagement.error.moreThenOneUser) });
        return;
      }

      let visitor: Visitor;

      if (visitorList.length === 0) {
        visitor = await visitorsApi.createVisitor({
          exhibitionId: exhibitionId,
          visitor: VisitorUtils.fillWithAnonymousData(tag)
        });
      } else if (anonymousData) {
        visitor = VisitorUtils.fillWithAnonymousData(tag, visitorList[0]);
      } else {
        visitor = visitorList[0];
      }

      const updatedVisitorList = produce(visitors, draft => {
        const index = draft.findIndex(_visitor => _visitor.id === visitor.id);
        if (index > -1) {
          draft.splice(index, 1, visitor);
        } else {
          draft.push(visitor);
        }
      });

      this.setState({
        selectedVisitor: visitor,
        visitors: updatedVisitorList,
        selectedSession: selectedSession && { ...selectedSession, visitorIds: updatedVisitorList.map(_visitor => _visitor.id!) },
        dataChanged: true
      });

    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Event handler for remove tag click
   *
   * @param clickedTag clicked tag
   */
  private onRemoveTag = (clickedTag: string) => {
    const { visitors, selectedSession } = this.state;

    if (!selectedSession) {
      return;
    }

    const visitorToDelete = visitors.find(visitor => visitor.tagId === clickedTag);

    this.setState({
      visitors: visitors.filter(visitor => visitor.tagId !== clickedTag),
      selectedSession: { ...selectedSession, visitorIds: selectedSession.visitorIds.filter(visitorId => visitorId !== visitorToDelete?.id) },
      selectedVisitor: undefined
    });
  }

  /**
   * Event handler for tag search
   *
   * @param tag tag to search
   */
  private onTagSearch = async (tag: string) => {
    const { accessToken, exhibitionId } = this.props;
    const { visitorSessions } = this.state;

    if (!accessToken) {
      return;
    }

    const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
    const sessionsWithReadTag = await visitorSessionsApi.listVisitorSessions({
      exhibitionId: exhibitionId,
      tagId: tag
    });

    const session = sessionsWithReadTag[0];

    if (!session) {
      this.setState({
        error: new Error(strings.visitorsManagement.error.noUserFound)
      });
      return;
    }

    const updatedSessionList = produce(visitorSessions, draft => {
      const index = draft.findIndex(_session => _session.id === session.id);
      if (index > -1) {
        draft.splice(index, 1, session);
      }
    });

    const visitors: Visitor[] = [];
    const visitorsApi = Api.getVisitorsApi(accessToken);

    for (const visitor of session.visitorIds) {
      const foundVisitor = await visitorsApi.findVisitor({ exhibitionId: exhibitionId, visitorId: visitor });
      visitors.push(foundVisitor);
    }

    this.setState({
      visitorSessions: updatedSessionList,
      selectedSession: session,
      visitors: visitors,
      mqttScannerOpen: false,
      selectedVisitor: visitors.find(visitor => visitor.tagId === tag)
    });
  }

  /**
   * Event handler for tag register
   *
   * @param tag mqtt tag
   */
  private onTagRegister = (tag: string) => {
    const { visitors } = this.state;

    if (visitors.filter(visitor => visitor.tagId === tag).length > 0) {
      return;
    }

    this.fetchTagInfo(tag);
  }

  /**
   * Event handler for session update
   *
   * @param updatedSession updated session
   */
  private onSessionUpdate = (updatedSession: VisitorSession) => {
    this.setState({
      selectedSession: updatedSession,
      dataChanged: true
    });
  }

  /**
   * Event handler for update visitor
   *
   * @param updatedVisitor updated visitor
   */
  private onUpdateVisitor = (updatedVisitor: Visitor) => {
    const { selectedVisitor, visitors } = this.state;

    if (!selectedVisitor) {
      return;
    }

    const updatedVisitorList = produce(visitors, draft => {
      const index = draft.findIndex(visitor => visitor.id === updatedVisitor.id);
      if (index > -1) {
        draft.splice(index, 1, updatedVisitor);
      }
    });

    this.setState({
      selectedVisitor: updatedVisitor,
      visitors: updatedVisitorList
    });
  }

  /**
   * Fetches initial data
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId } = this.props;

    if (!accessToken) {
      return;
    }

    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);
    const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
    const visitorsApi = Api.getVisitorsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);

    const [ visitorVariables, visitorSessions, adminVisitors, contentVersions ] = await Promise.all([
      visitorVariablesApi.listVisitorVariables({ exhibitionId: exhibitionId }),
      visitorSessionsApi.listVisitorSessions({ exhibitionId: exhibitionId }),
      visitorsApi.listVisitors({ exhibitionId: exhibitionId, tagId: "adminoverride" }),
      contentVersionsApi.listContentVersions({ exhibitionId: exhibitionId })
    ]);

    this.constructAvailableLanguages(contentVersions);

    /**
     * Admin visitors must be filtered out
     */
    const adminVisitorIds = adminVisitors.map(admin => admin.id);
    const filteredSessions = visitorSessions.filter(session => {
      const visitorIds = session.visitorIds;
      for (const id of visitorIds) {
        if (adminVisitorIds.includes(id)) {
          return false;
        }
      }

      return true;
    });

    this.setState({
      visitorVariables: visitorVariables,
      visitorSessions: filteredSessions
    });
  }

  /**
   * Construct available language options from content version
   *
   * @param contentVersions exhibition content versions
   */
  private constructAvailableLanguages = (contentVersions: ContentVersion[]) => {
    const languages = LanguageUtils.getAvailableLanguages(contentVersions);

    this.setState({
      languages: languages,
      selectedLanguage: languages[0]
    });
  }

  /**
   * Event handler fo close or cancel click
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      deleteDialogOpen: false,
    });
  }

  /**
   * Event handler for session delete click
   *
   * @param sessionToDelete visitor session to delete
   */
  private onSessionConfirmDeleteClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedSession } = this.state;

    if (!accessToken || !selectedSession || !selectedSession.id) {
      return;
    }

    const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
    await visitorSessionsApi.deleteVisitorSession({
      exhibitionId: exhibitionId,
      visitorSessionId: selectedSession.id
    });

    this.setState({
      visitorSessions: this.state.visitorSessions.filter(session => session.id !== selectedSession.id),
    });

    this.clearValues();
  }

}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak,
    accessToken: state.auth.accessToken,
    exhibitions: state.exhibitions.exhibitions
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(_dispatch: Dispatch<ReduxActions>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VisitorsManagementScreen));