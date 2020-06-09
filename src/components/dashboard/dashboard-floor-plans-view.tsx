import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";

// eslint-disable-next-line max-len
import { WithStyles, withStyles, Typography, Grid, Divider, CircularProgress, List, ListItem, ListItemAvatar, Avatar, ListItemText } from "@material-ui/core";
import styles from "../../styles/dashboard-component-styles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import { Exhibition, ExhibitionFloor } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardFloorPlan from "./dashboard-floor-plan";
import defaultFloorPlanImage from "../../resources/gfx/muisti-logo.png";
import Api from "../../api/api";

/**
 * Exhibition floor map
 */
type ExhibitionFloorMap = { [key: string]: ExhibitionFloor[] };

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
}

/**
 * Interface representing component state
 */
interface State {
  error?: string | Error;
  loading: boolean;
  exhibitionFloors?: ExhibitionFloorMap;
}

/**
 * Component for dashboard floor plans view
 */
class DashboardFloorPlansView extends React.Component<Props, State> {

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
    this.loadViewData(this.props.exhibitions);
  }

  /**
   * Component did update life-cycle handler
   */
  public componentDidUpdate(prevProps: Props) {
    if (prevProps.exhibitions !== this.props.exhibitions) {
      this.loadViewData(this.props.exhibitions);
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history } = this.props;

    if (this.state.loading || !this.state.exhibitionFloors) {
      return (
        <DashboardFloorPlan history={ history }>
          <CircularProgress />
        </DashboardFloorPlan>
      );
    }

    return (
      <DashboardFloorPlan history={ history }>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item key="title">
            <Typography variant="h2" component="span">
              { strings.dashboard.floorPlans.title }
            </Typography>
          </Grid>
        </Grid>
        <Divider style={{ marginTop: 30 }} />
        <div className={ classes.content }>
          <List>
            { this.renderListItems() }
          </List>
        </div>
    </DashboardFloorPlan>
    );
  }

  /**
   * Renders list items
   */
  private renderListItems = () => {
    const exhibitionFloorMap = this.state.exhibitionFloors;
    if (!exhibitionFloorMap) {
      return null;
    }

    const result: JSX.Element[] = [];

    this.props.exhibitions.forEach(exhibition => {
      (exhibitionFloorMap[exhibition.id!] || []).forEach(exhibitionFloor => {
        const listItem = this.renderListItem(exhibition, exhibitionFloor);
        if (listItem) {
          result.push(listItem);
        }
      });
    });

    return result;
  }

  /**
   * Renders list item
   *
   * @param exhibition exhibition
   */
  private renderListItem = (exhibition: Exhibition, exhibitionFloor: ExhibitionFloor): JSX.Element | null => {
    const { classes } = this.props;
    
    const exhibitionFloorId = exhibitionFloor.id;
    if (!exhibitionFloorId) {
      return null;
    }

    return (
      <ListItem button onClick={ () => this.openFloorPlan(exhibition, exhibitionFloor) }>
        <ListItemAvatar className={ classes.muistiAvatar }>
          <Avatar src={ defaultFloorPlanImage } />
        </ListItemAvatar>
        <ListItemText primary={ `${exhibition.name} - ${exhibitionFloor.name}` } />
      </ListItem>
    );
  }

  /**
   * Loads view data
   * 
   * @param exhibitions exhibitions
   */
  private loadViewData = async (exhibitions: Exhibition[]) => {
    this.setState({
      loading: true
    });

    const { accessToken } = this.props;

    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(accessToken);
    const exhibitionFloors: ExhibitionFloorMap = {};

    await Promise.all(exhibitions.map(async exhibition => {
      const exhibitionId = exhibition.id!;
      exhibitionFloors[exhibitionId] = await exhibitionFloorsApi.listExhibitionFloors({ exhibitionId: exhibitionId });
    }));

    this.setState({
      loading: false,
      exhibitionFloors: exhibitionFloors
    });
  }

  /**
   * Opens selected exhibition floor plan
   *
   * @param exhibition exhibition
   */
  private openFloorPlan = (exhibition: Exhibition, exhibitionFloor: ExhibitionFloor) => {
    if (!exhibition.id && !exhibitionFloor.id) {
      return;
    }

    this.props.history.push(`/v4/floorPlans/${exhibition.id}/${exhibitionFloor.id}`);
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardFloorPlansView));
