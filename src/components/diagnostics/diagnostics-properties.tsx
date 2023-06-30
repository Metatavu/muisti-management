import {
  DeviceImageLoadStrategy,
  DeviceModel,
  ExhibitionDevice,
  ExhibitionDeviceGroup,
  ExhibitionRoom,
  RfidAntenna,
  ScreenOrientation
} from "../../generated/client";
import strings from "../../localization/strings";
import { Typography } from "@mui/material";
import * as React from "react";

/**
 * Component properties
 */
interface Props {
  deviceModels: DeviceModel[];
  rooms?: ExhibitionRoom[];
  deviceGroups?: ExhibitionDeviceGroup[];
  selectedDevice?: ExhibitionDevice;
  selectedAntenna?: RfidAntenna;
}

/**
 * Component for diagnostics properties
 *
 * @param props component properties
 */
const DiagnosticsProperties: React.FC<Props> = ({
  deviceModels,
  deviceGroups,
  selectedAntenna,
  selectedDevice
}) => {
  /**
   * Renders single property
   *
   * @param label label
   * @param value value
   */
  const renderProperty = (label: string, value: string | number) => {
    return (
      <>
        <Typography variant="h4">{label}</Typography>
        <Typography paragraph style={{ fontSize: 16 }}>
          {value}
        </Typography>
      </>
    );
  };

  /**
   * Renders boolean as localized string
   *
   * @param value value
   * @returns boolean as localized string
   */
  const renderLocalizedBoolean = (value: boolean): string => {
    return strings.visitorVariables.booleanValues[value ? "true" : "false"];
  };

  /**
   * Renders screen orientation as localized string
   *
   * @param orientation orientation
   */
  const renderLocalizedOrientation = (orientation: ScreenOrientation) =>
    ({
      [ScreenOrientation.Portrait]: strings.floorPlan.properties.portrait,
      [ScreenOrientation.ForcedPortrait]: strings.floorPlan.properties.forcedPortrait,
      [ScreenOrientation.Landscape]: strings.floorPlan.properties.landscape
    })[orientation];

  /**
   * Renders image load strategy as localized string
   *
   * @param imageLoadStrategy image load strategy
   */
  const renderLocalizedImageLoadStrategy = (imageLoadStrategy: DeviceImageLoadStrategy) =>
    ({
      [DeviceImageLoadStrategy.DISK]: strings.floorPlan.properties.imageLoadStrategyDisk,
      [DeviceImageLoadStrategy.MEMORY]: strings.floorPlan.properties.imageLoadStrategyMemory,
      [DeviceImageLoadStrategy.DISKRAW]: strings.floorPlan.properties.imageLoadStrategyDiskRaw
    })[imageLoadStrategy];

  /**
   * Renders device group values
   */
  const renderDeviceGroupValues = () => {
    const selectedDeviceGroup = deviceGroups?.find(
      (group) => group.id === selectedAntenna?.groupId
    );

    if (!selectedDeviceGroup) {
      return null;
    }

    return (
      <>
        {renderProperty(strings.floorPlan.properties.deviceGroup, selectedDeviceGroup.name)}
        {renderProperty(
          strings.floorPlan.properties.allowVisitorSessionCreation,
          renderLocalizedBoolean(selectedDeviceGroup.allowVisitorSessionCreation)
        )}
        {renderProperty(
          strings.floorPlan.properties.visitorSessionEndTimeout,
          selectedDeviceGroup.visitorSessionEndTimeout
        )}
      </>
    );
  };

  /**
   * Render antenna settings
   *
   * @param selectedAntenna selected antenna
   */
  const renderAntennaProperties = (selectedAntenna: RfidAntenna) => {
    return (
      <>
        {renderProperty(strings.generic.name, selectedAntenna.name)}
        {renderProperty(strings.floorPlan.properties.readerId, selectedAntenna.readerId)}
        {renderProperty(strings.floorPlan.properties.antennaNumber, selectedAntenna.antennaNumber)}
        {renderProperty(
          strings.floorPlan.properties.visitorSessionStartThreshold,
          selectedAntenna.visitorSessionStartThreshold
        )}
        {renderProperty(
          strings.floorPlan.properties.visitorSessionEndThreshold,
          selectedAntenna.visitorSessionEndThreshold
        )}
        {renderDeviceGroupValues()}
      </>
    );
  };

  /**
   * Renders device settings
   *
   * @param selectedDevice selected device
   */
  const renderDeviceProperties = (selectedDevice: ExhibitionDevice) => {
    const selectedDeviceModel = deviceModels?.find((model) => model.id === selectedDevice.modelId);

    return (
      <>
        {renderProperty(strings.generic.name, selectedDevice.name)}
        {selectedDeviceModel &&
          renderProperty(
            strings.device.dialog.model,
            `${selectedDeviceModel.manufacturer} ${selectedDeviceModel.model}`
          )}
        {renderProperty(
          strings.floorPlan.properties.screenOrientation,
          renderLocalizedOrientation(selectedDevice.screenOrientation)
        )}
        {renderProperty(
          strings.floorPlan.properties.imageLoadStrategy,
          renderLocalizedImageLoadStrategy(selectedDevice.imageLoadStrategy)
        )}
      </>
    );
  };

  if (selectedAntenna) {
    return renderAntennaProperties(selectedAntenna);
  }

  if (selectedDevice) {
    return renderDeviceProperties(selectedDevice);
  }

  return null;
};

export default DiagnosticsProperties;
