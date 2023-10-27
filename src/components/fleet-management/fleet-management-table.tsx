import { Device, DeviceApprovalStatus, DeviceStatus } from "../../generated/client";
import strings from "../../localization/strings";
import GenericUtils from "../../utils/generic-utils";
import LocalizationUtils from "../../utils/localization-utils";
import {
  Circle as CircleIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridFooter,
  GridRenderCellParams,
  GridRowParams,
  fiFI
} from "@mui/x-data-grid";
import { ReactNode, useMemo } from "react";

/**
 * Components properties
 */
interface Props {
  devices: Device[];
  loading: boolean;
  loadDevices: () => Promise<void>;
  setSelectedDevice: (device?: Device) => void;
  setDeviceToDelete: (device?: Device) => void;
}

/**
 * Fleet Management Table component
 */
const FleetManagementTable = ({
  devices,
  loading,
  loadDevices,
  setSelectedDevice,
  setDeviceToDelete
}: Props) => {
  /**
   * Gets correct icon for device status
   *
   * @param status status
   * @returns appropriate icon
   */
  const renderDeviceStatusIcon = ({ row: { status } }: GridRenderCellParams<Device>): ReactNode => {
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
        flex: 0.1,
        renderCell: renderDeviceStatusIcon
      },
      {
        field: "version",
        headerName: strings.fleetManagement.properties.version,
        flex: 1,
        minWidth: 100
      },
      {
        field: "usageHours",
        headerName: strings.fleetManagement.properties.usageHours,
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) => `${GenericUtils.roundNumber(value)} h`
      },
      {
        field: "warrantyExpiry",
        headerName: strings.fleetManagement.properties.warrantyExpiry,
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) => GenericUtils.formatDate(value as string)
      },
      {
        field: "lastConnected",
        headerName: strings.fleetManagement.properties.lastConnected,
        flex: 1,
        minWidth: 100,
        valueGetter: ({ value }) => GenericUtils.formatDateTime(value as string)
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
        headerName: strings.fleetManagement.properties.modifiedAt,
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
    [devices, setSelectedDevice, setDeviceToDelete]
  );

  const renderFooter = () => (
    <Stack direction="row" justifyContent="space-between">
      <IconButton disabled={loading} onClick={loadDevices}>
        <RefreshIcon />
      </IconButton>
      <GridFooter />
    </Stack>
  );

  return (
    <DataGrid
      autoHeight
      columns={columns}
      loading={loading}
      rows={devices}
      disableColumnMenu
      slots={{
        footer: renderFooter
      }}
      localeText={fiFI.components.MuiDataGrid.defaultProps.localeText}
    />
  );
};

export default FleetManagementTable;
