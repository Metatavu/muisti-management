import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition, setSelectedRoom } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionFloor, ExhibitionRoom } from "../../generated/client";
import { AccessToken, CardMenuOption } from '../../types';
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
  exhibitions: Exhibition[];
  exhibitionId?: string;
  roomId?: string;
  selectedExhibition?: Exhibition;
  selectedRoom?: ExhibitionRoom;
  setSelectedExhibition: typeof setSelectedExhibition;
  setSelectedRoom: typeof setSelectedRoom;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  floors: ExhibitionFloor[];
  rooms: ExhibitionRoom[];
}

/**
 * Component for exhibitions view
 */
export class ExhibitionsPage extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      floors: [],
      rooms: []
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    await this.fetchExhibitionData();
  }

  /**
   * Component did update life cycle handler
   */
  public componentDidUpdate = async () => {
    await this.fetchExhibitionData();
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak, selectedExhibition, selectedRoom } = this.props;
    if (this.state.loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        selectedExhibition={ selectedExhibition }
        selectedRoom={ selectedRoom }
      >
        { this.renderProductionCardsList() }
      </BasicLayout>
    );
  }

  /**
   * Renders exhibitions in production as card list
   */
  private renderProductionCardsList = () => {
    const { exhibitions } = this.props;
    const cardMenuOptions = this.getCardMenuOptions();
    const cards = exhibitions.map(exhibition => {
      const exhibitionId = exhibition.id;
      if (!exhibitionId) {
        return null;
      }

      return (
        <CardItem
          key={ exhibition.id }
          title={ exhibition.name }
          onClick={ () => this.onCardClick(exhibitionId) }
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
   * Fetches exhibition data if exhibition is selected
   */
  private fetchExhibitionData = async () => {
    const { accessToken, exhibitions, exhibitionId, selectedExhibition, roomId, selectedRoom } = this.props;

    if (!exhibitionId) {
      this.props.setSelectedExhibition(undefined);
      return;
    }

    if (!selectedExhibition || selectedExhibition.id !== exhibitionId) {
      this.props.setSelectedExhibition(exhibitions.find(exhibition => exhibition.id === exhibitionId));
    }

    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const rooms = await exhibitionRoomsApi.listExhibitionRooms({ exhibitionId });
    this.setState({ rooms: rooms });

    if (!roomId) {
      this.props.setSelectedRoom(undefined);
      return;
    }

    if (!selectedRoom || selectedRoom.id !== roomId) {
      this.props.setSelectedRoom(rooms.find(room => room.id === roomId));
    }
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
   */
  private onCardClick = (exhibitionId: string) => {
    this.props.history.push(`/exhibitions/${exhibitionId}`);
  }

  /**
   * Set status handler
   */
  private setStatus = () => {
    alert(strings.comingSoon);
    return;
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
    setSelectedExhibition: (exhibition: Exhibition) => dispatch(setSelectedExhibition(exhibition)),
    setSelectedRoom: (room: ExhibitionRoom) => dispatch(setSelectedRoom(room))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionsPage));
