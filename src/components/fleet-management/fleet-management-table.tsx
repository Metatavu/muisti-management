import { Device, DeviceApprovalStatus, DeviceStatus } from "../../generated/client";
import strings from "../../localization/strings";
import GenericUtils from "../../utils/generic-utils";
import LocalizationUtils from "../../utils/localization-utils";
import { Circle as CircleIcon, Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
  GridValueGetterParams,
  fiFI
} from "@mui/x-data-grid";
import { useMemo } from "react";

/**
 * Components properties
 */
interface Props {
  devices: Device[];
  loading: boolean;
  setSelectedDevice: (device?: Device) => void;
  setDeviceToDelete: (device?: Device) => void;
}

/**
 * Fleet Management Table component
 */
const FleetManagementTable = ({
  devices,
  loading,
  setSelectedDevice,
  setDeviceToDelete
}: Props) => {
  /**
   * Gets correct icon for device status
   *
   * @param status status
   * @returns appropriate icon
   */
  const renderDeviceStatusIcon = ({ row: { status } }: GridValueGetterParams<Device>) => {
    if (status === DeviceStatus.Online) {
      return <CircleIcon color="success" />;
    }

    return <CircleIcon color="error" />;
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: strings.fleetManagement.properties.name,
        flex: 1,
        minWidth: 100
      },
      {
        field: "description",
        headerName: strings.fleetManagement.properties.description,
        flex: 1,
        minWidth: 100
      },
      {
        field: "serialNumber",
        headerName: strings.fleetManagement.properties.serialNumber,
        flex: 1,
        minWidth: 100
      },
      {
        field: "approvalStatus",
        headerName: strings.fleetManagement.properties.approvalStatus.label,
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) =>
          LocalizationUtils.getLocalizedDeviceApprovalStatus(value as DeviceApprovalStatus)
      },
      {
        field: "status",
        headerName: strings.fleetManagement.properties.status.label,
        flex: 1,
        minWidth: 100,
        renderCell: renderDeviceStatusIcon
      },
      {
        field: "version",
        headerName: strings.fleetManagement.properties.version,
        flex: 1,
        minWidth: 100
      },
      {
        field: "lastSeen",
        headerName: strings.fleetManagement.properties.lastSeen,
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) => GenericUtils.formatDateTime(value as string)
      },
      {
        field: "createdAt",
        headerName: strings.fleetManagement.properties.createdAt,
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) => GenericUtils.formatDateTime(value as string)
      },
      {
        field: "modifiedAt",
        headerName: "Muokattu",
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) => GenericUtils.formatDateTime(value as string)
      },
      {
        field: "actions",
        type: "actions",
        headerName: strings.generic.actions,
        width: 100,
        getActions: ({ row: { id } }: GridRowParams<Device>) => [
          <GridActionsCellItem
            icon={<EditIcon />}
            label={strings.generic.edit}
            onClick={() => setSelectedDevice(devices.find((device) => device.id === id))}
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label={strings.generic.delete}
            onClick={() => setDeviceToDelete(devices.find((device) => device.id === id))}
          />
        ]
      }
    ],
    []
  );
  return (
    <DataGrid
      autoHeight
      columns={columns}
      loading={loading}
      rows={devices}
      disableColumnMenu
      localeText={fiFI.components.MuiDataGrid.defaultProps.localeText}
    />
  );
};

export default FleetManagementTable;
