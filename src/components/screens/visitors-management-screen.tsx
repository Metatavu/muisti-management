import Api from "../../api/api";
import { Config } from "../../constants/configuration";
import {
  ContentVersion,
  Exhibition,
  Visitor,
  VisitorSession,
  VisitorSessionState,
  VisitorVariable
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/screens/visitors-management-screen";
import theme from "../../styles/theme";
import { AccessToken, ActionButton, ConfirmDialogData } from "../../types";
import LanguageUtils from "../../utils/language-utils";
import VisitorUtils from "../../utils/visitor-utils";
import ConfirmDialog from "../generic/confirm-dialog";
import { MqttListener } from "../generic/mqtt-listener";
import TagListener from "../generic/tag-listener";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import ElementPropertiesPane from "../layouts/element-properties-pane";
import VisitorInformation from "./visitors/visitor-info";
import VisitorVariables from "./visitors/visitor-variables";
import AddIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import TagIcon from "@mui/icons-material/NfcOutlined";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import produce from "immer";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

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
  tagRead: boolean;
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
      tagRead: false,
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
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { loading, dataChanged, error, visitorVariables, selectedSession } = this.state;

    if (loading || !keycloak) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary" />
        </div>
      );
    }

    return (
      <BasicLayout
        history={history}
        title={strings.visitorsManagement.title}
        breadcrumbs={[]}
        actionBarButtons={this.getActionButtons()}
        keycloak={keycloak}
        error={error}
        clearError={() => this.setState({ error: undefined })}
        dataChanged={dataChanged}
        openDataChangedPrompt={true}
      >
        <Box className={classes.editorLayout}>
          <ElementNavigationPane
            width={320}
            title={strings.visitorsManagement.activeVisitorSessions}
            actionButtonClick={this.clearValues}
            actionButtonIcon={<AddIcon />}
            actionButtonTitle={strings.visitorsManagement.startNewSession}
          >
            {this.renderActiveSessions()}
          </ElementNavigationPane>
          {this.renderContent()}
          <ElementPropertiesPane open={true}>
            {selectedSession && (
              <VisitorVariables
                visitorVariables={visitorVariables}
                visitorSession={selectedSession}
                onSessionUpdate={this.onSessionUpdate}
              />
            )}
          </ElementPropertiesPane>
        </Box>
        {this.renderRFIDDialog()}
        {this.renderConfirmDeleteDialog()}
      </BasicLayout>
    );
  };

  /**
   * Renders active sessions
   */
  private renderActiveSessions = () => {
    return (
      <Box>
        <Box pb={2} display="flex" alignItems="center" justifyContent="space-between">
          <Typography>{strings.visitorsManagement.searchGroup}</Typography>
          <Box ml={2}>
            <IconButton
              title={strings.visitorsManagement.scanRFID}
              onClick={this.onScanTagClick}
              size="large"
            >
              <TagIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider />
        <List>{this.renderSessionList()}</List>
      </Box>
    );
  };

  /**
   * Renders session list
   */
  private renderSessionList = () => {
    const { visitorSessions, selectedSession } = this.state;

    return visitorSessions.map((session) => (
      <ListItem
        key={session.id}
        button
        selected={selectedSession && session.id === selectedSession.id}
      >
        <ListItemText
          onClick={() => this.onSessionClick(session)}
          primary={VisitorUtils.getVisitorSessionInfoText(session)}
          secondary={VisitorUtils.getSessionExpiresTime(session)}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={() => this.onSessionDeleteClick(session)} size="large">
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ));
  };

  /**
   * Render content
   */
  private renderContent = () => {
    const { classes } = this.props;
    const { anonymousData, selectedVisitor, contentLoading, selectedSession } = this.state;

    if (contentLoading) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary" />
        </div>
      );
    }

    return (
      <Box p={4}>
        <Typography variant="h2">
          {selectedSession
            ? strings.visitorsManagement.editSession
            : strings.visitorsManagement.startNewSession}
        </Typography>
        <Box mt={2} mb={2}>
          <Typography>
            {selectedSession
              ? strings.visitorsManagement.scanMoreTicketsHelp
              : strings.visitorsManagement.scanTicketsHelp}
          </Typography>
          <Typography>{strings.visitorsManagement.sessionDuration}</Typography>
        </Box>
        <Box display="flex" flex={1}>
          <Box flex={1} mr={2}>
            <Box display="flex" mb={4} alignItems="center">
              <Box flex={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={anonymousData}
                      name="anonymous"
                      onChange={() => this.setState({ anonymousData: !anonymousData })}
                    />
                  }
                  label={strings.visitorsManagement.fillWithAnonymousData}
                />
              </Box>
              <Box flex={2}>{this.renderLanguageSelect()}</Box>
            </Box>
            {this.renderTagList()}
          </Box>
          <Box flex={1} ml={2}>
            {selectedVisitor && this.renderTagInformation()}
          </Box>
          {this.renderTagListener()}
        </Box>
      </Box>
    );
  };

  /**
   * Renders language select
   */
  private renderLanguageSelect = () => {
    const { languages, selectedLanguage } = this.state;

    if (!selectedLanguage) {
      return null;
    }

    const selectOptions = languages.map((language) => (
      <MenuItem key={language} value={language}>
        {language}
      </MenuItem>
    ));

    return (
      <Box flex={2}>
        <FormControl>
          <InputLabel id="languageLabel">{strings.reception.selectLanguageTitle}</InputLabel>
          <Select
            label={strings.reception.language}
            labelId="languageLabel"
            onChange={this.onLanguageChange}
            value={selectedLanguage}
          >
            {selectOptions}
          </Select>
        </FormControl>
      </Box>
    );
  };

  /**
   * Render session visitor tags
   */
  private renderTagList = () => {
    const { visitors, selectedVisitor } = this.state;

    const tags = visitors.map((visitor) => (
      <ListItem
        key={visitor.id}
        button
        selected={visitor.tagId === selectedVisitor?.tagId}
        onClick={() => this.fetchTagUser(visitor.tagId)}
      >
        <ListItemText primary={`${strings.visitorsManagement.tag} ${visitor.tagId}`} />
        {/* This feature is not needed at the moment */}
        {/* <ListItemSecondaryAction>
          <IconButton
            onClick={ () => this.onRemoveTag(visitor.tagId) }
            disabled={ !!selectedSession }
          >
            <DeleteIcon/>
          </IconButton>
        </ListItemSecondaryAction> */}
      </ListItem>
    ));

    return (
      <Box flex={1} p={2} bgcolor={theme.palette.background.default}>
        {visitors.length ? (
          <List>{tags}</List>
        ) : (
          <Typography>{strings.visitorsManagement.scanTicketsHelp}</Typography>
        )}
      </Box>
    );
  };

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
        flex={1}
        p={4}
        bgcolor={theme.palette.background.default}
        flexDirection="column"
      >
        <Typography variant="h3">{strings.visitorsManagement.ticketContactInformation}</Typography>
        <VisitorInformation visitor={selectedVisitor} updateVisitor={this.onUpdateVisitor} />
      </Box>
    );
  };

  /**
   * Renders tag listener
   */
  private renderTagListener = () => {
    const { mqttScannerOpen } = this.state;

    const antennas = Config.getConfig().mqttConfig.visitorManagementAntennas;

    return (
      <MqttListener onError={(error) => this.setState({ error: error })}>
        {(mqtt) => (
          <>
            {antennas.map((antenna) => (
              <TagListener
                threshold={75}
                mqtt={mqtt}
                antenna={antenna}
                hide={true}
                onTagRegister={mqttScannerOpen ? this.onTagSearch : this.onTagRegister}
              />
            ))}
          </>
        )}
      </MqttListener>
    );
  };

  /**
   * Renders RFID dialog
   */
  private renderRFIDDialog = () => {
    const { mqttScannerOpen } = this.state;

    return (
      <Dialog
        open={mqttScannerOpen}
        onClose={() => this.setState({ mqttScannerOpen: false })}
        aria-labelledby="RFID-dialog-title"
        aria-describedby="RFID-dialog-description"
        fullWidth
      >
        <DialogTitle id="RFID-dialog-title">{strings.visitorsManagement.searchGroup}</DialogTitle>
        <DialogContent>
          <Box flex={1} display="flex" justifyContent="center">
            <Typography>{strings.visitorsManagement.scanRFID}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.setState({ mqttScannerOpen: false })}
            color="primary"
            variant="contained"
          >
            {strings.generic.cancel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  /**
   * Renders delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { deleteDialogOpen, confirmDialogData } = this.state;

    return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
  };

  /**
   * Returns action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { dataChanged, selectedSession, visitors } = this.state;

    return [
      {
        name: strings.generic.clear,
        action: this.clearValues
      },
      {
        name: selectedSession
          ? strings.visitorsManagement.updateSession
          : strings.visitorsManagement.startSession,
        action: selectedSession ? this.updateSession : this.onStartClick,
        disabled: !dataChanged || !visitors.length
      }
    ];
  };

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
      selectedLanguage: "FI",
      contentLoading: false
    });
  };

  /**
   * Updates session
   */
  private updateSession = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { visitorSessions, selectedSession, selectedLanguage, visitors } = this.state;

    if (!accessToken || !selectedSession || !selectedSession.id || !selectedLanguage) {
      return;
    }

    this.setState({ contentLoading: true });

    const visitorsApi = Api.getVisitorsApi(accessToken);
    const createdVisitors: Visitor[] = [];
    for (const visitorToCreate of visitors.filter((_visitor) => !_visitor.id)) {
      createdVisitors.push(
        await visitorsApi.createVisitor({
          exhibitionId: exhibitionId,
          visitor: visitorToCreate
        })
      );
    }

    for (const visitor of visitors) {
      await this.updateVisitor(visitor);
    }

    const sessionsApi = Api.getVisitorSessionsApi(accessToken);
    const combinedVisitorList = [...createdVisitors, ...visitors].filter(
      (visitor) => visitor.id !== undefined
    );
    const visitorIdList = combinedVisitorList.map((visitor) => visitor.id!);
    const updatedSession = await sessionsApi.updateVisitorSession({
      exhibitionId: exhibitionId,
      visitorSession: {
        ...selectedSession,
        language: selectedLanguage,
        visitorIds: visitorIdList
      },
      visitorSessionId: selectedSession.id
    });

    const updatedSessionList = produce(visitorSessions, (draft) => {
      const index = visitorSessions.findIndex((session) => session.id === selectedSession.id);
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
  };

  /**
   * Event handler for start session button click
   */
  private onStartClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedLanguage, visitors, visitorSessions } = this.state;

    if (!accessToken || !selectedLanguage) {
      return;
    }

    this.setState({ contentLoading: true });

    const visitorsApi = Api.getVisitorsApi(accessToken);
    const createdVisitors: Visitor[] = [];
    for (const visitorToCreate of visitors) {
      createdVisitors.push(
        await visitorsApi.createVisitor({
          exhibitionId: exhibitionId,
          visitor: visitorToCreate
        })
      );
    }

    const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
    const createdSession = await visitorSessionsApi.createVisitorSession({
      exhibitionId: exhibitionId,
      visitorSession: {
        language: selectedLanguage,
        state: VisitorSessionState.ACTIVE,
        visitorIds: createdVisitors.map((visitor) => visitor.id || "")
      }
    });

    this.setState({
      visitorSessions: [...visitorSessions, createdSession]
    });

    this.clearValues();
  };

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
  };

  /**
   * Event handler for scan tag button click
   */
  private onScanTagClick = () => {
    this.setState({
      mqttScannerOpen: !this.state.mqttScannerOpen
    });
  };

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
        const foundVisitor = await visitorsApi.findVisitor({
          exhibitionId: exhibitionId,
          visitorId: visitor
        });
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
  };

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
  };

  /**
   * Event handler for language change
   *
   * @param event react change event
   * @param child react child node
   */
  private onLanguageChange = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    this.setState({
      selectedLanguage: event.target.value,
      dataChanged: true
    });
  };

  /**
   * Event handler for fetch tag user
   *
   * @param tag selected tag
   */
  private fetchTagUser = (tag: string) => {
    const { visitors } = this.state;

    this.setState({
      selectedVisitor: visitors.find((visitor) => visitor.tagId === tag)
    });
  };

  /**
   * Event handler for tag click
   *
   * @param tag clicked tag
   */
  private fetchTagInfo = async (tag: string) => {
    const { accessToken } = this.props;
    const { visitors } = this.state;

    if (!accessToken) {
      return;
    }

    this.setState({ tagRead: true, contentLoading: true });

    try {
      await this.clearSessionsAndVisitors(tag);

      const visitor = VisitorUtils.fillWithAnonymousData(tag);

      this.setState({
        selectedVisitor: visitor,
        visitors: [...visitors, visitor],
        dataChanged: true,
        contentLoading: false,
        tagRead: false
      });
    } catch (error) {
      console.error(error);
      this.setState({ tagRead: false, contentLoading: false });
    }
  };

  /**
   * Clears all sessions and visitors from all exhibitions for read tag
   *
   * TODO: Add support for reusing visitor data
   *
   * @param tag read tag
   */
  private clearSessionsAndVisitors = async (tag: string) => {
    const { accessToken } = this.props;

    if (!accessToken) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const visitorsApi = Api.getVisitorsApi(accessToken);
    const sessionsApi = Api.getVisitorSessionsApi(accessToken);

    const exhibitions = await exhibitionsApi.listExhibitions();
    for (const exhibition of exhibitions) {
      const [exhibitionVisitors, exhibitionSessions] = await Promise.all([
        visitorsApi.listVisitors({ exhibitionId: exhibition.id!, tagId: tag }),
        sessionsApi.listVisitorSessions({ exhibitionId: exhibition.id!, tagId: tag })
      ]);

      if (!exhibitionVisitors.length && !exhibitionSessions.length) {
        continue;
      }

      if (!window.confirm(strings.visitorsManagement.confirmVisitorDelete)) {
        this.setState({ tagRead: false });
        return Promise.reject();
      }

      try {
        for (const session of exhibitionSessions) {
          await sessionsApi.deleteVisitorSession({
            exhibitionId: exhibition.id!,
            visitorSessionId: session.id!
          });

          for (const visitorId of session.visitorIds) {
            await visitorsApi.deleteVisitor({ exhibitionId: exhibition.id!, visitorId });
          }

          this.setState({
            visitorSessions: this.state.visitorSessions.filter(
              (_session) => _session.id !== session.id
            )
          });
        }
      } catch (error) {
        console.error(error);
      }

      for (const visitor of exhibitionVisitors) {
        try {
          await visitorsApi.deleteVisitor({
            exhibitionId: exhibition.id!,
            visitorId: visitor.id!
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  /**
   * Event handler for remove tag click
   *
   * @param clickedTag clicked tag
   */
  private onRemoveTag = (clickedTag: string) => {
    const { visitors, selectedSession } = this.state;

    const visitorToDelete = visitors.find((visitor) => visitor.tagId === clickedTag);

    this.setState({
      visitors: visitors.filter((visitor) => visitor.tagId !== clickedTag),
      selectedSession: selectedSession && {
        ...selectedSession,
        visitorIds: selectedSession.visitorIds.filter(
          (visitorId) => visitorId !== visitorToDelete?.id
        )
      },
      selectedVisitor: undefined,
      dataChanged: true
    });
  };

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

    const updatedSessionList = produce(visitorSessions, (draft) => {
      const index = draft.findIndex((_session) => _session.id === session.id);
      if (index > -1) {
        draft.splice(index, 1, session);
      }
    });

    const visitors: Visitor[] = [];
    const visitorsApi = Api.getVisitorsApi(accessToken);

    for (const visitorId of session.visitorIds) {
      const foundVisitor = await visitorsApi.findVisitor({ exhibitionId, visitorId });
      visitors.push(foundVisitor);
    }

    this.setState({
      visitorSessions: updatedSessionList,
      selectedSession: session,
      visitors: visitors,
      mqttScannerOpen: false,
      selectedVisitor: visitors.find((visitor) => visitor.tagId === tag)
    });
  };

  /**
   * Event handler for tag register
   *
   * @param tag mqtt tag
   */
  private onTagRegister = (tag: string) => {
    const { visitors, tagRead, selectedSession } = this.state;

    if (
      !!visitors.filter((visitor) => visitor.tagId === tag).length ||
      tagRead ||
      selectedSession
    ) {
      return;
    }

    this.fetchTagInfo(tag);
  };

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
  };

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

    const updatedVisitorList = produce(visitors, (draft) => {
      const index = draft.findIndex((visitor) => visitor.id === updatedVisitor.id);
      if (index > -1) {
        draft.splice(index, 1, updatedVisitor);
      }
    });

    this.setState({
      selectedVisitor: updatedVisitor,
      visitors: updatedVisitorList,
      dataChanged: true
    });
  };

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

    const [visitorVariables, visitorSessions, adminVisitors, contentVersions] = await Promise.all([
      visitorVariablesApi.listVisitorVariables({ exhibitionId }),
      visitorSessionsApi.listVisitorSessions({ exhibitionId }),
      visitorsApi.listVisitors({ exhibitionId, tagId: "adminoverride" }),
      contentVersionsApi.listContentVersions({ exhibitionId })
    ]);

    this.constructAvailableLanguages(contentVersions);

    /**
     * Admin visitors must be filtered out
     */
    const adminVisitorIds = adminVisitors.map((admin) => admin.id);
    const filteredSessions = visitorSessions.filter((session) => {
      const visitorIds = session.visitorIds;
      return visitorIds.every((id) => !adminVisitorIds.includes(id));
    });

    this.setState({
      visitorVariables: visitorVariables,
      visitorSessions: filteredSessions
    });
  };

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
  };

  /**
   * Event handler fo close or cancel click
   */
  private onCloseOrCancelClick = () => {
    this.setState({ deleteDialogOpen: false });
  };

  /**
   * Event handler for session delete click
   */
  private onSessionConfirmDeleteClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { selectedSession, visitorSessions } = this.state;

    if (!accessToken || !selectedSession || !selectedSession.id) {
      return;
    }

    const visitorSessionsApi = Api.getVisitorSessionsApi(accessToken);
    const visitorsApi = Api.getVisitorsApi(accessToken);
    await visitorSessionsApi.deleteVisitorSession({
      exhibitionId: exhibitionId,
      visitorSessionId: selectedSession.id
    });

    for (const visitorId of selectedSession.visitorIds) {
      await visitorsApi.deleteVisitor({ exhibitionId, visitorId });
    }

    this.setState({
      visitorSessions: visitorSessions.filter((session) => session.id !== selectedSession.id)
    });

    this.clearValues();
  };
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
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(VisitorsManagementScreen));
