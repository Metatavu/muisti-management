import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import Api from "../../api/api";
import { History } from "history";
import styles from "../../styles/floor-plan-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionFloor, ExhibitionRoom, ContentVersion } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, BreadcrumbData } from "../../types";
import strings from "../../localization/strings";
import "cropperjs/dist/cropper.css";
import { LatLngExpression, LatLngBounds } from "leaflet";
import FloorPlanMap from "../generic/floor-plan-map";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId?: string;
  exhibitionFloorId?: string;
  roomId?: string;
  contentVersionId?: string;
  exhibitions: Exhibition[];
  readOnly: boolean;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  name: string;
  toolbarOpen: boolean;

  exhibition?: Exhibition;
  exhibitionFloor?: ExhibitionFloor;
  room?: ExhibitionRoom;
  contentVersion?: ContentVersion;
  breadCrumbs: BreadcrumbData[];
}

/**
 * Component for exhibition floor plan editor
 */
export class FloorPlanEditorView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      name: "",
      toolbarOpen: true,
      breadCrumbs: []
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.loadViewData();
    this.setState({ loading: false });
  }

  /**
   * Component did update life-cycle handler
   */
  public componentDidUpdate = async (prevProps: Props) => {
    if (prevProps.exhibitions !== this.props.exhibitions) {
      this.setState({ loading: true });
      await this.loadViewData();
      this.setState({ loading: false });
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history, keycloak } = this.props;
    const { exhibition, breadCrumbs } = this.state;
    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ exhibition.name }
        breadcrumbs={ breadCrumbs }
        actionBarButtons={ actionBarButtons }
        onDashboardButtonClick={ () => this.onDashboardButtonClick() }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }
      >

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.floorPlan.title }>
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditor() }
          </EditorView>
          <ElementSettingsPane open={ true } width={ 320 } title={ strings.floorPlan.properties.title }>
          </ElementSettingsPane>
        </div>

      </BasicLayout>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditor = () => {
    const { exhibitionFloor, room } = this.state;
    const { exhibitionId, readOnly } = this.props;

    if (exhibitionFloor && exhibitionFloor.floorPlanUrl && exhibitionFloor.floorPlanBounds) {
      const floorBounds = exhibitionFloor.floorPlanBounds;
      const swCorner = floorBounds.southWestCorner;
      const neCorner = floorBounds.northEastCorner;
      const sw: LatLngExpression = [ swCorner.longitude, swCorner.latitude ];
      const ne: LatLngExpression = [ neCorner.longitude, neCorner.latitude ];
      const bounds = new LatLngBounds(sw, ne);

      const floorPlanInfo = {
        bounds: bounds,
        url: exhibitionFloor.floorPlanUrl,
        imageHeight: 965,
        imageWidth: 1314,
        readOnly: readOnly
      };

      const selectedItems = {
        floor: exhibitionFloor,
        room: room
      };

      return (
        <FloorPlanMap
          mapData={{ }}
          floorPlanInfo={ floorPlanInfo }
          selectedItems={ selectedItems }
          exhibitionId={ exhibitionId }
        />
      );
    }
    return null;
  }

  /**
   * Loads view data
   */
  private loadViewData = async () => {
    const { exhibitionId, roomId, contentVersionId, accessToken } = this.props;

    const breadCrumbs: BreadcrumbData[] = [];

    breadCrumbs.push({ name: strings.exhibitions.listTitle, url: "/v4/exhibitions" });
    if (!exhibitionId) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const [ exhibition ] = await Promise.all<Exhibition>([
      exhibitionsApi.findExhibition({ exhibitionId }),
    ]);

    breadCrumbs.push({ name: exhibition?.name, url: `/v4/exhibitions/${exhibitionId}/floorplan` });
    this.setState({ exhibition, breadCrumbs });

    if (!roomId) {
      return;
    }

    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(accessToken);
    const [ room ] = await Promise.all<ExhibitionRoom>([
      exhibitionRoomsApi.findExhibitionRoom({ exhibitionId: exhibitionId, roomId: roomId })
    ]);

    if (!room) {
      return;
    }

    const [ floor ] = await Promise.all<ExhibitionFloor>([
      exhibitionFloorsApi.findExhibitionFloor({ exhibitionId: exhibitionId, floorId: room.floorId }),
    ]);

    breadCrumbs.push({ name: room?.name, url: `/v4/exhibitions/${exhibitionId}/floorplan/floors/${room?.floorId}/rooms/${roomId}` });
    this.setState({ exhibitionFloor: floor, room: room, breadCrumbs });

    if (!contentVersionId) {
      return;
    }

    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const [ contentVersion ] = await Promise.all<ContentVersion>([
      contentVersionsApi.findContentVersion({ exhibitionId: exhibitionId, contentVersionId: contentVersionId })
    ]);

    breadCrumbs.push({ name: contentVersion?.name || "" });

    this.setState({ contentVersion, breadCrumbs });

  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
    ] as ActionButton[];
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FloorPlanEditorView));