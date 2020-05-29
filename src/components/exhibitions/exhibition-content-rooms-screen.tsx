import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import { AccessToken, CardMenuOption, BreadcrumbData } from '../../types';
import Api from "../../api/api";
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../generic/basic-layout";

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
  exhibition?: Exhibition;
  rooms: ExhibitionRoom[];
}

/**
 * Component for exhibition content rooms view
 */
class ExhibitionContentRoomsScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      rooms: []
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    await this.fetchData();
    this.setState({ loading: false });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { exhibition } = this.state;
    if (this.state.loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const breadcrumbs = this.getBreadcrumbsData();
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ exhibition?.name || "" }
        breadcrumbs={ breadcrumbs }
      >
        { this.renderRoomCardsList() }
      </BasicLayout>
    );
  }

  /**
   * Renders rooms as card list
   */
  private renderRoomCardsList = () => {
    const { rooms } = this.state;
    const cardMenuOptions = this.getCardMenuOptions();
    const cards = rooms.map(room => {
      const roomId = room.id;
      if (!roomId) {
        return null;
      }

      return (
        <CardItem
          key={ roomId }
          title={ room.name }
          onClick={ () => this.onCardClick(roomId) }
          cardMenuOptions={ cardMenuOptions }
          status={ strings.exhibitions.status.ready }
        />
      );
    });

    return (
      <CardList title={ strings.exhibitions.inProduction }>
        { cards }
      </CardList>
    );
  }

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId } = this.props;

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const [ exhibition, rooms ] = await Promise.all<Exhibition, ExhibitionRoom[]>([
      exhibitionsApi.findExhibition({ exhibitionId }),
      exhibitionRoomsApi.listExhibitionRooms({ exhibitionId })
    ]);

    this.setState({ exhibition, rooms });
  }

  /**
   * Get card menu options
   *
   * @returns card menu options as array
   */
  private getCardMenuOptions = (): CardMenuOption[] => {
    return [{
      name: strings.exhibitions.cardMenu.setStatus,
      action: this.setStatus
    }];
  }

  /**
   * Event handler for card click
   * 
   * @param roomId room id
   */
  private onCardClick = (roomId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/rooms/${roomId}`);
  }

  /**
   * Set status handler
   */
  private setStatus = () => {
    alert(strings.comingSoon);
    return;
  }

  /**
   * Get breadcrumbs data
   * 
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { exhibition } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/v4/exhibitions" },
      { name: exhibition?.name || "" }
    ] as BreadcrumbData[];
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
    accessToken: state.auth.accessToken as AccessToken
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionContentRoomsScreen));
