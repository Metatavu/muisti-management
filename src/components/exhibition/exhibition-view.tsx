import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { Exhibition } from "../../generated/client";
import BasicLayout from "../generic/basic-layout";
import ViewSelectionBar from "../editor-panes/view-selection-bar";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken } from '../../types';

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History,
  keycloak: KeycloakInstance,
  accessToken: AccessToken,
  exhibition: Exhibition
}

/**
 * Component state
 */
interface State {
  error?: Error,
  loading: boolean
}

/**
 * Component for exhibition view
 */
export class ExhibitionView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {

  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes } = this.props;

    if (this.state.loading) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    return (
      <BasicLayout title={ this.props.exhibition.name } onBackButtonClick={() => this.onBackButtonClick() } keycloak={ this.props.keycloak } error={ this.state.error } clearError={ () => this.setState({ error: undefined }) }>
        <div className={ classes.editorLayout }>
          <ViewSelectionBar />
          <ElementNavigationPane />
          <EditorView />
          <ElementSettingsPane />
        </div>
      </BasicLayout>
    );
  }
  /**
   * Handle back
   */
  private onBackButtonClick = () => {
    this.props.history.push(`/`);
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
    exhibition: state.exhibition.exhibition as Exhibition
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionView));