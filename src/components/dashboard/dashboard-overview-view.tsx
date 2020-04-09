import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { WithStyles, withStyles, Typography, GridList, GridListTile, GridListTileBar, Grid, Divider, Select, MenuItem } from "@material-ui/core";
import styles from "../../styles/dashboard-overview-view";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import { Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardLayout from "./dashboard-layout";
import defaultExhibitionImage from "../../resources/gfx/muisti-logo.png";
import moment from "moment";

import ArrowDownIcon from "../../resources/gfx/svg-paths/nuoli-alas";


/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
  error?: Error;
  statisticsInterval: string;
}

/**
 * Component for dashboard overview view
 */
class DashboardOverviewView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      statisticsInterval: strings.dashboard.overview.statistics.week
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history, exhibitions } = this.props;
    const { statisticsInterval } = this.state;

    return (
      <DashboardLayout history={ history }>
        <Typography variant="h2" className={ classes.sectionTitle }>
          { strings.dashboard.overview.onProduction }
        </Typography>
        <div className={ classes.exhibitionsGridList }>
          <GridList cellHeight={ 280 }>
            { exhibitions ?
              exhibitions.map(exhibition => this.renderExhibitionTile(exhibition)) : <div />
            }
          </GridList>
        </div>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="center"
        >
          <Grid item key="title">
            <Typography variant="h2" component="span">
              { strings.dashboard.overview.statistics.title }
            </Typography>
          </Grid>
          <Grid item key="select">
            <Select
              IconComponent={ props => (
                  <ArrowDownIcon { ...props } className={`material-icons ${ props.className }`}/>
              )}
              id="statistics-select"
              value={ statisticsInterval }
              onChange={ this.handleSelectChange }
            >
              <MenuItem value={ strings.dashboard.overview.statistics.day }>{ strings.dashboard.overview.statistics.day }</MenuItem>
              <MenuItem value={ strings.dashboard.overview.statistics.week }>{ strings.dashboard.overview.statistics.week }</MenuItem>
              <MenuItem value={ strings.dashboard.overview.statistics.month }>{ strings.dashboard.overview.statistics.month }</MenuItem>
              <MenuItem value={ strings.dashboard.overview.statistics.year }>{ strings.dashboard.overview.statistics.year }</MenuItem>
            </Select>
          </Grid>
        </Grid>
        <Divider style={{ marginTop: 30 }} />
      </DashboardLayout>
    );
  }

  /**
   * Renders exhibition tile
   *
   * @param exhibition exhibition
   */
  private renderExhibitionTile = (exhibition: Exhibition) => {
    if (!exhibition || !exhibition.id) {
      return;
    }

    return (
      <GridListTile key={ exhibition.id } onClick={ () => this.openExhibition(exhibition) }>
        <img src={ defaultExhibitionImage } alt={ exhibition.name }/>
        <GridListTileBar
          subtitle={ `${ strings.dashboard.overview.lastModified } ${ moment(exhibition.modifiedAt).fromNow() }` }
          title={ exhibition.name }
        />
      </GridListTile>
    );
  }

  /**
   * Opens exhibition
   *
   * @param exhibitionId exhibition id
   */
  private openExhibition = (exhibition: Exhibition) => {
    if (!exhibition.id) {
      return;
    }

    this.props.setSelectedExhibition(exhibition);
    this.props.history.push(`/exhibitions/${exhibition.id}`);
  }

  /**
   * Event handler for select change
   *
   * @param event React change event
   */
  private handleSelectChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    this.setState({
      statisticsInterval: event.target.value as string
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardOverviewView));