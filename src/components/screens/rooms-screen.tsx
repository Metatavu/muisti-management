import Api from "../../api/api";
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import { AccessToken, BreadcrumbData } from "../../types";
import CardItem from "../generic/card/card-item";
import CardList from "../generic/card/card-list";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ArrowIcon from "@mui/icons-material/ChevronRight";
import {
  CircularProgress,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";

/**
 * Component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak?: KeycloakInstance;
  accessToken?: AccessToken;
  exhibitionId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  exhibition?: Exhibition;
  rooms: ExhibitionRoom[];
}

/**
 * Component for rooms screen
 */
class RoomsScreen extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      rooms: []
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
    const { exhibition } = this.state;
    const breadcrumbs = this.getBreadcrumbsData();

    if (!keycloak) {
      return null;
    }

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={keycloak}
          history={history}
          title={exhibition?.name || ""}
          breadcrumbs={breadcrumbs}
        >
          <div className={classes.loader}>
            <CircularProgress size={50} color="secondary" />
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={exhibition?.name || ""}
        breadcrumbs={breadcrumbs}
      >
        {this.renderRoomCardsList()}
        <ElementSettingsPane
          open={true}
          title={strings.exhibition.exhibitionManagement}
          width={320}
        >
          <List disablePadding>
            {this.renderExhibitionManagementLink(strings.exhibition.visitors, "visitors", true)}
            {this.renderExhibitionManagementLink(strings.exhibition.reception, "reception", true)}
            {this.renderExhibitionManagementLink(
              strings.exhibition.visitorVariables,
              "visitorVariables"
            )}
            {this.renderExhibitionManagementLink(
              strings.exhibition.resetVisitorVariables,
              "resetVisitorVariables"
            )}
            {this.renderExhibitionManagementLink(strings.exhibition.diagnostics, "diagnostics")}
          </List>
        </ElementSettingsPane>
      </BasicLayout>
    );
  };

  /**
   * Renders exhibition management link
   *
   * @param title link
   * @param path path
   * @param resetPath should path reset
   */
  private renderExhibitionManagementLink = (title: string, path: string, resetPath?: boolean) => {
    return (
      <ListItem button onClick={this.navigateTo(path, resetPath)}>
        <ListItemText primary={title} />
        <ListItemSecondaryAction>
          <ArrowIcon />
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  /**
   * Renders rooms as card list
   */
  private renderRoomCardsList = () => {
    const { rooms, exhibition } = this.state;
    const cards = rooms.map((room) => {
      const roomId = room.id;
      const floorId = room.floorId;
      if (!roomId || !exhibition || !floorId) {
        return null;
      }

      return (
        <CardItem
          key={roomId}
          title={room.name}
          subtitle={exhibition.name}
          onClick={() => this.onCardClick(roomId, floorId)}
        />
      );
    });

    return <CardList title={strings.contentVersion.rooms}>{cards}</CardList>;
  };

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId } = this.props;

    if (!accessToken) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const [exhibition, rooms] = await Promise.all([
      exhibitionsApi.findExhibition({ exhibitionId }),
      exhibitionRoomsApi.listExhibitionRooms({ exhibitionId })
    ]);

    this.setState({ exhibition, rooms });
  };

  /**
   * Get breadcrumbs data
   *
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { exhibition } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/exhibitions" },
      { name: exhibition?.name || "" }
    ] as BreadcrumbData[];
  };

  /**
   * Navigates to given exhibition management path
   *
   * @param path path as string
   */
  private navigateTo = (path: string, resetPath?: boolean) => () => {
    const { pathname } = this.props.history.location;
    const exhibitionPath = pathname.split("/content")[0];
    if (resetPath) {
      this.props.history.replace(`${exhibitionPath}/${path}`);
    } else {
      this.props.history.push(`${exhibitionPath}/${path}`);
    }
  };

  /**
   * Event handler for card click
   *
   * @param roomId room id
   */
  private onCardClick = (roomId: string, floorId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/floors/${floorId}/rooms/${roomId}`);
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak,
  accessToken: state.auth.accessToken
});

export default connect(mapStateToProps)(withStyles(styles)(RoomsScreen));
