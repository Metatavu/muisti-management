import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { AccessToken } from "../../types";

import { WithStyles, withStyles, Drawer } from "@material-ui/core";
import styles from "../../styles/element-navigation-pane";
import { ExhibitionRoom, ExhibitionDevice, Exhibition } from "../../generated/client";
import { KeycloakInstance } from "keycloak-js";
import Api from "../../api/api";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  keycloak: KeycloakInstance,
  accessToken: AccessToken,
  exhibition?: Exhibition
}

/**
 * Interface representing component state
 */
interface State {
  error?: Error,
  loading: boolean,
  exhibitionRooms: ExhibitionRoom[],
  exhibitionDevices: ExhibitionDevice[]
}

/**
 * Component for element navigation pane
 */
class ElementNavigationPane extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      exhibitionRooms: [],
      exhibitionDevices: []
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    const { accessToken, exhibition } = this.props;
    
    if (!exhibition || !exhibition.id) {
      return;
    }

    this.setState({
      loading: true
    });

    try {
      const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
      const exhibitionRooms: ExhibitionRoom[] = await exhibitionRoomsApi.listExhibitionRooms({ exhibitionId: exhibition.id });

      this.setState({
        exhibitionRooms: exhibitionRooms
      });
    } catch (e) {
      this.setState({
        error: e
      });
    }

    this.setState({
      loading: false
    });
  }

  /**
   * Render basic layout
   */
  public render() {
    return (
      <div>
        <Drawer variant="persistent" anchor="left" open={ true }>

        </Drawer>
        { this.props.children }
      </div>
    );
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
    exhibition: state.exhibition.exhibition
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ElementNavigationPane));