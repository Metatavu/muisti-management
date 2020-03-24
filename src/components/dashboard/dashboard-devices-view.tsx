import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

// eslint-disable-next-line max-len
import { WithStyles, withStyles, Typography, Select, MenuItem, Grid, Divider, ListItemAvatar, ListItem, Avatar, List, ListItemText, CircularProgress, IconButton } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import styles from "../../styles/dashboard-recent-view";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import { Exhibition, ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardLayout from "./dashboard-layout";
import moment from "moment";
import defaultExhibitionImage from "../../resources/gfx/muisti-logo.png";
import Api from "../../api/api";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Interface representing component state
 */
interface State {
  error?: string | Error;
  devices: ExhibitionDevice[];
  loading: boolean;
}

/**
 * Component for dashboard devices view
 */
class DashboardDevicesView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      devices: []
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    this.setState({
      loading: true
    });

    try {
      const { accessToken } = this.props;
      const devicesApi = Api.getExhibitionDevicesApi(accessToken);
      const devices: ExhibitionDevice[] = await devicesApi.listExhibitionDevices({ exhibitionId: "" });

      this.setState({ devices });
    } catch (error) {
      this.setState({ error });
    }

    this.setState({
      loading: false
    });
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history } = this.props;

    const filterOptions = [
      { name: strings.filtering.dashboard.devices.all , value: "ALL" }
    ];

    const devices = this.state.devices && this.state.devices.map(device => this.renderDeviceListItem(device));

    if (this.state.loading) {
      return (
        <DashboardLayout history={ history }>
          <CircularProgress />
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout history={ history }>
        <div className={ classes.titleGrid }>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item key="title">
              <Typography variant="h2" component="span">
                { strings.dashboard.devices.title }
              </Typography>
            </Grid>
            <Grid item key="list-functions">
              <Select id="select-filtering" defaultValue="ALL">
                { filterOptions.map(option =>
                  <MenuItem value={ option.value } key={ option.value }>{ option.name }</MenuItem>
                )}
              </Select>
              <IconButton>
                <SearchIcon />
              </IconButton>
            </Grid>
          </Grid>
        </div>
        <Divider />
        <div className={ classes.content }>
          <List>
            { devices &&
              devices
            }
          </List>
        </div>
    </DashboardLayout>
    );
  }

  /**
   * Renders device list item
   */
  private renderDeviceListItem = (device: ExhibitionDevice) => {

    const deviceId = device.id;
    if (!deviceId) {
      return;
    }

    return (
      <ListItem>
        <ListItemAvatar>
          <Avatar src={ defaultExhibitionImage } />
        </ListItemAvatar>
        <ListItemText primary={ device.name } secondary={ `${ strings.dashboard.recent.lastModified } ${ moment(device.modifiedAt).fromNow() }` } />
      </ListItem>
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
    setSelectedExhibition: (exhibition: Exhibition) => dispatch(setSelectedExhibition(exhibition))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardDevicesView));