import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setDeviceModels } from "../../actions/devices";

// eslint-disable-next-line max-len
import { ListItemSecondaryAction, TextField, Switch, Button, WithStyles, withStyles, Typography, Select, MenuItem, Grid, Divider, ListItemAvatar, ListItem, List, ListItemText, CircularProgress, IconButton, FormControlLabel, InputAdornment } from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';

import styles from "../../styles/dashboard-component-styles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken, DeviceModelDataProperty, DeviceModelDataSubPropertyKey } from "../../types";
import { DeviceModel, DeviceModelCapabilities, DeviceModelDisplayMetrics, DeviceModelDimensions, ScreenOrientation } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardLayout from "./dashboard-layout";
import moment from "moment";
import Api from "../../api/api";

import ArrowDownIcon from "../../resources/gfx/svg-paths/nuoli-alas";
import ProjectorIcon from "../../resources/gfx/svg-paths/projektori";

import EditorDialog from '../generic/editor-dialog';
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import theme from "../../styles/theme";
import ConfirmDialog from "../generic/confirm-dialog";
import { DeviceModelData, DeviceModelDisplayMetricsData, DeviceModelDimensionsData } from "../../types/device-model-string-data";
import { isTypeOfDeviceModelDimensionsData, isTypeOfDeviceModelDisplayMetricsData, isTypeOfDeviceModelCapabilitiesData } from "../../types/type-guards";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  devices: DeviceModel[];
  setDeviceModels: typeof setDeviceModels;
}

/**
 * Interface representing component state
 */
interface State {
  error?: string | Error;
  formError: boolean;
  loading: boolean;
  deviceSettingsPanelOpen: boolean;
  newDevice: boolean;
  selectedDevice?: DeviceModel;
  deviceData?: DeviceModelData;
  deviceScreenOrientation: ScreenOrientation;
  deviceDialogOpen: boolean;
  deleteDialogOpen: boolean;
}

/**
 * Component for dashboard devices view
 */
class DashboardDevicesView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      formError: false,
      newDevice: false,
      deviceSettingsPanelOpen: false,
      deviceDialogOpen: false,
      deleteDialogOpen: false,
      deviceScreenOrientation: ScreenOrientation.Landscape
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history } = this.props;

    const filterOptions = [
      { name: strings.filtering.dashboard.devices.all , value: "ALL" }
    ];

    const deviceSort = (a: DeviceModel, b: DeviceModel): number => {
      return moment(a.modifiedAt).isAfter(b.modifiedAt) ? -1 : 1;
    };
    const devices = this.props.devices && this.props.devices
      .sort((a, b) => deviceSort(a, b))
      .map(device => this.renderDeviceListItem(device));

    if (this.state.loading) {
      return (
        <DashboardLayout history={ history }>
          <CircularProgress />
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout history={ history }>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid container key="title" justify="space-between" direction="row" alignItems="center" >
              <Typography variant="h2" component="span">
                { strings.dashboard.devices.title }
              </Typography>
              <Button
                disableElevation
                variant="contained"
                className={ classes.actionBtn }
                onClick={ this.onAddDeviceClick }
                >
                { strings.dashboard.devices.newDevice }
              </Button>
            </Grid>
            <Grid container key="search" justify="space-between" alignItems="center" direction="row" style={{ marginTop: theme.spacing(4) }} >
              <Grid item>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <SearchIcon fontSize="small" color="primary" style={{ marginRight: theme.spacing(1) }} />
                  <TextField id="search-input" label="Hae..." />
                </div>
              </Grid>
                <Grid item key="list-functions">
                  <Select
                    IconComponent={ props => (
                      <ArrowDownIcon { ...props } className={`material-icons ${ props.className }`}/>
                    )}
                    id="select-filtering"
                    defaultValue="ALL"
                  >
                    { filterOptions.map(option =>
                      <MenuItem value={ option.value } key={ option.value }>{ option.name }</MenuItem>
                    )}
                  </Select>
              </Grid>
            </Grid>
          </Grid>
        <Divider style={{ marginTop: 20 }} />
        <div className={ classes.content }>
          <List>
            { devices &&
              devices
            }
          </List>
        </div>
        { this.renderModifyDeviceDialog() }
        { this.renderConfirmDeleteDialog() }
    </DashboardLayout>
    );
  }

  /**
   * Renders device list item
   */
  private renderDeviceListItem = (device: DeviceModel) => {
    const { classes } = this.props;
    const deviceId = device.id;
    if (!deviceId) {
      return;
    }

    return (
      <ListItem button onClick={ () => this.onDeviceClick( device ) } >
        <ListItemAvatar className={ classes.muistiAvatar }>
          <ProjectorIcon />
        </ListItemAvatar>
        <ListItemText
          primary={ `${device.manufacturer} ${device.model}` }
          secondary={ `${ strings.dashboard.recent.lastModified } ${ moment(device.modifiedAt).fromNow() }` }
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="delete" onClick={ () => this.onDeleteDialogOpen(device) }>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  /**
   * Render device delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedDevice } = this.state;
    if (selectedDevice) {
      return (
        <ConfirmDialog
          open={ this.state.deleteDialogOpen }
          title={ strings.dashboard.devices.dialog.deleteDeviceTitle }
          text={ strings.dashboard.devices.dialog.deleteDeviceText }
          onClose={ this.onDeleteDialogClose }
          onCancel={ this.onDeleteDialogClose }
          onConfirm={ () => this.onDeleteDeviceClick(selectedDevice) }
          positiveButtonText={ strings.confirmDialog.delete }
          cancelButtonText={ strings.confirmDialog.cancel }
        />
      );
    }
  }

  /**
   * Renders device modification dialog
   */
  private renderModifyDeviceDialog = () => {
    const { selectedDevice, newDevice, deviceDialogOpen, deviceData, formError } = this.state;
    const typeOptions = [
      { name: strings.deviceTypes.screen, value: "SCREEN" },
      { name: strings.deviceTypes.projector, value: "PROJECTOR" },
    ];

    if (!deviceData || !selectedDevice) {
      return;
    }

    return (
      <EditorDialog
        open={ deviceDialogOpen }
        error={ formError }
        title={ newDevice ? `${strings.dashboard.devices.newDevice}` : deviceData ? `${deviceData.manufacturer} ${deviceData.model}` : "" }
        onClose={ this.onDeviceDialogClose }
        onCancel={ this.onDeviceDialogClose }
        onConfirm={ () => this.onSaveDeviceClick() }
        positiveButtonText={ strings.editorDialog.save }
        cancelButtonText={ strings.editorDialog.cancel }
      >
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.dashboard.devices.dialog.dimensions.physicalSize }</Typography>
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={ 4 }>
            <TextField
              error={ this.fieldIsInvalid(selectedDevice.dimensions.deviceWidth, deviceData.dimensions.deviceWidth) }
              fullWidth
              type="width"
              label={ strings.dashboard.devices.dialog.dimensions.width }
              InputProps={{
                endAdornment: <InputAdornment position="end">mm</InputAdornment>
              }}
              variant="filled"
              name="dimensions.deviceWidth"
              value={ deviceData ? deviceData.dimensions.deviceWidth : "" }
              onChange={ this.onDeviceInfoChange }
            />
          </Grid>
          <Grid item xs={ 4 }>
            <TextField
              error={ this.fieldIsInvalid(selectedDevice.dimensions.deviceHeight, deviceData.dimensions.deviceHeight) }
              fullWidth
              type="height"
              label={ strings.dashboard.devices.dialog.dimensions.height }
              InputProps={{
                endAdornment: <InputAdornment position="end">mm</InputAdornment>
              }}
              variant="filled"
              name="dimensions.deviceHeight"
              value={ deviceData ? deviceData.dimensions.deviceHeight : "" }
              onChange={ this.onDeviceInfoChange }
            />
          </Grid>
          <Grid item xs={ 4 }>
            <TextField
              error={ this.fieldIsInvalid(selectedDevice.dimensions.deviceDepth, deviceData.dimensions.deviceDepth) }
              fullWidth
              type="depth"
              label={ strings.dashboard.devices.dialog.dimensions.depth }
              InputProps={{
                endAdornment: <InputAdornment position="end">mm</InputAdornment>
              }}
              variant="filled"
              name="dimensions.deviceDepth"
              value={ deviceData ? deviceData.dimensions.deviceDepth : "" }
              onChange={ this.onDeviceInfoChange }
            />
          </Grid>
        </Grid>

        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">{ strings.dashboard.devices.dialog.displayMetrics.displayInfo }</Typography>
        {
          this.renderDisplayMetricOptions()
        }
        <TextField
          style={{ marginTop: theme.spacing(4) }}
          fullWidth
          type="manufacturer"
          label={ strings.dashboard.devices.dialog.brand }
          variant="filled"
          name="manufacturer"
          value={ deviceData ? deviceData.manufacturer : "" }
          onChange={ this.onDeviceInfoChange }
        />
        <TextField
          style={{ marginTop: theme.spacing(3) }}
          fullWidth
          type="model"
          label={ strings.dashboard.devices.dialog.model }
          variant="filled"
          name="model"
          value={ deviceData ? deviceData.model : "" }
          onChange={ this.onDeviceInfoChange }
        />
        <Typography style={{ marginTop: theme.spacing(1) }} variant="h6">{ strings.dashboard.devices.dialog.type }</Typography>
        <Select
          variant="filled"
          fullWidth
          IconComponent={ props => (
            <ArrowDownIcon { ...props } className={`material-icons ${ props.className }`}/>
          )}
          id="select-filtering"
          defaultValue="SCREEN"
        >
          { typeOptions.map(option =>
            <MenuItem value={ option.value } key={ option.value }>{ option.name }</MenuItem>
          )}
        </Select>
        <FormControlLabel
          style={{ marginTop: theme.spacing(2) }}
          control={
            <Switch
              checked={ selectedDevice?.capabilities.touch }
              onChange={ this.onDeviceInfoChange }
              color="secondary"
              name="capabilities.touch"
              inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
          label={ strings.dashboard.devices.dialog.touchscreen }
        />
      </EditorDialog>
    );
  }

  /**
   * Render display metric options
   */
  private renderDisplayMetricOptions = () => {
    const { deviceData, selectedDevice } = this.state;

    if (!selectedDevice || !deviceData) {
      return;
    }

    return (
      <Grid container spacing={ 2 }>
        <Grid item xs={ 6 }>
          <TextField
            error={ this.fieldIsInvalid(selectedDevice.dimensions.screenWidth, deviceData.dimensions.screenWidth) }
            fullWidth
            type="screenWidth"
            label={ strings.dashboard.devices.dialog.dimensions.screenWidth }
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>
            }}
            variant="outlined"
            value={ deviceData ? deviceData.dimensions.screenWidth : "" }
            name="dimensions.screenWidth"
            onChange={ this.onDeviceInfoChange }
            />
        </Grid>
        <Grid item xs={ 6 }>
          <TextField
            error={ this.fieldIsInvalid(selectedDevice.dimensions.screenHeight, deviceData.dimensions.screenHeight) }
            fullWidth
            type="screenHeight"
            label={ strings.dashboard.devices.dialog.dimensions.screenHeight }
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>
            }}
            variant="outlined"
            value={ deviceData ? deviceData.dimensions.screenHeight : "" }
            name="dimensions.screenHeight"
            onChange={ this.onDeviceInfoChange }
            />
        </Grid>
        <Grid item xs={ 6 }>
          <TextField
            error={ this.fieldIsInvalid(selectedDevice.displayMetrics.widthPixels, deviceData.displayMetrics.widthPixels) }
            fullWidth
            type="widthPixels"
            label={ strings.dashboard.devices.dialog.displayMetrics.widthPixels }
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>
            }}
            variant="outlined"
            value={ deviceData ? deviceData.displayMetrics.widthPixels : "" }
            name="displayMetrics.widthPixels"
            onChange={ this.onDeviceInfoChange }
            />
        </Grid>
        <Grid item xs={ 6 }>
          <TextField
            error={ this.fieldIsInvalid(selectedDevice.displayMetrics.heightPixels, deviceData.displayMetrics.heightPixels) }
            fullWidth
            type="heightPixels"
            label={ strings.dashboard.devices.dialog.displayMetrics.heightPixels }
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>
            }}
            variant="outlined"
            value={ deviceData ? deviceData.displayMetrics.heightPixels : "" }
            name="displayMetrics.heightPixels"
            onChange={ this.onDeviceInfoChange }
          />
        </Grid>
      </Grid>
    );
  }

  /**
   * Device info change handler
   *
   * @param event React change event
   */
  private onDeviceInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedDevice } = this.state;
    if (!selectedDevice) {
      return;
    }

    const { target } = event;
    const value: string | boolean = target.name === "capabilities.touch" ? target.checked : target.value;

    const keys = target.name.split(".");

    if (keys.length > 1) {
      const key1 = keys[0] as keyof DeviceModelData;
      const key2 = keys[1] as DeviceModelDataSubPropertyKey;
      const deviceData = { ...this.state.deviceData } as DeviceModelData;
      const propertyToUpdate = deviceData[key1] as DeviceModelDataProperty;
      const updatedProperty = this.updateSubProperty(propertyToUpdate, key2, value);
      const updatedDeviceData = { ...deviceData, [key1]: updatedProperty } as DeviceModelData;
      const updatedDevice = this.assignDeviceDataToDevice(updatedDeviceData, selectedDevice);
      this.setState({
        selectedDevice: updatedDevice,
        deviceData: updatedDeviceData,
        formError: JSON.stringify(this.translateDeviceToDeviceData(updatedDevice)) !== JSON.stringify(updatedDeviceData)
      });
    } else {
      const updatedDeviceData = { ...this.state.deviceData, [target.name]: value } as DeviceModelData;
      const updatedDevice = this.assignDeviceDataToDevice(updatedDeviceData, selectedDevice);
      this.setState({
        selectedDevice: updatedDevice,
        deviceData: updatedDeviceData,
        formError: JSON.stringify(this.translateDeviceToDeviceData(updatedDevice)) !== JSON.stringify(updatedDeviceData)
      });
    }
  }

  private fieldIsInvalid = (devicePropertyValue: number | undefined, deviceDataPropertyValue: string) => {
    return devicePropertyValue !== undefined && devicePropertyValue.toString() !== deviceDataPropertyValue;
  }

  /**
   * On device click handler
   *
   * @param device selected device
   */
  private onDeviceClick = (device: DeviceModel) => {
    this.setState({
      deviceDialogOpen: true,
      newDevice: false,
      selectedDevice: device,
      deviceData: this.translateDeviceToDeviceData(device)
    });
  }

  /**
   * Delete device click handler
   *
   * @param deviceToDelete device to delete
   */
  private onDeleteDeviceClick = async (deviceToDelete: DeviceModel) => {
    const { accessToken } = this.props;

    if (deviceToDelete) {
      const deviceModelsApi = Api.getDeviceModelsApi(accessToken);

      await deviceModelsApi.deleteDeviceModel({
        deviceModelId: deviceToDelete.id!
      });

      const devices = [...this.props.devices];
      const index = devices.findIndex(device => deviceToDelete.id === device.id);

      if (index > -1) {
        devices.splice(index, 1);

        this.props.setDeviceModels(devices);
        this.onDeleteDialogClose();
      }
    }
  }

  /**
   * On save device click handler
   */
  private onSaveDeviceClick = () => {
    const { newDevice, deviceData, selectedDevice } = this.state;
    if (!deviceData || !selectedDevice) {
      return;
    }

    this.setState({ formError: false });
    const device = this.assignDeviceDataToDevice(deviceData, selectedDevice);
    const updatedHiddenDisplayMetrics = this.updateHiddenDisplayMetricsValues(device.displayMetrics, device.dimensions);
    device.displayMetrics = updatedHiddenDisplayMetrics;
    if (newDevice) {
      this.createNewDevice(device);
    }
    else {
      this.updateDevice(device);
    }
  }

  /**
   * Create new device with default values handler
   */
  private createNewDevice = async (deviceModel: DeviceModel) => {
    const { accessToken } = this.props;
    const deviceModelsApi = Api.getDeviceModelsApi(accessToken);
    const createdDevice = await deviceModelsApi.createDeviceModel({ deviceModel });
    this.props.setDeviceModels([...this.props.devices, createdDevice]);
    this.onDeviceDialogClose();
  }

  /**
   * Update device handler
   */
  private updateDevice = async (deviceModel: DeviceModel) => {
    const { accessToken } = this.props;
    const { selectedDevice } = this.state;
    if (!selectedDevice || !selectedDevice.id) {
      return;
    }

    const deviceModelId = selectedDevice.id;
    const deviceModelsApi = Api.getDeviceModelsApi(accessToken);
    const updatedDevice = await deviceModelsApi.updateDeviceModel({ deviceModel, deviceModelId });
    const devices = [...this.props.devices];
    const index = devices.findIndex(device => updatedDevice.id === device.id);

    if (index > -1) {
      devices.splice(index, 1);
      this.props.setDeviceModels([...devices, updatedDevice]);
      this.onDeviceDialogClose();
    }
  }

  /**
   * Add new device to state handler. Note: this just creates new device to state.
   * Saving to API is done in createNewDevice
   */
  private onAddDeviceClick = () => {

    const newDeviceCapabilities: DeviceModelCapabilities = {
      touch: true
    };

    const newDeviceDimensions: DeviceModelDimensions = {
      deviceWidth: 100,
      deviceHeight: 100,
      deviceDepth: 100,
      screenWidth: 1000,
      screenHeight: 1000
    };

    const newDeviceDisplayMetrics: DeviceModelDisplayMetrics = {
      density: 100,
      heightPixels: 100,
      widthPixels: 100,
      xdpi: 100,
      ydpi: 100
    };

    const newDeviceModel: DeviceModel = {
      capabilities: newDeviceCapabilities,
      dimensions: newDeviceDimensions,
      displayMetrics: newDeviceDisplayMetrics,
      manufacturer: "Company",
      model: "Model"
    };

    this.setState({
      deviceDialogOpen: true,
      deviceSettingsPanelOpen: true,
      newDevice: true,
      selectedDevice: newDeviceModel,
      deviceData: this.translateDeviceToDeviceData(newDeviceModel)
    });
  }

  /**
   * On device dialog close handler
   */
  private onDeviceDialogClose = () => {
    this.setState({
      selectedDevice: undefined,
      deviceData: undefined,
      deviceDialogOpen: false,
      formError: false
    });
  }

  /**
   * On delete device dialog open handler
   *
   * @param selectedDevice selected device
   */
  private onDeleteDialogOpen = (selectedDevice: DeviceModel) => {
    this.setState({
      selectedDevice,
      deleteDialogOpen: true
    });
  }

  /**
   * On delete device dialog close handler
   */
  private onDeleteDialogClose = () => {
    this.setState({
      selectedDevice: undefined,
      deleteDialogOpen: false
    });
  }

  /**
   * Checks deviceModel subproperty type and updates its value
   *
   * @param propertyToUpdate property to update
   * @param key property key
   * @param value new value
   * @returns updated property
   */
  private updateSubProperty = (property: DeviceModelDataProperty, key: DeviceModelDataSubPropertyKey, value: string | boolean): DeviceModelDataProperty => {
    if (isTypeOfDeviceModelDimensionsData(property)) {
      property[key as keyof DeviceModelDimensionsData] = value as string;
    } else if (isTypeOfDeviceModelDisplayMetricsData(property)) {
      property[key as keyof DeviceModelDisplayMetricsData] = value as string;
    } else if (isTypeOfDeviceModelCapabilitiesData(property)) {
      property[key as keyof DeviceModelCapabilities] = value as boolean;
    }

    return property;
  }

  /**
   * Calculates device dpi in X and Y axis.
   * Based on device physical width, physical height and pixel amount in Y and X axis.
   *
   * @param physicalWidth physical width
   * @param physicalHeight physical height
   * @param pixelAmountX pixel amount in X axis
   * @param pixelAmountY pixel amount in Y axis
   * @returns calculated X and Y axis dpi in array
   */
  private calculatePixelDensity = (physicalWidth: number, physicalHeight: number, pixelAmountX: number, pixelAmountY: number): number[] => {
    const conversionDivider = 25.4;
    const widthInInches = physicalWidth / conversionDivider;
    const heightInInches = physicalHeight / conversionDivider;
    const densityX = pixelAmountX / heightInInches;
    const densityY = pixelAmountY / widthInInches;

    return [Math.ceil(densityX), Math.ceil(densityY)];
  }

  /**
   * Calculates device overall dpi.
   * Needed in resolving device pixel density.
   * Based on device physical width, physical height and pixel amount in Y and X axis.
   *
   * @param physicalWidth physical width
   * @param physicalHeight physical height
   * @param pixelAmountX pixel amount in X axis
   * @param pixelAmountY pixel amount in Y axis
   * @returns calculated X and Y axis pixel densities in array
   */
  private calculateOverallDpi = (physicalWidth: number, physicalHeight: number, pixelAmountX: number, pixelAmountY: number) => {
    const conversionDivider = 25.4;
    const widthInInches = physicalWidth / conversionDivider;
    const heightInInches = physicalHeight / conversionDivider;
    const diagonalScreenSize = Math.sqrt(Math.pow(widthInInches, 2) + Math.pow(heightInInches, 2));
    const screenResolution = Math.sqrt(Math.pow(pixelAmountX , 2) + Math.pow(pixelAmountY, 2));
    const overallDpi = screenResolution / diagonalScreenSize;
    return Math.ceil(overallDpi);
  }

  /**
   * Resolves device pixel density value.
   * Based on device overall screen dpi.
   *
   * @param overallDpi overall dpi
   * @returns density value based on ranges between approximated dpi values
   */
  private resolveDensity = (overallDpi: number): number => {
    if (overallDpi > 0 && overallDpi <= 140) {
      return 0.75;
    } else if (overallDpi > 140 && overallDpi <= 200) {
      return 1.0;
    } else if (overallDpi > 200 && overallDpi <= 280) {
      return 1.5;
    } else if (overallDpi > 280 && overallDpi <= 400) {
      return 2.0;
    } else if (overallDpi > 400 && overallDpi <= 560) {
      return 3.0;
    } else {
      return 4.0;
    }
  }

  /**
   * Translates device model to device model data
   *
   * @param device device model
   * @returns device model data
   */
  private translateDeviceToDeviceData = (device: DeviceModel): DeviceModelData => {
    const { displayMetrics, dimensions } = device;
    const deviceDisplayMetricsData: DeviceModelDisplayMetricsData = {
      density: (displayMetrics.density || 0).toString(),
      widthPixels: (displayMetrics.widthPixels || 0).toString(),
      heightPixels: (displayMetrics.heightPixels || 0).toString(),
      xdpi: (displayMetrics.xdpi || 0).toString(),
      ydpi: (displayMetrics.ydpi || 0).toString()
    };
    const deviceDimensionsData: DeviceModelDimensionsData = {
      deviceWidth: (dimensions.deviceWidth || 0).toString(),
      deviceHeight: (dimensions.deviceHeight || 0).toString(),
      deviceDepth: (dimensions.deviceDepth || 0).toString(),
      screenWidth: (dimensions.screenWidth || 0).toString(),
      screenHeight: (dimensions.screenHeight || 0).toString()
    };
    const deviceData: DeviceModelData = {
      manufacturer: device.manufacturer,
      model: device.model,
      capabilities: device.capabilities,
      displayMetrics: deviceDisplayMetricsData,
      dimensions: deviceDimensionsData
    }

    return deviceData;
  }

  /**
   * Assigns device model data to device model
   *
   * @param deviceData device model data
   * @param device device model
   * @returns device model
   */
  private assignDeviceDataToDevice = (deviceData: DeviceModelData, device: DeviceModel): DeviceModel => {
    const { displayMetrics, dimensions, manufacturer, model, capabilities } = deviceData;
    const deviceDimensions: DeviceModelDimensions = {
      deviceWidth: Number(dimensions.deviceWidth),
      deviceHeight: Number(dimensions.deviceHeight),
      deviceDepth: Number(dimensions.deviceDepth),
      screenWidth: Number(dimensions.screenWidth),
      screenHeight: Number(dimensions.screenHeight)
    };
    const deviceDisplayMetrics: DeviceModelDisplayMetrics = {
      density: Number(displayMetrics.density),
      widthPixels: Number(displayMetrics.widthPixels),
      heightPixels: Number(displayMetrics.heightPixels),
      xdpi: Number(displayMetrics.xdpi),
      ydpi: Number(displayMetrics.ydpi)
    };

    return {
      ...device,
      manufacturer,
      model,
      capabilities,
      dimensions: deviceDimensions,
      displayMetrics: deviceDisplayMetrics
    } as DeviceModel;
  }

  /**
   * Updates hidden display metrics values
   *
   * @param displayMetrics display metrics
   * * @param dimensions dimensions
   * @returns device model display metrics
   */
  private updateHiddenDisplayMetricsValues = (displayMetrics: DeviceModelDisplayMetrics, dimensions: DeviceModelDimensions): DeviceModelDisplayMetrics => {
    const { screenWidth, screenHeight } = dimensions;
    const { heightPixels, widthPixels } = displayMetrics;
    const pixelDensities = this.calculatePixelDensity(screenWidth || 0, screenHeight || 0, heightPixels || 0, widthPixels || 0);
    const overallDpi = this.calculateOverallDpi(screenWidth || 0, screenHeight || 0, heightPixels || 0, widthPixels || 0);
    const density = this.resolveDensity(overallDpi);
    const updatedDisplayMetrics = {
      ...displayMetrics,
      density: density,
      xdpi: pixelDensities[0],
      ydpi: pixelDensities[1]
    }

    return updatedDisplayMetrics;
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
    accessToken: state.auth.accessToken as AccessToken,
    devices: state.devices.deviceModels
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setDeviceModels: (deviceModels: DeviceModel[]) => dispatch(setDeviceModels(deviceModels))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DashboardDevicesView));
