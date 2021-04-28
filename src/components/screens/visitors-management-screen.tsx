import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../../api/api";
import { Box, Button, Checkbox, CircularProgress, Divider, FormControlLabel, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, TextField, Toolbar, Typography, WithStyles, withStyles } from "@material-ui/core";
import { Exhibition, VisitorVariable, VisitorVariableType } from "../../generated/client";
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

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  exhibitionId: string;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  dataChanged: boolean;
  visitorVariables: VisitorVariable[];
  selectedVisitorVariable?: VisitorVariable;
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
      dataChanged: false,
      visitorVariables: [],
    }
  };

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchEditorData();
    this.setState({ loading: false });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history } = this.props;
    const { loading, dataChanged } = this.state;

    if (loading) {
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
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }
        dataChanged={ dataChanged }
        openDataChangedPrompt={ true }
      >
        <Box className={ classes.editorLayout }>
          <ElementNavigationPane
            width={ 320 }
            title={ strings.visitorsManagement.activeVisitorSessions }
            actionButtonClick={ this.onAddNewSessionClick }
            actionButtonIcon={ <AddIcon /> }
          >
            { this.renderActiveSessions }
          </ElementNavigationPane>
          { this.renderContent() }
          <ElementPropertiesPane
            open={ true }
          >
            { this.renderSessionVariables() }
          </ElementPropertiesPane>
        </Box>
      </BasicLayout>
    )
  };

  /**
   * Renders active sessions
   */
  private renderActiveSessions = () => {
    return (
      <Box>
        <Box p={ 2 } display="flex" alignItems="center">
          <TextField
            placeholder={ strings.visitorsManagement.search }
          />
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
          <ListItem button>
            <ListItemText
              primary={`1 ${strings.visitorsManagement.visitor} - 14:32`}
              secondary={ "5:45" }
            />
            <ListItemSecondaryAction>
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>
    );
  }

  /**
   * Render content
   */
  private renderContent = () => {
    return (
      <Box p={ 4 }>
        <Typography variant="h2">
          { strings.visitorsManagement.startNewSession }
        </Typography>
        <Box mt={ 2 } mb={ 2 }>
          <Typography>
            { strings.visitorsManagement.scanTicketsHelp }
          </Typography>
          <Typography>
            { strings.visitorsManagement.sessionDuration }
          </Typography>
        </Box>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={ true }
              name="anonymous"
            />
          }
          label={ strings.visitorsManagement.fillWithAnonymousData }
        />
        <Box display="flex">
          { this.renderTagList() }
          { this.renderTagInformation() }
        </Box>
      </Box>
    );
  }

  /**
   * Render session visitor tags
   */
  private renderTagList = () => {
    return (
      <Box
        flex={ 1 }
        p={ 2 }
        mr={ 4 }
        bgcolor={ theme.palette.background.default }
      >
        <List>
          <ListItem button selected={ true }>
            <ListItemText primary={`${strings.visitorsManagement.tag} ${"ASDF123467"}`} />
            <ListItemSecondaryAction>
              <IconButton>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Box>
    );
  }

  /**
   * Render session visitor tag information
   */
  private renderTagInformation = () => {
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
        { this.renderContactInfoField() }
        { this.renderContactInfoField() }
        { this.renderContactInfoField() }
        { this.renderContactInfoField() }
      </Box>
    );
  }

  /**
   * Render contact information textfield
   */
  private renderContactInfoField = () => {
    return (
      <Box mt={ 2 }>
        <TextField
          label="Etunimi*"
        />
      </Box>
    );
  }

  /**
   * Render visitor session variables
   */
  private renderSessionVariables = () => {
    return (
      <Box p={ 2 }>
        <Typography variant="h3">
          { strings.visitorVariables.title }
        </Typography>
        { this.renderSelectInput() }
        { this.renderSelectInput() }
        { this.renderSelectInput() }
        { this.renderSelectInput() }
      </Box>
    );
  }
  
  /**
   * Render visitor session variable select component
   */
  private renderSelectInput = () => {
    return (
      <Box
        mt={ 2 }
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Box mr={ 2 }>
          <Typography>tarinavalinta</Typography>
        </Box>
        <TextField
          select
          label={ strings.visitorsManagement.selection }
        >
        {/* TODO: map available values */}
        </TextField>
      </Box>
    );
  }

  /**
   * Returns action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { dataChanged } = this.state;

    return [
      {
        name: strings.generic.clear,
        action: this.onClearClick,
        disabled : !dataChanged
      },
      {
        name: strings.visitorsManagement.startSession,
        action: this.onStartClick,
        disabled : !dataChanged
      }
    ];
  }

  /**
   * Fetches editor data
   */
  private fetchEditorData = async () => {
    const { accessToken, exhibitionId } = this.props;

    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);
    const visitorVariables = await visitorVariablesApi.listVisitorVariables({
      exhibitionId: exhibitionId
    });

    this.setState({
      visitorVariables: visitorVariables
    });

  }

  /**
   * Event handler for add new session button click
   */
  private onAddNewSessionClick = () => {

  }

  /**
   * Event handler for scan tag button click
   */
  private onScanTagClick = () => {

  }

  /**
   * Event handler for clear session button click
   */
  private onClearClick = () => {

  }

  /**
   * Event handler for start session button click
   */
  private onStartClick = () => {

  }
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