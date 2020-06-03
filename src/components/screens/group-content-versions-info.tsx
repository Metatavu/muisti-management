import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, Grid, Typography, TextField, Divider, MenuItem, Select } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionRoom, GroupContentVersion, ExhibitionDeviceGroup, GroupContentVersionStatus } from "../../generated/client";
import { AccessToken, ActionButton, BreadcrumbData } from '../../types';
import Api from "../../api/api";
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import { ContentVersion } from "../../generated/client/models/ContentVersion";
import GenericDialog from "../generic/generic-dialog";
import theme from "../../styles/theme";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  contentVersion: ContentVersion;
  groupContentVersion: GroupContentVersion;

  onValueChange: (updatedGroupContentVersion: GroupContentVersion) => void;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
}

/**
 * Component for exhibition content rooms view
 */
class GroupContentVersionsInfo extends React.Component<Props, State> {

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
    // this.setState({ loading: true });
    // this.setState({ loading: false });
  }

  /**
   * Component render method
   */
  public render = () => {

    if (this.state.loading) {
      return (
        <div/>
      );
    }

    return (
      <>
        { this.renderFields() }
      </>
    );
  }

  private renderFields = () => {
    const { classes, contentVersion, groupContentVersion } = this.props;

    const statusSelectItems = Object.keys(GroupContentVersionStatus).map(key =>
      <MenuItem key={ key } value={ key}>{ key }</MenuItem>
    );

    return (
      <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
        <Grid item xs={ 12 }>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.groupContentVersion.name }</Typography>
          <TextField
            fullWidth
            type="text"
            name="name"
            value={ groupContentVersion.name }
            onChange={ this.onValueChange }
          />
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </Grid>
        <Grid item xs={ 12 }>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.groupContentVersion.status }</Typography>
          <Select
            fullWidth
            variant="filled"
            labelId={ strings.groupContentVersion.status }
            name="status"
            value={ groupContentVersion.status }
            onChange={ this.onValueChange }
          >
            { statusSelectItems }
          </Select>
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </Grid>
      </Grid>
    );
  }

  /**
   * Handler when linked value changed is disabled (single filed is updated)
   * @param event react change event
   */
  private onValueChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string | undefined; value: any }>) => {
    const { onValueChange } = this.props;
    const key = event.target.name;
    const value = event.target.value;
    if (!key || !value) {
      return;
    }

    const groupContentVersionToUpdate = { ...this.props.groupContentVersion, [key] : value }
    onValueChange(groupContentVersionToUpdate);
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GroupContentVersionsInfo));
