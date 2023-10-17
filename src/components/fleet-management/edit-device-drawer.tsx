import { Device, DeviceModel } from "../../generated/client";
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
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { ChangeEvent, useState } from "react";

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
   * Renders device property textfield
   *
   * @param name property name
   * @param label property label
   * @param disabled is property disabled
   */
  const renderDevicePropertyTextField = (name: string, label: string, disabled: boolean) => (
    <PropertyBox>
      <PanelSubtitle subtitle={label} />
      <TextField
        fullWidth
        disabled={disabled}
        name={name}
        value={tempDevice[name as keyof Device]}
        onChange={onDevicePropertyChange}
        placeholder={label}
      />
    </PropertyBox>
  );

  /**
   * Renders device property datetime field
   *
   * @param name property name
   * @param label property label
   */
  const renderDevicePropertyDateTimeField = (name: string, label: string) => (
    <PropertyBox>
      <PanelSubtitle subtitle={label} />
      <TextField
        fullWidth
        disabled
        name={name}
        value={GenericUtils.formatDateTime(tempDevice[name as keyof Device])}
        onChange={onDevicePropertyChange}
        placeholder={label}
      />
    </PropertyBox>
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
   */
  const renderDeviceModelSelectBox = () => (
    <PropertyBox>
      <PanelSubtitle subtitle={strings.devicesV2.model} />
      <TextField
        fullWidth
        select
        name="deviceModelId"
        value={tempDevice.deviceModelId}
        onChange={onDevicePropertyChange}
        placeholder={strings.devicesV2.model}
      >
        {deviceModels.map(renderDeviceModelSelectBoxOptions)}
      </TextField>
    </PropertyBox>
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
          <Typography variant="h3">Laitteen tiedot</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </PropertyBox>
      <Divider />
      {renderDevicePropertyTextField("name", strings.fleetManagement.properties.name, false)}
      {renderDevicePropertyTextField(
        "description",
        strings.fleetManagement.properties.description,
        false
      )}
      {renderDeviceModelSelectBox()}
      {renderDevicePropertyTextField(
        "serialNumber",
        strings.fleetManagement.properties.serialNumber,
        true
      )}
      {renderDevicePropertyTextField("version", strings.fleetManagement.properties.version, true)}
      {renderDevicePropertyDateTimeField("lastSeen", strings.fleetManagement.properties.lastSeen)}
      {renderDevicePropertyDateTimeField("createdAt", strings.fleetManagement.properties.createdAt)}
      {renderDevicePropertyDateTimeField(
        "modifiedAt",
        strings.fleetManagement.properties.modifiedAt
      )}
      <PropertyBox>
        <Button fullWidth variant="contained" onClick={handleSaveDevice}>
          {strings.generic.save}
        </Button>
      </PropertyBox>
    </Drawer>
  );
};

export default EditDeviceDrawer;
