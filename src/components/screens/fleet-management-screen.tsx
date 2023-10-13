import Api from "../../api/api";
import {
  Device,
  DeviceApprovalStatus,
  DeviceModel,
  DeviceStatus,
  Exhibition
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxState } from "../../store";
import { AccessToken } from "../../types";
import LocalizationUtils from "../../utils/localization-utils";
import BasicLayout from "../layouts/basic-layout";
import { Circle } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
/*
 * Component props
 */
interface Props {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  deviceModels: DeviceModel[];
}

/**
 * Fleet Management Screen component
 */
const FleetManagementScreen = ({
  history,
  keycloak,
  accessToken
  // exhibitions,
  // deviceModels
}: Props) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  // const [selectedDevice, setSelectedDevice] = useState<Device>();
  const [error, setError] = useState<Error>();

  /**
   * Loads devices from the backend
   */
  const loadDevices = async () => {
    setLoading(true);
    try {
      const devicesApi = Api.getDevicesApi(accessToken);
      const foundDevices = await devicesApi.listDevices({});
      setDevices(foundDevices);
    } catch (e: any) {
      console.error(e);
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
  }, []);

  /**
   * Gets correct icon for device status
   *
   * @param status status
   * @returns appropriate icon
   */
  const getDeviceStatusIcon = (status: string) =>
    ({
      [DeviceStatus.Online]: <Circle color="success" />,
      [DeviceStatus.Offline]: <Circle color="error" />
    })[status as DeviceStatus];

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: strings.devicesV2.name,
        flex: 1,
        minWidth: 100
      },
      {
        field: "serialNumber",
        headerName: strings.devicesV2.serialNumber,
        flex: 1,
        minWidth: 100
      },
      {
        field: "description",
        headerName: strings.devicesV2.description,
        flex: 1,
        minWidth: 100
      },
      {
        field: "approvalStatus",
        headerName: strings.devicesV2.approvalStatus.label,
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) =>
          LocalizationUtils.getLocalizedDeviceApprovalStatus(value as DeviceApprovalStatus)
      },
      {
        field: "status",
        headerName: strings.devicesV2.status.label,
        flex: 1,
        minWidth: 100,
        valueGetter: getDeviceStatusIcon
      },
      {
        field: "version",
        headerName: strings.devicesV2.version,
        flex: 1,
        minWidth: 100
      },
      {
        field: "lastSeen",
        headerName: strings.devicesV2.lastSeen,
        flex: 1,
        minWidth: 100
      },
      {
        field: "lastModifierId",
        headerName: "Viimeisin muokkaaja",
        flex: 1,
        minWidth: 100
      },
      {
        field: "createdAt",
        headerName: "Luotu",
        flex: 1,
        minWidth: 100
      },
      {
        field: "modifiedAt",
        headerName: "Muokattu",
        flex: 1,
        minWidth: 100
      }
    ],
    []
  );

  return (
    <BasicLayout
      history={history}
      title={strings.header.navigation.fleetManagementButton}
      breadcrumbs={[]}
      error={error}
      actionBarButtons={[]}
      keycloak={keycloak}
      noBackButton
    >
      <DataGrid autoHeight columns={columns} loading={loading} rows={devices} />
    </BasicLayout>
  );
};

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
const mapStateToProps = (state: ReduxState) => {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken,
    exhibitions: state.exhibitions.exhibitions,
    deviceModels: state.devices.deviceModels
  };
};

export default connect(mapStateToProps)(FleetManagementScreen);
