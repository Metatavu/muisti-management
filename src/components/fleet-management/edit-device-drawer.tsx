import { Device, DeviceApprovalStatus, DeviceModel } from "../../generated/client";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import GenericUtils from "../../utils/generic-utils";
import PanelSubtitle from "../layout/v2/panel-subtitle";
import PropertyBox from "../layout/v2/property-box";
import { Close as CloseIcon } from "@mui/icons-material";
import {
  Button,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import moment from "moment";
import { ChangeEvent, ReactNode, useState } from "react";

/**
 * Components properties
 */
interface Props {
  selectedDevice?: Device;
  deviceModels: DeviceModel[];
  onSave: (device: Device) => Promise<void>;
  onClose: () => void;
}

/**
 * Edit Device Drawer component
 */
const EditDeviceDrawer = ({ selectedDevice, deviceModels, onSave, onClose }: Props) => {
  if (!selectedDevice?.id) return null;

  const [tempDevice, setTempDevice] = useState(selectedDevice);

  /**
   * Event handler for device property change events
   *
   * @param event event
   */
  const onDevicePropertyChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    setTempDevice({
      ...tempDevice,
      [name]: value
    });
  };

  /**
   * Event handler for switch change
   *
   * @param _event
   * @param checked checked
   */
  const handleSwitchChange = (_event: any, checked: boolean) => {
    setTempDevice({
      ...tempDevice,
      approvalStatus: checked ? DeviceApprovalStatus.Approved : DeviceApprovalStatus.Pending
    });
  };

  /**
   * Renders device property field by type
   *
   * @param type type
   * @param name name
   * @param label label
   * @param disabled disabled
   * @param children children
   */
  const renderDevicePropertyFieldByType = (
    type: "text" | "datetime" | "date" | "select" | "number",
    name: string,
    label: string,
    disabled: boolean,
    children?: ReactNode
  ) => {
    switch (type) {
      case "text":
        return renderDevicePropertyTextField(name, label, disabled);
      case "number":
        return renderDevicePropertyNumberField(name, label, disabled);
      case "datetime":
        return renderDevicePropertyDateTimeField(name, label, disabled);
      case "date":
        return renderDevicePropertyDateField(name, label, disabled);
      case "select":
        return renderDevicePropertySelectField(name, label, children);
    }
  };

  /**
   * Renders device property textfield
   *
   * @param name property name
   * @param label property label
   * @param disabled is property disabled
   */
  const renderDevicePropertyTextField = (name: string, label: string, disabled: boolean) => (
    <TextField
      fullWidth
      disabled={disabled}
      name={name}
      value={tempDevice[name as keyof Device]}
      onChange={onDevicePropertyChange}
      placeholder={label}
    />
  );

  /**
   * Renders device property number field
   *
   * @param name property name
   * @param label property label
   * @param disabled is property disabled
   */
  const renderDevicePropertyNumberField = (name: string, label: string, disabled: boolean) => (
    <TextField
      fullWidth
      disabled={disabled}
      name={name}
      value={GenericUtils.roundNumber(
        tempDevice[name as keyof Device] as string | number | undefined
      )}
      onChange={onDevicePropertyChange}
      placeholder={label}
    />
  );

  /**
   * Renders device property field
   *
   * @param name name
   * @param label label
   * @param disabled disabled
   * @param type text, datetime or date
   * @param children optional children
   */
  const renderDevicePropertyField = (
    name: string,
    label: string,
    disabled: boolean,
    type: "text" | "datetime" | "date" | "select" | "number",
    children?: ReactNode
  ) => (
    <PropertyBox>
      <PanelSubtitle subtitle={label} />
      {renderDevicePropertyFieldByType(type, name, label, disabled, children)}
    </PropertyBox>
  );

  /**
   * Renders device property datetime field
   *
   * @param name property name
   * @param label property label
   * @param disabled disabled
   */
  const renderDevicePropertyDateTimeField = (name: string, label: string, disabled: boolean) => (
    <DateTimePicker
      label={label}
      disabled={disabled}
      slotProps={{ textField: { fullWidth: true } }}
      value={moment(tempDevice[name as keyof Device]) || undefined}
      onChange={(val) => setTempDevice({ ...tempDevice, [name]: moment(val) })}
    />
  );

  /**
   * Renders device property datetime field
   *
   * @param name property name
   * @param label property label
   * @param disabled disabled
   */
  const renderDevicePropertyDateField = (name: string, label: string, disabled: boolean) => (
    <DatePicker
      label={label}
      disabled={disabled}
      slotProps={{ textField: { fullWidth: true } }}
      value={moment(tempDevice[name as keyof Device]) || undefined}
      onChange={(val) => setTempDevice({ ...tempDevice, [name]: moment(val) })}
    />
  );

  /**
   * Renders device model select box options
   *
   * @param deviceModel device model
   */
  const renderDeviceModelSelectBoxOptions = (deviceModel: DeviceModel) => (
    <MenuItem key={deviceModel.id} value={deviceModel.id}>
      {deviceModel.manufacturer} {deviceModel.model}
    </MenuItem>
  );

  /**
   * Renders device models select box
   *
   * @param name name
   * @param label label
   * @param children children
   */
  const renderDevicePropertySelectField = (name: string, label: string, children?: ReactNode) => (
    <TextField
      fullWidth
      select
      name={name}
      value={tempDevice[name as keyof Device]}
      onChange={onDevicePropertyChange}
      placeholder={label}
    >
      {children}
    </TextField>
  );

  /**
   * Handler for save device button click
   */
  const handleSaveDevice = async () => onSave(tempDevice);

  return (
    <Drawer
      anchor="right"
      open={!!selectedDevice}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 400,
          borderLeft: "1px solid #ddd",
          paddingTop: theme.spacing(1)
        }
      }}
    >
      <PropertyBox>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h3">{strings.fleetManagement.drawerTitle}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </PropertyBox>
      <Divider />
      {renderDevicePropertyField("name", strings.fleetManagement.properties.name, false, "text")}
      {renderDevicePropertyField(
        "description",
        strings.fleetManagement.properties.description,
        false,
        "text"
      )}
      {renderDevicePropertyField(
        "warrantyExpiry",
        strings.fleetManagement.properties.warrantyExpiry,
        false,
        "date"
      )}
      {renderDevicePropertyField(
        "deviceModelId",
        strings.fleetManagement.properties.model,
        false,
        "select",
        deviceModels.map(renderDeviceModelSelectBoxOptions)
      )}
      {renderDevicePropertyField(
        "serialNumber",
        strings.fleetManagement.properties.serialNumber,
        true,
        "text"
      )}
      {renderDevicePropertyField(
        "usageHours",
        strings.fleetManagement.properties.usageHours,
        true,
        "number"
      )}
      {renderDevicePropertyField(
        "version",
        strings.fleetManagement.properties.version,
        true,
        "text"
      )}
      {renderDevicePropertyField(
        "lastSeen",
        strings.fleetManagement.properties.lastSeen,
        true,
        "datetime"
      )}
      {renderDevicePropertyField(
        "lastConnected",
        strings.fleetManagement.properties.lastConnected,
        true,
        "datetime"
      )}
      {renderDevicePropertyField(
        "createdAt",
        strings.fleetManagement.properties.createdAt,
        true,
        "datetime"
      )}
      {renderDevicePropertyField(
        "modifiedAt",
        strings.fleetManagement.properties.modifiedAt,
        true,
        "datetime"
      )}
      <PropertyBox>
        <FormControlLabel
          label={strings.fleetManagement.properties.approve}
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
      </PropertyBox>
      <PropertyBox>
        <Button fullWidth variant="contained" onClick={handleSaveDevice}>
          {strings.generic.save}
        </Button>
      </PropertyBox>
    </Drawer>
  );
};

export default EditDeviceDrawer;
