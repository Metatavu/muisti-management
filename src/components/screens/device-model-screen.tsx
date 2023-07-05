import Api from "../../api/api";
import { DeviceModel } from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import { AccessToken, ActionButton, BreadcrumbData } from "../../types";
import BasicLayout from "../layouts/basic-layout";
import { CircularProgress } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  deviceModelId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  deviceModel?: DeviceModel;
}

/**
 * Component for device model screen
 */
export class DeviceModelScreen extends React.Component<Props, State> {
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
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;

    const breadcrumbs = this.getBreadcrumbsData();
    const actionBarButtons = this.getActionButtons();

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={keycloak}
          history={history}
          title={strings.layout.title}
          breadcrumbs={breadcrumbs}
          actionBarButtons={actionBarButtons}
        >
          <div className={classes.loader}>
            <CircularProgress size={50} color="secondary"></CircularProgress>
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={strings.layout.title}
        breadcrumbs={breadcrumbs}
        actionBarButtons={actionBarButtons}
      ></BasicLayout>
    );
  };

  /**
   * Fetches component data
   */
  private fetchData = async () => {
    const { accessToken, deviceModelId } = this.props;

    const deviceModelsApi = Api.getDeviceModelsApi(accessToken);
    const deviceModel = await deviceModelsApi.findDeviceModel({ deviceModelId });

    this.setState({ deviceModel });
  };

  /**
   * Get breadcrumbs data
   *
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = () => {
    const { deviceModel } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/deviceModels" },
      { name: deviceModel?.model || "" }
    ] as BreadcrumbData[];
  };

  /**
   * Get action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [{ name: strings.device.delete.deleteTitle, action: () => null }] as ActionButton[];
  };
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
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DeviceModelScreen));
