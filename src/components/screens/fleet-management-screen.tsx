import Api from "../../api/api";
import { Device, DeviceModel, Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxState } from "../../store";
import { AccessToken } from "../../types";
import DeleteDeviceDialog from "../dialogs/delete-device-dialog";
import EditDeviceDrawer from "../fleet-management/edit-device-drawer";
import FleetManagementTable from "../fleet-management/fleet-management-table";
import BasicLayout from "../layouts/basic-layout";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { useEffect, useState } from "react";
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
const FleetManagementScreen = ({ history, keycloak, accessToken, deviceModels }: Props) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device>();
  const [deviceToDelete, setDeviceToDelete] = useState<Device>();
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
      setError(e);
    }
    setLoading(false);
  };

  /**
   * Handler for save device button click
   *
   * @param device device to save
   */
  const handleSaveDevice = async (device: Device) => {
    if (!device.id) return;
    setLoading(true);
    try {
      const devicesApi = Api.getDevicesApi(accessToken);
      const updatedDevice = await devicesApi.updateDevice({ deviceId: device.id, device: device });
      setDevices(
        devices.map((device) => (device.id === updatedDevice.id ? updatedDevice : device))
      );
      setSelectedDevice(undefined);
    } catch (e: any) {
      setError(e);
    }
    setLoading(false);
  };

  /**
   * Handler for delete device button click
   *
   * @param device device to delete
   */
  const handleDeleteDevice = async (device?: Device) => {
    setLoading(true);
    try {
      if (!device?.id) return;
      const devicesApi = Api.getDevicesApi(accessToken);
      await devicesApi.deleteDevice({ deviceId: device.id });
      setDevices(devices.filter((dev) => dev.id !== device.id));
    } catch (e: any) {
      setError(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
  }, []);

  return (
    <>
      <BasicLayout
        history={history}
        title={strings.header.navigation.fleetManagementButton}
        breadcrumbs={[]}
        error={error}
        actionBarButtons={[]}
        keycloak={keycloak}
        noBackButton
      >
        <FleetManagementTable
          devices={devices}
          loading={loading}
          loadDevices={loadDevices}
          setDeviceToDelete={setDeviceToDelete}
          setSelectedDevice={setSelectedDevice}
        />
      </BasicLayout>
      <EditDeviceDrawer
        selectedDevice={selectedDevice}
        deviceModels={deviceModels}
        onSave={handleSaveDevice}
        onClose={() => setSelectedDevice(undefined)}
      />
      <DeleteDeviceDialog
        deviceToDelete={deviceToDelete}
        onClose={() => setDeviceToDelete(undefined)}
        onDelete={handleDeleteDevice}
      />
    </>
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
