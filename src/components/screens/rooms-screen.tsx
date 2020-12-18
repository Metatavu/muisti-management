import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, ListItem, List, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import { AccessToken, ActionButton, BreadcrumbData } from '../../types';
import Api from "../../api/api";
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ArrowIcon from "@material-ui/icons/ChevronRight";

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
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { exhibition } = this.state;
    const breadcrumbs = this.getBreadcrumbsData();

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={ keycloak }
          history={ history }
          title={ exhibition?.name || "" }
          breadcrumbs={ breadcrumbs }
        >
          <div className={ classes.loader }>
            <CircularProgress size={ 50 } color="secondary"></CircularProgress>
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ exhibition?.name || "" }
        breadcrumbs={ breadcrumbs }
      >
        { this.renderRoomCardsList() }
        <ElementSettingsPane
          open={ true }
          title={ strings.exhibition.exhibitionManagement }
          width={ 320 }
        >
          <List disablePadding>
            <ListItem button onClick={ () => this.onReceptionNavigationClick() }>
              <ListItemText primary={ strings.exhibition.reception } />
              <ListItemSecondaryAction>
                <ArrowIcon />
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem button onClick={ () => this.onVisitorVariablesNavigationClick() }>
              <ListItemText primary={ strings.exhibition.visitorVariablesManagement } />
              <ListItemSecondaryAction>
                <ArrowIcon />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </ElementSettingsPane>
      </BasicLayout>
    );
  }

  /**
   * Renders rooms as card list
   */
  private renderRoomCardsList = () => {
    const { rooms, exhibition } = this.state;
    const cardMenuOptions = this.getCardMenuOptions();
    const cards = rooms.map(room => {
      const roomId = room.id;
      const floorId = room.floorId;
      if (!roomId || !exhibition || !floorId) {
        return null;
      }

      return (
        <CardItem
          key={ roomId }
          title={ room.name }
          subtitle={ exhibition.name }
          onClick={ () => this.onCardClick(roomId, floorId) }
          menuOptions={ cardMenuOptions }
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
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.setStatus,
      action: this.setStatus
    }];
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
      { name: strings.exhibitions.listTitle, url: "/exhibitions" },
      { name: exhibition?.name || "" }
    ] as BreadcrumbData[];
  }

  /**
   * Event handler for card click
   * 
   * @param roomId room id
   */
  private onCardClick = (roomId: string, floorId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/floors/${floorId}/rooms/${roomId}`);
  }

  /**
   * Event handler for reception navigation click
   */
  private onReceptionNavigationClick = () => {
    const { pathname } = this.props.history.location;
    const exhibitionPath = pathname.split("/content")[0];
    this.props.history.replace(`${ exhibitionPath }/reception`);
  }

  /**
   * Event handler for visirot variables navigation click
   */
  private onVisitorVariablesNavigationClick = () => {
    const { pathname } = this.props.history.location;
    const exhibitionPath = pathname.split("/content")[0];
    this.props.history.replace(`${ exhibitionPath }/visitorVariables`);
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RoomsScreen));
