import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setDeviceModels } from "../../actions/devices";

// eslint-disable-next-line max-len
import { ListItemSecondaryAction, TextField, Switch, Button, WithStyles, withStyles, Typography, Select, MenuItem, Grid, Divider, ListItemAvatar, ListItem, List, ListItemText, CircularProgress, IconButton, FormControlLabel } from '@material-ui/core';

import DeleteIcon from '@material-ui/icons/Delete';

import styles from "../../styles/dashboard-component-styles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken, DeviceSubProperty, DeviceSubPropertyKey } from "../../types";
import { DeviceModel, DeviceModelCapabilities, DeviceModelDisplayMetrics, DeviceModelDimensions, ScreenOrientation } from "../../generated/client";
import strings from "../../localization/strings";
import DashboardLayout from "./dashboard-layout";
import moment from "moment";
import Api from "../../api/api";

import ArrowDownIcon from "../../resources/gfx/svg-paths/nuoli-alas";
import ProjectorIcon from "../../resources/gfx/svg-paths/projektori";
import PortraitIcon from "../../resources/gfx/svg-paths/pystytaso";
import LandscapeIcon from "../../resources/gfx/svg-paths/vaakataso";

import EditorDialog from '../generic/editor-dialog';
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import theme from "../../styles/theme";
import ConfirmDialog from "../generic/confirm-dialog";
import SelectionGroup from '../generic/selection-group';
import { SelectOptions, OptionData } from "../generic/selection-group";

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
  loading: boolean;
  deviceSettingsPanelOpen: boolean;
  newDevice: boolean;
  selectedDevice?: DeviceModel;
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
                onClick={ () => this.onAddDeviceClick() }
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
          onClose={ () => this.onDeleteDialogClose() }
          onCancel={ () => this.onDeleteDialogClose() }
          onConfirm={ () => this.onDeleteDeviceClick(selectedDevice) }
          positiveButtonText={ strings.confirmDialog.delete }
          cancelButtonText={ strings.confirmDialog.cancel }
        />
      );
    }
  }

  /**
   * Render device settings view
   */
  private renderModifyDeviceDialog = () => {

    const { selectedDevice, newDevice, deviceDialogOpen, deviceScreenOrientation } = this.state;

    const typeOptions = [
      { name: strings.deviceTypes.screen , value: "SCREEN" },
      { name: strings.deviceTypes.projector , value: "PROJECTOR" },
    ];

    const selectedIndex = deviceScreenOrientation === ScreenOrientation.Portrait ? 0 : 1;
    const selectOptionsData: OptionData[] = [
      { icon: <PortraitIcon /> },
      { icon: <LandscapeIcon /> }
    ];
    const selectOptions: SelectOptions = {
      data: selectOptionsData
    };

    return (
      <EditorDialog
        open={ deviceDialogOpen }
        title={ newDevice ? `${ strings.dashboard.devices.newDevice }` : selectedDevice ? `${selectedDevice.manufacturer} ${selectedDevice.model}` : "" }
        onClose={ () => this.onDeviceDialogClose() }
        onCancel={ () => this.onDeviceDialogClose() }
        onConfirm={ () => this.onSaveDeviceClick() }
        positiveButtonText={ strings.editorDialog.save }
        cancelButtonText={ strings.editorDialog.cancel }
      >
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.dashboard.devices.dialog.dimensions.physicalSize }</Typography>
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }} >
          <Grid item xs={ 4 }>
            <TextField
              fullWidth
              type="height"
              label={ strings.dashboard.devices.dialog.dimensions.height }
              variant="filled"
              name="dimensions.height"
              value={ selectedDevice ? selectedDevice.dimensions.height : "" }
              onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onDeviceInfoChange(event) }
            />
          </Grid>
          <Grid item xs={ 4 }>
            <TextField
              fullWidth
              type="width"
              label={ strings.dashboard.devices.dialog.dimensions.width }
              variant="filled"
              name="dimensions.width"
              value={ selectedDevice ? selectedDevice.dimensions.width : "" }
              onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onDeviceInfoChange(event) }
            />
          </Grid>
          <Grid item xs={ 4 }>
            <TextField
              disabled
              fullWidth
              type="depth"
              label={ strings.dashboard.devices.dialog.dimensions.depth }
              variant="filled"
              name="dimensions.depth"
              value={ "" }
              onChange={ (event: React.ChangeEvent<HTMLInputElement>) => this.onDeviceInfoChange(event) }
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
          value={ selectedDevice ? selectedDevice.manufacturer : "" }
          onChange={ this.onDeviceInfoChange }
        />
        <TextField
          style={{ marginTop: theme.spacing(3) }}
          fullWidth
          type="model"
          label={ strings.dashboard.devices.dialog.model }
          variant="filled"
          name="model"
          value={ selectedDevice ? selectedDevice.model : "" }
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
        <Typography style={{ marginTop: theme.spacing(2) }} variant="h6">{ strings.layout.settings.screenOrientation }</Typography>
        <Grid style={{ marginTop: theme.spacing(1), marginLeft: 4 }} container xs={ 6 }>
          <SelectionGroup
            options={ selectOptions }
            selectedIndex={ selectedIndex }
            onChange={ this.onSelectChange }
            />
        </Grid>
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
    const { selectedDevice } = this.state;

    return (
      <Grid container spacing={ 2 }>
        <Grid item xs={ 6 }>
          <TextField
            fullWidth
            type="heightPixels"
            label={ strings.dashboard.devices.dialog.displayMetrics.displayHeight }
            variant="outlined"
            value={ selectedDevice ? selectedDevice.displayMetrics.heightPixels : "" }
            name="displayMetrics.heightPixels"
            onChange={ this.onDeviceInfoChange }
          />
        </Grid>
        <Grid item xs={ 6 }>
          <TextField
            fullWidth
            type="widthPixels"
            label={ strings.dashboard.devices.dialog.displayMetrics.displayWidth }
            variant="outlined"
            value={ selectedDevice ? selectedDevice.displayMetrics.widthPixels : "" }
            name="displayMetrics.widthPixels"
            onChange={ this.onDeviceInfoChange }
            />
        </Grid>
        <Grid item xs={ 6 }>
          <TextField
            fullWidth
            disabled
            type="xdpi"
            label={ strings.dashboard.devices.dialog.displayMetrics.displayXDpi }
            variant="outlined"
            value={ selectedDevice ? selectedDevice.displayMetrics.xdpi : "" }
          />
        </Grid>
        <Grid item xs={ 6 }>
          <TextField
            fullWidth
            disabled
            type="ydpi"
            label={ strings.dashboard.devices.dialog.displayMetrics.displayYDpi } variant="outlined"
            value={ selectedDevice ? selectedDevice.displayMetrics.ydpi : "" }
          />
        </Grid>
        <Grid item xs={ 12 }>
          <TextField
            fullWidth
            disabled
            type="density"
            label={ strings.dashboard.devices.dialog.displayMetrics.density } variant="outlined"
            value={ selectedDevice ? selectedDevice.displayMetrics.density : "" }
          />
        </Grid>
      </Grid>
    );
  }

  /**
   * Device info change handler
   * @param event React change event
   * @param checkboxValue checkbox value
   */
  private onDeviceInfoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value: string | boolean = target.name === "capabilities.touch" ? target.checked : target.value;

    const keys = target.name.split(".");

    if (keys.length > 1) {
      const key1 = keys[0] as keyof DeviceModel;
      const key2 = keys[1] as DeviceSubPropertyKey;
      const deviceToUpdate = { ...this.state.selectedDevice } as DeviceModel;
      const propertyToUpdate = deviceToUpdate[key1] as DeviceSubProperty;
      const updatedProperty = this.updateSubProperty(propertyToUpdate, key2, value);
      const updatedDevice = { ...deviceToUpdate, [key1]: updatedProperty };

      if (target.name.includes("dimensions") || target.name.includes("displayMetrics")) {
        const { width, height } = updatedDevice.dimensions;
        const { heightPixels, widthPixels } = updatedDevice.displayMetrics;
        const pixelDensities = this.calculatePixelDensity(width || 0, height || 0, heightPixels || 0, widthPixels || 0);
        const overallDpi = this.calculateOverallDpi(width || 0, height || 0, heightPixels || 0, widthPixels || 0);
        const density = this.resolveDensity(overallDpi);
        updatedDevice.displayMetrics = {
          ...updatedDevice.displayMetrics,
          density: density,
          xdpi: pixelDensities[0],
          ydpi: pixelDensities[1]
        }
      }

      this.setState({
        selectedDevice : updatedDevice
      });
    } else {
      const updatedDevice = { ...this.state.selectedDevice, [target.name]: value } as DeviceModel;
      this.setState({
        selectedDevice : updatedDevice
      });
    }
  }

  /**
   * On select change handler
   * @param index selected option index
   */
  private onSelectChange = (index: number) => {
    this.setState({
      deviceScreenOrientation: index === 0 ? ScreenOrientation.Portrait : ScreenOrientation.Landscape
    });
  }

  /**
   * On device click handler
   * @param device selected device
   */
  private onDeviceClick = (device: DeviceModel) => {
    this.setState({
      deviceDialogOpen: true,
      newDevice: false,
      selectedDevice: device
    });
  }

  /**
   * Delete device click handler
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
    const { newDevice } = this.state;

    if (newDevice) {
      this.createNewDevice();
    }
    else {
      this.updateDevice();
    }
  }

  /**
   * Create new device with default values handler
   */
  private createNewDevice = async () => {
    const { accessToken } = this.props;
    const { selectedDevice } = this.state;

    if (selectedDevice) {
      const deviceModelsApi = Api.getDeviceModelsApi(accessToken);

      const createdDevice = await deviceModelsApi.createDeviceModel({
        deviceModel: selectedDevice
      });

      this.props.setDeviceModels([...this.props.devices, createdDevice]);
      this.onDeviceDialogClose();
    }
  }

  /**
   * Update device handler
   */
  private updateDevice = async () => {
    const { accessToken } = this.props;
    const { selectedDevice } = this.state;

    if (selectedDevice) {
      const deviceModelsApi = Api.getDeviceModelsApi(accessToken);

      const updatedDevice = await deviceModelsApi.updateDeviceModel({
        deviceModel: selectedDevice,
        deviceModelId: selectedDevice.id!
      });

      const devices = [...this.props.devices];
      const index = devices.findIndex(device => updatedDevice.id === device.id);

      if (index > -1) {
        devices.splice(index, 1);

        this.props.setDeviceModels([...devices, updatedDevice]);
        this.onDeviceDialogClose();
      }
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
      width: 100,
      height: 100
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
    });
  }

  /**
   * On device dialog close handler
   */
  private onDeviceDialogClose = () => {
    this.setState({
      selectedDevice: undefined,
      deviceDialogOpen: false
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
  private updateSubProperty = (propertyToUpdate: DeviceSubProperty, key: DeviceSubPropertyKey, value: string | boolean): DeviceSubProperty => {
    if ((propertyToUpdate as DeviceModelDimensions)[key as keyof DeviceModelDimensions]) {
      (propertyToUpdate as DeviceModelDimensions)[key as keyof DeviceModelDimensions] = parseInt(value as string, 10);
    } else if ((propertyToUpdate as DeviceModelDisplayMetrics)[key as keyof DeviceModelDisplayMetrics]) {
      (propertyToUpdate as DeviceModelDimensions)[key as keyof DeviceModelDimensions] = parseInt(value as string, 10);
    } else if ((propertyToUpdate as DeviceModelCapabilities)[key as keyof DeviceModelCapabilities]) {
      (propertyToUpdate as DeviceModelCapabilities)[key as keyof DeviceModelCapabilities] = value as boolean;
    }

    return propertyToUpdate;
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