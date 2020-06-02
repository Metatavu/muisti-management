import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, Typography, Grid, TextField, InputAdornment, Select, MenuItem, FormControlLabel, Switch } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { DeviceModel, DeviceModelCapabilities, DeviceModelDisplayMetrics, DeviceModelDimensions, ScreenOrientation } from "../../generated/client";
import Api from "../../api/api";
import { AccessToken, ActionButton, DeviceModelDataProperty, DeviceModelDataSubPropertyKey } from '../../types';
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import { setDeviceModels } from "../../actions/devices";
import ArrowDownIcon from "../../resources/gfx/svg-paths/nuoli-alas";
import EditorDialog from '../generic/editor-dialog';
import theme from "../../styles/theme";
import ConfirmDialog from "../generic/confirm-dialog";
import { DeviceModelData, DeviceModelDisplayMetricsData, DeviceModelDimensionsData } from "../../types/device-model-string-data";
import { isTypeOfDeviceModelDimensionsData, isTypeOfDeviceModelDisplayMetricsData, isTypeOfDeviceModelCapabilitiesData } from "../../types/type-guards";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  deviceModels: DeviceModel[];
  setDeviceModels: typeof setDeviceModels;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  formError: boolean;
  selectedDeviceModel?: DeviceModel;
  deviceSettingsPanelOpen: boolean;
  newDevice: boolean;
  deviceData?: DeviceModelData;
  deviceScreenOrientation: ScreenOrientation;
  deviceDialogOpen: boolean;
  deleteDialogOpen: boolean;
}

/**
 * Component for device models screen
 */
export class DeviceModelsScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      formError: false,
      loading: false,
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
  public render = () => {
    const { classes, history, keycloak } = this.props;

    if (this.state.loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ strings.dashboard.devices.title }
        breadcrumbs={ [] }
        actionBarButtons={ actionBarButtons }
        noBackButton
      >
        { this.renderDeviceModelsCardsList() }
        { this.renderModifyDeviceDialog() }
        { this.renderConfirmDeleteDialog() }
      </BasicLayout>
    );
  }

  /**
   * Renders device models as card list
   */
  private renderDeviceModelsCardsList = () => {
    const { deviceModels } = this.props;
    console.log(deviceModels);
    const cards = deviceModels.map(deviceModel => {
      return (
        <CardItem
          key={ deviceModel.id }
          title={ `${deviceModel.manufacturer} ${deviceModel.model}` }
          onClick={ () => this.onCardClick(deviceModel) }
          cardMenuOptions={ this.getCardMenuOptions(deviceModel) }
          status={ "" }
        />
      );
    });

    return (
      <CardList title={ "" }>
        { cards }
      </CardList>
    );
  }

  /**
   * Render device delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedDeviceModel } = this.state;
    if (selectedDeviceModel) {
      return (
        <ConfirmDialog
          open={ this.state.deleteDialogOpen }
          title={ strings.dashboard.devices.dialog.deleteDeviceTitle }
          text={ strings.dashboard.devices.dialog.deleteDeviceText }
          onClose={ this.onDeleteDialogClose }
          onCancel={ this.onDeleteDialogClose }
          onConfirm={ () => this.onDeleteDeviceClick(selectedDeviceModel) }
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
    const { selectedDeviceModel, newDevice, deviceDialogOpen, deviceData, formError } = this.state;
    const typeOptions = [
      { name: strings.deviceTypes.screen, value: "SCREEN" },
      { name: strings.deviceTypes.projector, value: "PROJECTOR" },
    ];

    if (!deviceData || !selectedDeviceModel) {
      return;
    }

    return (
      <EditorDialog
        open={ deviceDialogOpen }
        error={ formError }
        title={ newDevice ? `${strings.dashboard.devices.newDevice}` : deviceData ? `${deviceData.manufacturer} ${deviceData.model}` : "" }
        onClose={ this.onDeviceDialogClose }
        onCancel={ this.onDeviceDialogClose }
        onConfirm={ this.onSaveDeviceClick }
        positiveButtonText={ strings.editorDialog.save }
        cancelButtonText={ strings.editorDialog.cancel }
      >
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.dashboard.devices.dialog.dimensions.physicalSize }</Typography>
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={ 4 }>
            <TextField
              error={ this.fieldIsInvalid(selectedDeviceModel.dimensions.deviceWidth, deviceData.dimensions.deviceWidth) }
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
              error={ this.fieldIsInvalid(selectedDeviceModel.dimensions.deviceHeight, deviceData.dimensions.deviceHeight) }
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
              error={ this.fieldIsInvalid(selectedDeviceModel.dimensions.deviceDepth, deviceData.dimensions.deviceDepth) }
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
              checked={ selectedDeviceModel?.capabilities.touch }
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
    const { deviceData, selectedDeviceModel } = this.state;

    if (!selectedDeviceModel || !deviceData) {
      return;
    }

    return (
      <Grid container spacing={ 2 }>
        <Grid item xs={ 6 }>
          <TextField
            error={ this.fieldIsInvalid(selectedDeviceModel.dimensions.screenWidth, deviceData.dimensions.screenWidth) }
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
            error={ this.fieldIsInvalid(selectedDeviceModel.dimensions.screenHeight, deviceData.dimensions.screenHeight) }
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
            error={ this.fieldIsInvalid(selectedDeviceModel.displayMetrics.widthPixels, deviceData.displayMetrics.widthPixels) }
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
            error={ this.fieldIsInvalid(selectedDeviceModel.displayMetrics.heightPixels, deviceData.displayMetrics.heightPixels) }
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
   * Determines if text field value is invalid
   *
   * @param devicePropertyValue device property value
   * @param deviceDataPropertyValue device data property value
   * @returns true if values are not equal
   */
  private fieldIsInvalid = (devicePropertyValue: number | undefined, deviceDataPropertyValue: string) => {
    return devicePropertyValue !== undefined && devicePropertyValue.toString() !== deviceDataPropertyValue;
  }

  /**
   * Create new device with default values handler
   */
  private createNewDevice = async (deviceModel: DeviceModel) => {
    const { accessToken } = this.props;
    const deviceModelsApi = Api.getDeviceModelsApi(accessToken);
    const createdDevice = await deviceModelsApi.createDeviceModel({ deviceModel });
    this.props.setDeviceModels([...this.props.deviceModels, createdDevice]);
    this.onDeviceDialogClose();
  }

  /**
   * Updates device
   * 
   * @param deviceModel device model
   */
  private updateDevice = async (deviceModel: DeviceModel) => {
    const { accessToken } = this.props;
    const { selectedDeviceModel } = this.state;
    if (!selectedDeviceModel || !selectedDeviceModel.id) {
      return;
    }

    const deviceModelId = selectedDeviceModel.id;
    const deviceModelsApi = Api.getDeviceModelsApi(accessToken);
    const updatedDevice = await deviceModelsApi.updateDeviceModel({ deviceModel, deviceModelId });
    const devices = [...this.props.deviceModels];
    const index = devices.findIndex(device => updatedDevice.id === device.id);

    if (index > -1) {
      devices.splice(index, 1);
      this.props.setDeviceModels([...devices, updatedDevice]);
      this.onDeviceDialogClose();
    }
  }

  /**
   * Get card menu options
   *
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (deviceModel: DeviceModel): ActionButton[] => {
    return [
      { name: strings.dashboard.devices.dialog.deleteDeviceTitle, action: () => this.onDeleteDialogOpen(deviceModel) }
    ];
  }

  /**
   * Event handler for card click
   */
  private onCardClick = (deviceModel: DeviceModel) => {
    this.setState({
      deviceDialogOpen: true,
      newDevice: false,
      selectedDeviceModel: deviceModel,
      deviceData: this.translateDeviceToDeviceData(deviceModel)
    });
  }

  /**
   * Get action buttons
   * 
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.dashboard.devices.newDevice, action: this.onAddDeviceClick }
    ] as ActionButton[];
  }

  /**
   * Device info change handler
   *
   * @param event React change event
   */
  private onDeviceInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedDeviceModel } = this.state;
    if (!selectedDeviceModel) {
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
      const updatedDevice = this.assignDeviceDataToDevice(updatedDeviceData, selectedDeviceModel);
      this.setState({
        selectedDeviceModel: updatedDevice,
        deviceData: updatedDeviceData,
        formError: JSON.stringify(this.translateDeviceToDeviceData(updatedDevice)) !== JSON.stringify(updatedDeviceData)
      });
    } else {
      const updatedDeviceData = { ...this.state.deviceData, [target.name]: value } as DeviceModelData;
      const updatedDevice = this.assignDeviceDataToDevice(updatedDeviceData, selectedDeviceModel);
      this.setState({
        selectedDeviceModel: updatedDevice,
        deviceData: updatedDeviceData,
        formError: JSON.stringify(this.translateDeviceToDeviceData(updatedDevice)) !== JSON.stringify(updatedDeviceData)
      });
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
      selectedDeviceModel: newDeviceModel,
      deviceData: this.translateDeviceToDeviceData(newDeviceModel)
    });
  }

  /**
   * On save device click handler
   */
  private onSaveDeviceClick = () => {
    const { newDevice, deviceData, selectedDeviceModel } = this.state;
    if (!deviceData || !selectedDeviceModel) {
      return;
    }

    this.setState({ formError: false });
    const device = this.assignDeviceDataToDevice(deviceData, selectedDeviceModel);
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

      const devices = [...this.props.deviceModels];
      const index = devices.findIndex(device => deviceToDelete.id === device.id);

      if (index > -1) {
        devices.splice(index, 1);

        this.props.setDeviceModels(devices);
        this.onDeleteDialogClose();
      }
    }
  }

  /**
   * On device dialog close handler
   */
  private onDeviceDialogClose = () => {
    this.setState({
      selectedDeviceModel: undefined,
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
  private onDeleteDialogOpen = (selectedDeviceModel: DeviceModel) => {
    this.setState({
      selectedDeviceModel,
      deleteDialogOpen: true
    });
  }

  /**
   * On delete device dialog close handler
   */
  private onDeleteDialogClose = () => {
    this.setState({
      selectedDeviceModel: undefined,
      deleteDialogOpen: false
    });
  }

  /**
   * Checks deviceModel sub property type and updates its value
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
   * @param dimensions dimensions
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
    deviceModels: state.devices.deviceModels
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DeviceModelsScreen));