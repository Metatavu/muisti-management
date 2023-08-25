import {
  DeviceImageLoadStrategy,
  DeviceModel,
  ExhibitionDevice,
  ExhibitionDeviceGroup,
  ExhibitionFloor,
  ExhibitionRoom,
  RfidAntenna,
  ScreenOrientation
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";
import { AccessToken } from "../../types";
import HelpDialog from "../generic/help-dialog";
import { Box, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { ColorResult, SketchPicker } from "react-color";
import { connect } from "react-redux";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  deviceModels: DeviceModel[];
  rooms?: ExhibitionRoom[];
  deviceGroups?: ExhibitionDeviceGroup[];
  selectedFloor?: ExhibitionFloor;
  selectedRoom?: ExhibitionRoom;
  selectedDeviceGroup?: ExhibitionDeviceGroup;
  selectedDevice?: ExhibitionDevice;
  selectedAntenna?: RfidAntenna;

  onChangeFloorProperties?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRoomProperties?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRoomColor?: (color: ColorResult) => void;
  onChangeDeviceGroupProperties?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDeviceProperties?: (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => void;
  onChangeAntennaProperties?: (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => void;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  showColorPicker: boolean;
}

/**
 * Component for group content version info view
 */
class FloorPlanInfo extends React.Component<Props, State> {
  /**
   * Generic text filed properties
   */
  private textFieldGenericProps = {
    type: "text",
    style: { marginTop: theme.spacing(2) }
  };

  /**
   * Generic select properties
   */
  private selectFieldGenericProps = {
    style: { marginTop: theme.spacing(2) }
  };

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      showColorPicker: false
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    return <div style={{ padding: theme.spacing(2) }}>{this.renderProperties()}</div>;
  };

  /**
   * Renders properties
   */
  private renderProperties = () => {
    const { selectedFloor, selectedRoom, selectedDeviceGroup, selectedDevice, selectedAntenna } =
      this.props;

    if (selectedAntenna) {
      return this.renderAntenna(selectedAntenna);
    }

    if (selectedDevice) {
      return this.renderDevice(selectedDevice);
    }

    if (selectedDeviceGroup) {
      return this.renderDeviceGroup(selectedDeviceGroup);
    }

    if (selectedRoom) {
      return this.renderRoom(selectedRoom);
    }

    if (selectedFloor) {
      return this.renderFloor(selectedFloor);
    }

    return null;
  };

  /**
   * Render antenna settings
   *
   * @param selectedAntenna selected antenna
   */
  private renderAntenna = (selectedAntenna: RfidAntenna) => {
    const { onChangeAntennaProperties } = this.props;
    const deviceGroupMenuItems = this.getDeviceGroupItems();

    return (
      <>
        <TextField
          {...this.textFieldGenericProps}
          label={strings.generic.name}
          name="name"
          value={selectedAntenna.name}
          onChange={onChangeAntennaProperties}
        />
        <Box display="flex" mt={2} alignItems="center">
          <TextField
            type="text"
            label={strings.floorPlan.properties.readerId}
            name="readerId"
            value={selectedAntenna.readerId}
            onChange={onChangeAntennaProperties}
          />
          <HelpDialog title={strings.floorPlan.properties.readerId}>
            <Typography>
              {strings.helpDialogs.floorPlanEditor.antennaReaderIdDescription}
            </Typography>
          </HelpDialog>
        </Box>
        <Box display="flex" mt={2} alignItems="center">
          <TextField
            type="text"
            label={strings.floorPlan.properties.antennaNumber}
            name="antennaNumber"
            value={selectedAntenna.antennaNumber}
            onChange={onChangeAntennaProperties}
          />
          <HelpDialog title={strings.floorPlan.properties.antennaNumber}>
            <Typography>
              {strings.helpDialogs.floorPlanEditor.antennaPortNumberDescription}
            </Typography>
          </HelpDialog>
        </Box>

        <InputLabel id="groupId-label" style={{ marginTop: theme.spacing(2) }}>
          {strings.floorPlan.properties.deviceGroup}
        </InputLabel>
        <Select
          {...this.selectFieldGenericProps}
          labelId="groupId-label"
          name="groupId"
          value={selectedAntenna.groupId || ""}
          onChange={onChangeAntennaProperties}
        >
          {deviceGroupMenuItems}
        </Select>

        <Box display="flex" mt={2} alignItems="center">
          <TextField
            type="number"
            label={strings.floorPlan.properties.visitorSessionStartThreshold}
            name="visitorSessionStartThreshold"
            value={selectedAntenna.visitorSessionStartThreshold}
            onChange={onChangeAntennaProperties}
          />
          <HelpDialog title={strings.floorPlan.properties.visitorSessionStartThreshold}>
            <Typography>
              {strings.helpDialogs.floorPlanEditor.visitorSessionStartThresholdDescription}
            </Typography>
          </HelpDialog>
        </Box>

        <Box display="flex" mt={2} alignItems="center">
          <TextField
            type="number"
            label={strings.floorPlan.properties.visitorSessionEndThreshold}
            name="visitorSessionEndThreshold"
            value={selectedAntenna.visitorSessionEndThreshold}
            onChange={onChangeAntennaProperties}
          />
          <HelpDialog title={strings.floorPlan.properties.visitorSessionEndThreshold}>
            <Typography>
              {strings.helpDialogs.floorPlanEditor.visitorSessionEndThresholdDescription}
            </Typography>
          </HelpDialog>
        </Box>
      </>
    );
  };

  /**
   * Render device settings
   *
   * @param selectedDevice selected device
   */
  private renderDevice = (selectedDevice: ExhibitionDevice) => {
    const { onChangeDeviceProperties, deviceModels } = this.props;

    return (
      <>
        <TextField
          {...this.textFieldGenericProps}
          label={strings.generic.name}
          name="name"
          fullWidth
          value={selectedDevice.name}
          onChange={onChangeDeviceProperties}
        />
        <TextField
          {...this.selectFieldGenericProps}
          select
          fullWidth
          label={strings.device.dialog.model}
          name="modelId"
          value={selectedDevice.modelId || ""}
          onChange={onChangeDeviceProperties}
        >
          {deviceModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {`${model.manufacturer} ${model.model}`}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          {...this.selectFieldGenericProps}
          name="screenOrientation"
          label={strings.floorPlan.properties.screenOrientation}
          select
          fullWidth
          value={selectedDevice.screenOrientation || ""}
          onChange={onChangeDeviceProperties}
        >
          <MenuItem key={"landscape"} value={ScreenOrientation.Landscape}>
            {strings.floorPlan.properties.landscape}
          </MenuItem>
          <MenuItem key={"portrait"} value={ScreenOrientation.Portrait}>
            {strings.floorPlan.properties.portrait}
          </MenuItem>
          <MenuItem key={"forcedPortrait"} value={ScreenOrientation.ForcedPortrait}>
            {strings.floorPlan.properties.forcedPortrait}
          </MenuItem>
        </TextField>
        <TextField
          {...this.selectFieldGenericProps}
          label={strings.floorPlan.properties.imageLoadStrategy}
          select
          fullWidth
          name="imageLoadStrategy"
          value={selectedDevice.imageLoadStrategy || ""}
          onChange={onChangeDeviceProperties}
        >
          <MenuItem key={"memory"} value={DeviceImageLoadStrategy.Memory}>
            {strings.floorPlan.properties.imageLoadStrategyMemory}
          </MenuItem>
          <MenuItem key={"disk"} value={DeviceImageLoadStrategy.Disk}>
            {strings.floorPlan.properties.imageLoadStrategyDisk}
          </MenuItem>
          <MenuItem key={"diskraw"} value={DeviceImageLoadStrategy.DiskRaw}>
            {strings.floorPlan.properties.imageLoadStrategyDiskRaw}
          </MenuItem>
        </TextField>
      </>
    );
  };

  /**
   * Render device group settings
   *
   * @param selectedDeviceGroup selected device group
   */
  private renderDeviceGroup = (selectedDeviceGroup: ExhibitionDeviceGroup) => {
    const { onChangeDeviceGroupProperties } = this.props;

    return (
      <>
        <TextField
          {...this.textFieldGenericProps}
          label={strings.generic.name}
          name="name"
          fullWidth
          value={selectedDeviceGroup.name}
          onChange={onChangeDeviceGroupProperties}
        />
        <Box display="flex" mt={2} alignItems="center">
          <TextField
            type="text"
            fullWidth
            label={strings.floorPlan.properties.indexPageTimeout}
            name="indexPageTimeout"
            value={selectedDeviceGroup.indexPageTimeout}
            onChange={onChangeDeviceGroupProperties}
          />
          <HelpDialog title="">
            <Typography>
              {strings.helpDialogs.floorPlanEditor.indexPageTimeoutDescription}
            </Typography>
            <Typography variant="h6">
              {strings.helpDialogs.floorPlanEditor.indexPageTimeoutAdditionalDescription}
            </Typography>
          </HelpDialog>
        </Box>
      </>
    );
  };

  /**
   * Render room settings
   *
   * @param selectedRoom selected room
   */
  private renderRoom = (selectedRoom: ExhibitionRoom) => {
    const { onChangeRoomProperties, onChangeRoomColor, classes } = this.props;
    const { showColorPicker } = this.state;

    return (
      <>
        <TextField
          {...this.textFieldGenericProps}
          label={strings.generic.name}
          name="name"
          fullWidth
          value={selectedRoom.name}
          onChange={onChangeRoomProperties}
        />

        <InputLabel style={{ marginTop: theme.spacing(2) }}>
          {strings.floorPlan.room.color}
        </InputLabel>

        <Box
          className={classes.color}
          style={{ backgroundColor: selectedRoom.color }}
          onClick={this.onColorBoxClick}
        />
        {showColorPicker && (
          <SketchPicker color={selectedRoom.color} onChangeComplete={onChangeRoomColor} />
        )}
      </>
    );
  };

  /**
   * Render floor settings
   *
   * @param selectedFloor selected floor
   */
  private renderFloor = (selectedFloor: ExhibitionFloor) => {
    const { onChangeFloorProperties } = this.props;

    return (
      <TextField
        {...this.textFieldGenericProps}
        name="name"
        fullWidth
        label={strings.generic.name}
        value={selectedFloor.name}
        onChange={onChangeFloorProperties}
      />
    );
  };

  /**
   * Get device group select items
   */
  private getDeviceGroupItems = () => {
    const { deviceGroups } = this.props;

    if (!deviceGroups) {
      return null;
    }
    return deviceGroups.map((group) => {
      return (
        <MenuItem key={group.id} value={group.id}>
          {group.name}
        </MenuItem>
      );
    });
  };

  /**
   * On color box click handler
   */
  private onColorBoxClick = () => {
    this.setState({
      showColorPicker: !this.state.showColorPicker
    });
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state Redux store state
 */
const mapStateToProps = (state: ReduxState) => ({
  keycloak: state.auth.keycloak as KeycloakInstance,
  accessToken: state.auth.accessToken as AccessToken
});

export default withStyles(styles)(connect(mapStateToProps)(FloorPlanInfo));
