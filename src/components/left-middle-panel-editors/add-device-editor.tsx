import { DeviceModel, ExhibitionDevice, ScreenOrientation } from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/add-device-editor";
import {
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  deviceModels: DeviceModel[];
  newDevice: Partial<ExhibitionDevice>;
  onNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onModelChange: (e: SelectChangeEvent<string>, _child: React.ReactNode) => void;
  onScreenOrientationChange: (e: SelectChangeEvent<string>, _child: React.ReactNode) => void;
}

/**
 * Interface representing component state
 */
interface State {}

/**
 * Component for add device editor
 */
class AddDeviceEditor extends React.Component<Props, State> {
  /**
   * Component render method
   */
  public render() {
    const {
      classes,
      newDevice,
      onNameChange,
      onModelChange,
      onScreenOrientationChange,
      deviceModels
    } = this.props;

    const modelSelectItems = deviceModels.map((deviceModel) => {
      return (
        <MenuItem value={deviceModel.id}>
          {`${deviceModel.manufacturer} ${deviceModel.model}`}
        </MenuItem>
      );
    });

    return (
      <>
        <Typography className={classes.title} variant="h6">
          {strings.exhibition.addDeviceEditor.title}
        </Typography>
        <Grid container spacing={2} className={classes.inputGrid}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="text"
              label={strings.exhibition.addDeviceEditor.nameLabel}
              name="name"
              value={newDevice.name || ""}
              onChange={onNameChange}
            />

            <InputLabel id="model">
              {strings.exhibition.addDeviceEditor.deviceModelLabel}
            </InputLabel>
            <Select
              variant="filled"
              labelId="model"
              value={newDevice.modelId || ""}
              onChange={onModelChange}
            >
              {modelSelectItems}
            </Select>

            <InputLabel id="screenOrientation">
              {strings.exhibition.addDeviceEditor.screenOrientationLabel}
            </InputLabel>
            <Select
              variant="filled"
              labelId="screenOrientation"
              value={newDevice.screenOrientation || ""}
              onChange={onScreenOrientationChange}
            >
              <MenuItem value={ScreenOrientation.Portrait}>
                {strings.exhibition.addDeviceEditor.screenOrientationPortrait}
              </MenuItem>
              <MenuItem value={ScreenOrientation.Landscape}>
                {strings.exhibition.addDeviceEditor.screenOrientationLandscape}
              </MenuItem>
            </Select>
          </Grid>
        </Grid>
      </>
    );
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    deviceModels: state.devices.deviceModels
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AddDeviceEditor));
