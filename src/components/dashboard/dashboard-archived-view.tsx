import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

// eslint-disable-next-line max-len
import { WithStyles, withStyles, Typography, Select, MenuItem, Grid, Divider, ListItemAvatar, ListItem, Avatar, List, ListItemText, IconButton } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import styles from "../../styles/dashboard-recent-view";

import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken } from "../../types";
import { Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardLayout from "./dashboard-layout";
import { ExhibitionRecentSortBy, ExhibitionRecentSortOption } from "../../types/sortTypes";
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
  exhibitions?: Exhibition[];
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Interface representing component state
 */
interface State {
  error?: string | Error;
  exhibitions: Exhibition[];
  loading: boolean;
}

/**
 * Component for dashboard archived view
 */
class DashboardArchivedView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      exhibitions: []
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
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      const exhibitions: Exhibition[] = await exhibitionsApi.listExhibitions();

      this.setState({ exhibitions });
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

    const sortOptions: ExhibitionRecentSortOption[] = [
      { name: strings.sorting.dashboard.recent.byModifiedAt, value: ExhibitionRecentSortBy.MODIFIED_AT },
      { name: strings.sorting.dashboard.recent.byCreatedAt, value: ExhibitionRecentSortBy.CREATED_AT }
    ];

    const exhibitions = this.state.exhibitions && this.state.exhibitions.map(exhibition =>
      this.renderExhibitionListItem(exhibition)
    );

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
                { strings.dashboard.archived.title }
              </Typography>
            </Grid>
            <Grid item key="list-functions">
              <Select
                id="select-sorting"
                defaultValue={ ExhibitionRecentSortBy.MODIFIED_AT }
              >
                { sortOptions.map(option =>
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
            { exhibitions &&
              exhibitions
            }
          </List>
        </div>
    </DashboardLayout>
    );
  }

  /**
   * Renders exhibition list item
   */
  private renderExhibitionListItem = (exhibition: Exhibition) => {

    const exhibitionId = exhibition.id;
    if (!exhibitionId) {
      return;
    }

    return (
      <ListItem onClick={ () => this.openExhibition(exhibitionId) }>
        <ListItemAvatar>
          <Avatar src={ defaultExhibitionImage } />
        </ListItemAvatar>
        <ListItemText primary={ exhibition.name } secondary={ `${ strings.dashboard.recent.lastModified } ${ moment(exhibition.modifiedAt).fromNow() }` } />
      </ListItem>
    );
  }

  /**
   * Opens exhibition
   *
   * @param exhibitionId exhibition id
   */
  private openExhibition = async (exhibitionId: string) => {
    const { accessToken } = this.props;
    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibition = await exhibitionsApi.findExhibition({ exhibitionId: exhibitionId });
    this.props.setSelectedExhibition(exhibition);
    this.props.history.push(`/exhibitions/${exhibitionId}`);
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardArchivedView));