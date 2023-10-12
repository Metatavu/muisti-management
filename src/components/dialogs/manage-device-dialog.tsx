import { Device, DeviceApprovalStatus, DeviceModel } from "../../generated/client";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import LocalizationUtils from "../../utils/localization-utils";
import GenericDialog from "../generic/generic-dialog";
import { FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import { ChangeEvent, ReactNode, useEffect, useState } from "react";

/**
 * Components properties
 */
interface Props {
  open: boolean;
  device?: Device;
  deviceModels: DeviceModel[];
  onConfirm: (device: Device) => Promise<void>;
  onClose: () => void;
}

/**
 * Manage Device Dialog component
 */
const ManageDeviceDialog = ({ open, device, deviceModels, onConfirm, onClose }: Props) => {
  if (!device?.id) return null;

  const [tempDevice, setTempDevice] = useState<Device>(device);
  const [loading, setLoading] = useState(false);

  useEffect(() => setTempDevice(device), [device]);

  /**
   * Event handler for dialog confirm click
   */
  const onConfirmClick = async () => {
    if (!device?.id) return;
    setLoading(true);
    try {
      await onConfirm(tempDevice);
    } catch (error: any) {
      console.error(error);
    }
    setLoading(false);
    onClose();
  };

  /**
   * Event handler for text field change
   *
   * @param event event
   */
  const handleTextFieldChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) =>
    setTempDevice({ ...tempDevice, [name as keyof typeof device]: value });

  /**
   * Event handler for switch change
   *
   * @param _ event
   * @param checked checked
   */
  const handleSwitchChange = (_: any, checked: boolean) => {
    setTempDevice({
      ...tempDevice,
      approvalStatus: checked ? DeviceApprovalStatus.Approved : DeviceApprovalStatus.Pending
    });
  };

  /**
   * Renders text field with given label, value and name
   *
   * @param value value
   * @param name name
   * @param disabled disabled
   * @param label label
   */
  const renderTextField = (value?: string, label?: string, disabled?: boolean, name?: string) => (
    <TextField
      fullWidth
      disabled={disabled}
      name={name}
      label={label}
      value={value}
      placeholder={label}
      onChange={name ? handleTextFieldChange : undefined}
    />
  );

  /**
   * Renders select box with given label, value and name
   *
   * @param children children
   * @param value value
   * @param name name
   * @param label label
   */
  const renderSelect = (name: string, children: ReactNode, value?: string, label?: string) => (
    <TextField
      fullWidth
      select
      name={name}
      label={label}
      value={value ?? ""}
      placeholder={label}
      onChange={handleTextFieldChange}
    >
      <MenuItem>{strings.generic.noSelection}</MenuItem>
      {children}
    </TextField>
  );

  /**
   * Renders device models select box menu items
   */
  const renderDeviceModels = () =>
    deviceModels.map((deviceModel) => (
      <MenuItem key={deviceModel.id} value={deviceModel.id}>
        {deviceModel.model}
      </MenuItem>
    ));

  /**
   * Renders dialog content
   */
  const renderDialogContent = () => (
    <Stack padding={theme.spacing(1)} spacing={1}>
      <Typography variant="h6">{strings.devicesV2.dialog.description}</Typography>
      <Stack direction="row" spacing={1}>
        {renderTextField(tempDevice.name, strings.devicesV2.name, false, "name")}
        {renderTextField(
          tempDevice.description,
          strings.devicesV2.description,
          false,
          "description"
        )}
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="space-between">
        {renderSelect(
          "deviceModelId",
          renderDeviceModels(),
          tempDevice.deviceModelId,
          strings.devicesV2.model
        )}
        {renderTextField(
          LocalizationUtils.getLocalizedDeviceApprovalStatus(tempDevice.approvalStatus),
          strings.devicesV2.approvalStatus.label,
          true
        )}
      </Stack>
      <FormControlLabel
        label={strings.devicesV2.approve}
        onChange={handleSwitchChange}
        disabled={tempDevice.approvalStatus === DeviceApprovalStatus.Ready}
        control={
          <Switch
            checked={
              tempDevice.approvalStatus === DeviceApprovalStatus.Approved ||
              tempDevice.approvalStatus === DeviceApprovalStatus.Ready
            }
          />
        }
      />
      <Stack direction="row" spacing={1}>
        {renderTextField(tempDevice.status, strings.devicesV2.status.label, true)}
        {renderTextField(tempDevice.version, strings.devicesV2.version, true)}
      </Stack>
      {renderTextField(tempDevice.serialNumber, strings.devicesV2.serialNumber, true)}
    </Stack>
  );

  return (
    <GenericDialog
      open={open}
      cancelButtonText={strings.generic.cancel}
      positiveButtonText={strings.generic.save}
      title={strings.devicesV2.dialog.title}
      error={false}
      onConfirm={onConfirmClick}
      onCancel={onClose}
      onClose={onClose}
      loading={loading}
    >
      {renderDialogContent()}
    </GenericDialog>
  );
};

export default ManageDeviceDialog;
