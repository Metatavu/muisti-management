import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setExhibitions } from "../../actions/exhibitions";

// eslint-disable-next-line max-len
import { WithStyles, withStyles, Button, Divider, Container, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions } from "@material-ui/core";
import styles from "../../styles/dashboard-layout";
import { History } from "history";
import strings from "../../localization/strings";
import DashboardNavigation from "./dashboard-navigation";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import Api from "../../api/api";
import { Exhibition } from "../../generated/client";
import ErrorDialog from "../generic/error-dialog";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  error?: string | Error;
  clearError?: () => void;
  history: History;
  children?: React.ReactNode;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions?: Exhibition[];
  setExhibitions: typeof setExhibitions;
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
  creating: boolean;
  createDialogOpen: boolean;
  createDialogName: string;
}

/**
 * Component for dashboard base layout
 */
class DashboardLayout extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      creating: false,
      createDialogOpen: false,
      createDialogName: ""
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history } = this.props;
    const locationPath = history.location.pathname;

    return (
      <div className={ classes.root }>
        <header className={ classes.header }>
          {
            this.renderHeader()
          }
        </header>
        <div className={ classes.navigation }>
          <div className={ classes.userElement }>
              <div className={ classes.userAvatar }>TR</div>
              <h3>Timo</h3>
          </div>
          <Divider variant="middle" color="#ddd" />
          <div className={ classes.navigationContent }>
            <DashboardNavigation locationPath={ locationPath } />
          </div>
        </div>
        <div className={ classes.content }>
          <Container >
            { this.props.children }
          </Container>
        </div>
        { this.renderCreateDialog() }
        { this.renderErrorDialog() }
      </div>
    );
  }

  /**
   * Render header
   */
  private renderHeader = () => {
    const { classes } = this.props;

    return (
      <Button className={ classes.newExhibitionBtn } onClick={ this.onCreateButtonClick }>{ strings.dashboard.newExhibitionButton }</Button>
    );
  }

  /**
   * Renders create exhibition dialog
   */
  private renderCreateDialog = () => {
    return (
      <Dialog open={ this.state.createDialogOpen } onClose={ this.onCreateDialogClose }>
        <DialogTitle>{ strings.exhibitions.createExhibitionDialog.title }</DialogTitle>
        <DialogContent>
          <DialogContentText>
            { strings.exhibitions.createExhibitionDialog.helpText }
          </DialogContentText>
          <TextField value={ this.state.createDialogName }
            onChange={event => this.setState({ createDialogName: event.target.value }) }
            autoFocus
            margin="dense"
            id="name"
            label={ strings.exhibitions.createExhibitionDialog.nameLabel } type="text" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={ this.onCreateDialogCancelClick } color="primary">
            { strings.exhibitions.createExhibitionDialog.cancelButton }
          </Button>
          <Button onClick={ this.onDialogCreateButtonClick } color="primary">
            { strings.exhibitions.createExhibitionDialog.createButton }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Renders error dialog
   */
  private renderErrorDialog = () => {
    if (this.props.error && this.props.clearError) {
      return <ErrorDialog error={ this.props.error } onClose={ this.props.clearError } />
    }

    return null;
  }

  /**
   * Creates new exhibition
   *
   * @param name exhibition name
   */
  private createExhibition = async (name: string) => {
    this.setState({
      creating: true
    });

    const exhibitionsApi = Api.getExhibitionsApi(this.props.accessToken);

    const exhibition = await exhibitionsApi.createExhibition({
      exhibition: {
        name: name
      }
    });

    this.props.setExhibitions([ ...this.props.exhibitions || [], exhibition ]);
  }

  /**
   * Closes a create dialog
   */
  private closeCreateDialog = () => {
    this.setState({
      createDialogOpen: false
    });
  }

  /**
   * Event handler for create button click
   */
  private onCreateButtonClick = () => {
    this.setState({
      createDialogOpen: true
    });
  }

  /**
   * Event handler for create dialog create button click
   */
  private onDialogCreateButtonClick = async () => {
    await this.createExhibition(this.state.createDialogName);

    this.setState({
      createDialogName: ""
    });

    this.closeCreateDialog();
  }

  /**
   * Event handler for create dialog cancel button click
   */
  private onCreateDialogCancelClick = () => {
    this.closeCreateDialog();
  }

  /**
   * Event handler for create dialog close event
   */
  private onCreateDialogClose = () => {
    this.closeCreateDialog();
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
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setExhibitions: (exhibitions: Exhibition[]) => dispatch(setExhibitions(exhibitions))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardLayout));