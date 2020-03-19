import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, Typography, ButtonGroup, Button } from "@material-ui/core";
import { TreeView, TreeItem } from "@material-ui/lab";
import { KeycloakInstance } from "keycloak-js";
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import BasicLayoutV3 from "../generic/basic-layout-v3";
import ViewSelectionBar from "../editor-panes/view-selection-bar";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken } from '../../types';
import strings from "../../localization/strings";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  exhibition?: Exhibition;
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  exhibitionRooms?: ExhibitionRoom[];
}

/**
 * Component for exhibition view
 */
export class ExhibitionViewV3 extends React.Component<Props, State> {

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
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { exhibition, exhibitionId, accessToken } = this.props;

    if (!exhibition || exhibitionId === exhibition.id) {
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      this.props.setSelectedExhibition(await exhibitionsApi.findExhibition({ exhibitionId }));
    }

    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const exhibitionRooms = await exhibitionRoomsApi.listExhibitionRooms({ exhibitionId });

    this.setState({ exhibitionRooms });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, exhibition , history } = this.props;
    const { exhibitionRooms } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    const locationPath = history.location.pathname;

    return (
      <BasicLayoutV3
        title={ exhibition.name }
        onDashboardButtonClick={() => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ViewSelectionBar exhibitionId={ exhibition.id } locationPath={ locationPath }/>
          <ElementNavigationPane title="">
            <ButtonGroup>
              <Button>{ strings.exhibition.content }</Button>
              <Button>{ strings.exhibition.tech }</Button>
            </ButtonGroup>
            <TreeView>
              <TreeItem nodeId={ exhibition.id } label={ exhibition.name }>
                { exhibitionRooms &&
                  exhibitionRooms.map(room => this.renderExhibitionRoomTreeItem(room))
                }
              </TreeItem>
            </TreeView>
          </ElementNavigationPane>
          <EditorView>
            <Typography>Olen näyttelyeditorin v3 sisältö { history.location.pathname } </Typography>
          </EditorView>
          <ElementSettingsPane title="2. Huone 1" />
        </div>

      </BasicLayoutV3>
    );
  }

  /**
   * Renders exhibition room tree item
   *
   * @param room exhibition room
   */
  private renderExhibitionRoomTreeItem = (room: ExhibitionRoom) => {
    return <TreeItem nodeId={ room.id! } label={ room.name }></TreeItem>;
  }

  /**
   * Handle dashboard click
   */
  private onDashboardButtonClick = () => {
    this.props.history.push(`/dashboard/overview`);
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
    exhibition: state.exhibitions.selectedExhibition as Exhibition
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionViewV3));