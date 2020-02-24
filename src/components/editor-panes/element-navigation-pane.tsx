import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { AccessToken } from "../../types";
import CloseIcon from "@material-ui/icons/ChevronLeftSharp";
import OpenIcon from "@material-ui/icons/ChevronRightSharp";
import { WithStyles, withStyles, IconButton } from "@material-ui/core";
import styles from "../../styles/element-navigation-pane";
import { ExhibitionRoom, ExhibitionDevice, Exhibition } from "../../generated/client";
import { KeycloakInstance } from "keycloak-js";
import Api from "../../api/api";
import classNames from "classnames";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  keycloak: KeycloakInstance,
  accessToken: AccessToken,
  exhibition?: Exhibition,
  title: string
}

/**
 * Interface representing component state
 */
interface State {
  error?: Error,
  loading: boolean,
  exhibitionRooms: ExhibitionRoom[],
  exhibitionDevices: ExhibitionDevice[],
  open: boolean
}

const minWidth = 320;
const minimizedWidth = 50;

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
      exhibitionDevices: [],
      open: true
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
    const { classes } = this.props;

    return (
      <div className={ classes.root } style={{ width: this.state.open ? minWidth : minimizedWidth }}>
        <div className={ classes.btnContainer }>
          <IconButton size="small" edge="start" onClick={ this.onToggleClick }>
            { this.state.open ? <CloseIcon /> : <OpenIcon /> }
          </IconButton>
        </div>
        <div className={ classNames( classes.container, this.state.open ? "" : "closed" ) }>
          <div className={ classes.header }>
            <h3>{ this.props.title }</h3>
          </div>
          <div className={ classes.content }>
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
  /**
   * Handle toggle panel
   */
  private onToggleClick = () => {
    this.setState({
      open: !this.state.open
    });
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