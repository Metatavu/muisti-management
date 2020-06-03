import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken, BreadcrumbData } from '../../types';
import strings from "../../localization/strings";
import BasicLayout from "../layouts/basic-layout";
import Api from "../../api/api";
import { PageLayout } from "../../generated/client";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  layoutId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  layout?: PageLayout;
}

/**
 * Component for layout screen
 */
export class LayoutScreen extends React.Component<Props, State> {

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
    this.setState({ loading: true });
    await this.fetchData();
    this.setState({ loading: false });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;

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
        title={ strings.layout.title }
        breadcrumbs={ breadcrumbs }
      >
      </BasicLayout>
    );
  }

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, layoutId } = this.props;

    const deviceModelsApi = Api.getPageLayoutsApi(accessToken);
    const layout = await deviceModelsApi.findPageLayout({ pageLayoutId: layoutId });

    this.setState({ layout });
  }

  /**
   * Gets breadcrumbs data
   * 
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { layout } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/v4/deviceModels" },
      { name: layout?.name || "" }
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
    accessToken: state.auth.accessToken as AccessToken,
    deviceModels: state.devices.deviceModels
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutScreen));