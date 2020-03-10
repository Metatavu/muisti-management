import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, Typography } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { Exhibition } from "../../generated/client";
import BasicLayout from "../generic/basic-layout";
import ViewSelectionBar from "../editor-panes/view-selection-bar";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken } from '../../types';
import { setExhibition } from "../../actions/exhibition";
import Api from "../../api/api";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  exhibition?: Exhibition;
  setExhibition: typeof setExhibition;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
}

/**
 * Component for exhibition view
 */
export class ExhibitionDeviceGroupView extends React.Component<Props, State> {

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
    const { exhibition, exhibitionId, accessToken } = this.props;

    if (!exhibition || exhibitionId === exhibition.id) {
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      this.props.setExhibition(await exhibitionsApi.findExhibition({ exhibitionId: exhibitionId }));
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, exhibition, history } = this.props;

    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    const locationPath = history.location.pathname;

    return (
      <BasicLayout title={ exhibition.name } 
        onBackButtonClick={() => this.onBackButtonClick() } 
        keycloak={ this.props.keycloak } 
        error={ this.state.error } 
        clearError={ () => this.setState({ error: undefined }) }>
          
        <div className={ classes.editorLayout }>
          <ViewSelectionBar exhibitionId={ exhibition.id } locationPath={ locationPath } />
          <ElementNavigationPane title="Näyttelypiste" />
          <EditorView>
            <Typography>Olen näyttelyn laiteryhmän editorin sisältö</Typography>
          </EditorView>
          <ElementSettingsPane title="Ominaisuudet" />
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
    setExhibition: (exhibition: Exhibition) => dispatch(setExhibition(exhibition))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionDeviceGroupView));