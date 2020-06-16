import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, TextField, MenuItem, Select, OutlinedTextFieldProps, SelectProps, FormControlLabel, Switch, InputLabel } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { ScreenOrientation, DeviceModel, ExhibitionFloor, ExhibitionRoom, ExhibitionDeviceGroup, ExhibitionDevice } from "../../generated/client";
import { AccessToken } from '../../types';
import strings from "../../localization/strings";
import theme from "../../styles/theme";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  deviceModels: DeviceModel[];
  selectedFloor?: ExhibitionFloor;
  selectedRoom?: ExhibitionRoom;
  selectedDeviceGroup?: ExhibitionDeviceGroup;
  selectedDevice?: ExhibitionDevice;

  onChangeFloorProperties?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeRoomProperties?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDeviceGroupProperties?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDeviceProperties?: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => void;

}

/**
 * Component state
 */
interface State {
  loading: boolean;
}

/**
 * Component for group content version info view
 */
class FloorPlanInfo extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component render method
   */
  public render = () => {

    return (
      <>
        { this.renderProperties() }
      </>
    );
  }

  /**
   * Renders properties
   */
  private renderProperties = () => {
    const { selectedFloor, selectedRoom, selectedDeviceGroup, selectedDevice, deviceModels } = this.props;
    const { onChangeFloorProperties, onChangeRoomProperties, onChangeDeviceGroupProperties, onChangeDeviceProperties } = this.props;

    const textFieldGenericProps = {
      fullWidth: true,
      type: "text",
      variant: "filled" as OutlinedTextFieldProps["variant"],
      style: { marginTop: theme.spacing(2) }
    };

    const selectFieldGenericProps = {
      fullWidth: true,
      variant: "filled" as SelectProps["variant"],
      style: { marginTop: theme.spacing(2) }
    };

    if (selectedDevice) {
      return (
        <>
          <TextField
            { ...textFieldGenericProps }
            label={ strings.generic.name }
            name="name"
            value={ selectedDevice.name }
            onChange={ onChangeDeviceProperties }
          />
          <InputLabel id="modelId-label" style={{ marginTop: theme.spacing(2) }}>
            { strings.floorPlan.properties.model }
          </InputLabel>
          <Select
            { ...selectFieldGenericProps }
            label={ strings.dashboard.devices.dialog.model }
            name="modelId"
            value={ selectedDevice.modelId || "" }
            onChange={ onChangeDeviceProperties }
          >
            { deviceModels.map(model => 
              <MenuItem key={ model.id } value={ model.id }>
                { `${model.manufacturer} ${model.model}` }
              </MenuItem>
            )}
          </Select>
          <InputLabel id="screenOrientation-label" style={{ marginTop: theme.spacing(2) }}>
            { strings.floorPlan.properties.screenOrientation }
          </InputLabel>
          <Select
            { ...selectFieldGenericProps }
            labelId="screenOrientation-label"
            name="screenOrientation"
            value={ selectedDevice.screenOrientation || "" }
            onChange={ onChangeDeviceProperties }
          >
            <MenuItem key={ "landscape" } value={ ScreenOrientation.Landscape }>{ strings.floorPlan.properties.landscape }</MenuItem>
            <MenuItem key={ "portrait" } value={ ScreenOrientation.Portrait }>{ strings.floorPlan.properties.portrait }</MenuItem>
          </Select>
        </>
      );
    }

    if (selectedDeviceGroup) {
      return (
        <>
          <TextField
            { ...textFieldGenericProps }
            label={ strings.generic.name }
            name="name"
            value={ selectedDeviceGroup.name }
            onChange={ onChangeDeviceGroupProperties }
          />
          <FormControlLabel
            label={ strings.floorPlan.properties.allowVisitorSessionCreation }
            style={{ marginTop: theme.spacing(2) }}
            control={
              <Switch
                checked={ selectedDeviceGroup.allowVisitorSessionCreation }
                onChange={ onChangeDeviceGroupProperties }
                color="primary"
                name="allowVisitorSessionCreation"
                inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
          />
        </>
      );
    }

    if (selectedRoom) {
      return (
        <TextField
          { ...textFieldGenericProps }
          label={ strings.generic.name }
          name="name"
          value={ selectedRoom.name }
          onChange={ onChangeRoomProperties }
        />
      );
    }

    if (selectedFloor) {
      return (
        <TextField
          { ...textFieldGenericProps }
          name="name"
          label={ strings.generic.name }
          value={ selectedFloor.name }
          onChange={ onChangeFloorProperties }
        />
      );
    }
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FloorPlanInfo));
