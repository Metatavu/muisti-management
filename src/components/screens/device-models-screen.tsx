import { setDeviceModels } from "../../actions/devices";
import Api from "../../api/api";
import {
  DeviceModel,
  DeviceModelCapabilities,
  DeviceModelDimensions,
  DeviceModelDisplayMetrics,
  Exhibition,
  ExhibitionDevice,
  PageLayout,
  ScreenOrientation
} from "../../generated/client";
import strings from "../../localization/strings";
import ArrowDownIcon from "../../resources/gfx/svg-paths/nuoli-alas";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";
import {
  AccessToken,
  ActionButton,
  ConfirmDialogData,
  DeleteDataHolder,
  DeviceModelDataProperty,
  DeviceModelDataSubPropertyKey
} from "../../types";
import {
  DeviceModelData,
  DeviceModelDimensionsData,
  DeviceModelDisplayMetricsData
} from "../../types/device-model-string-data";
import {
  isTypeOfDeviceModelCapabilitiesData,
  isTypeOfDeviceModelDimensionsData,
  isTypeOfDeviceModelDisplayMetricsData
} from "../../types/type-guards";
import DeleteUtils from "../../utils/delete-utils";
import CardItem from "../generic/card/card-item";
import CardList from "../generic/card/card-list";
import ConfirmDialog from "../generic/confirm-dialog";
import GenericDialog from "../generic/generic-dialog";
import BasicLayout from "../layouts/basic-layout";
import {
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import produce, { Draft } from "immer";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

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
  confirmDialogData: ConfirmDialogData;
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
      deviceScreenOrientation: ScreenOrientation.Landscape,
      confirmDialogData: {
        title: strings.device.delete.deleteTitle,
        text: strings.device.delete.deleteText,
        cancelButtonText: strings.confirmDialog.cancel,
        positiveButtonText: strings.confirmDialog.delete,
        deletePossible: true,
        onCancel: this.onDeleteDialogClose,
        onClose: this.onDeleteDialogClose
      }
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;

    if (this.state.loading) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary"></CircularProgress>
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={strings.device.title}
        breadcrumbs={[]}
        actionBarButtons={actionBarButtons}
        noBackButton
      >
        {this.renderDeviceModelsCardsList()}
        {this.renderModifyDeviceDialog()}
        {this.renderConfirmDeleteDialog()}
      </BasicLayout>
    );
  };

  /**
   * Renders device models as card list
   */
  private renderDeviceModelsCardsList = () => {
    const { deviceModels } = this.props;
    const cards = deviceModels.map((deviceModel) => {
      return (
        <CardItem
          key={deviceModel.id}
          title={`${deviceModel.manufacturer} ${deviceModel.model}`}
          onClick={() => this.onCardClick(deviceModel)}
          menuOptions={this.getCardMenuOptions(deviceModel)}
          status={""}
        />
      );
    });

    return <CardList>{cards}</CardList>;
  };

  /**
   * Renders device model delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { confirmDialogData, deleteDialogOpen } = this.state;

    return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
  };

  /**
   * Renders device model modification dialog
   */
  private renderModifyDeviceDialog = () => {
    const { newDevice, deviceDialogOpen, deviceData, formError } = this.state;

    if (!deviceData) {
      return;
    }

    return (
      <GenericDialog
        open={deviceDialogOpen}
        error={formError}
        title={
          newDevice
            ? `${strings.device.newDevice}`
            : deviceData
            ? `${deviceData.manufacturer} ${deviceData.model}`
            : ""
        }
        onClose={this.onDeviceDialogClose}
        onCancel={this.onDeviceDialogClose}
        onConfirm={this.onSaveDeviceClick}
        positiveButtonText={strings.editorDialog.save}
        cancelButtonText={strings.editorDialog.cancel}
      >
        {this.renderDeviceDialogContent()}
      </GenericDialog>
    );
  };

  /**
   * Render device dialog content
   */
  private renderDeviceDialogContent = () => {
    const { selectedDeviceModel, deviceData } = this.state;

    const typeOptions = [
      { name: strings.deviceTypes.screen, value: "SCREEN" },
      { name: strings.deviceTypes.projector, value: "PROJECTOR" }
    ];

    const orientationOptions = [
      { name: strings.device.dialog.portrait, value: ScreenOrientation.Portrait },
      { name: strings.device.dialog.landscape, value: ScreenOrientation.Landscape }
    ];

    if (!deviceData || !selectedDeviceModel) {
      return;
    }

    return (
      <>
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">
          {strings.device.dialog.dimensions.physicalSize}
        </Typography>
        <Grid container spacing={2} style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={4}>
            <TextField
              error={this.fieldIsInvalid(
                selectedDeviceModel.dimensions.deviceWidth,
                deviceData.dimensions.deviceWidth
              )}
              fullWidth
              type="width"
              label={strings.device.dialog.dimensions.width}
              InputProps={{
                endAdornment: <InputAdornment position="end">mm</InputAdornment>
              }}
              variant="filled"
              name="dimensions.deviceWidth"
              value={deviceData ? deviceData.dimensions.deviceWidth : ""}
              onChange={this.onDeviceInfoChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              error={this.fieldIsInvalid(
                selectedDeviceModel.dimensions.deviceHeight,
                deviceData.dimensions.deviceHeight
              )}
              fullWidth
              type="height"
              label={strings.device.dialog.dimensions.height}
              InputProps={{
                endAdornment: <InputAdornment position="end">mm</InputAdornment>
              }}
              variant="filled"
              name="dimensions.deviceHeight"
              value={deviceData ? deviceData.dimensions.deviceHeight : ""}
              onChange={this.onDeviceInfoChange}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              error={this.fieldIsInvalid(
                selectedDeviceModel.dimensions.deviceDepth,
                deviceData.dimensions.deviceDepth
              )}
              fullWidth
              type="depth"
              label={strings.device.dialog.dimensions.depth}
              InputProps={{
                endAdornment: <InputAdornment position="end">mm</InputAdornment>
              }}
              variant="filled"
              name="dimensions.deviceDepth"
              value={deviceData ? deviceData.dimensions.deviceDepth : ""}
              onChange={this.onDeviceInfoChange}
            />
          </Grid>
        </Grid>

        <Typography style={{ marginBottom: theme.spacing(1) }} variant="h6">
          {strings.device.dialog.displayMetrics.displayInfo}
        </Typography>
        {this.renderDisplayMetricOptions()}

        <TextField
          style={{ marginTop: theme.spacing(4) }}
          fullWidth
          type="manufacturer"
          label={strings.device.dialog.brand}
          variant="filled"
          name="manufacturer"
          value={deviceData ? deviceData.manufacturer : ""}
          onChange={this.onDeviceInfoChange}
        />
        <TextField
          style={{ marginTop: theme.spacing(3) }}
          fullWidth
          type="model"
          label={strings.device.dialog.model}
          variant="filled"
          name="model"
          value={deviceData ? deviceData.model : ""}
          onChange={this.onDeviceInfoChange}
        />

        <Typography style={{ marginTop: theme.spacing(1) }} variant="h6">
          {strings.device.dialog.type}
        </Typography>
        <Select
          variant="filled"
          fullWidth
          IconComponent={(props) => (
            <ArrowDownIcon {...props} className={`material-icons ${props.className}`} />
          )}
          id="select-filtering"
          defaultValue="SCREEN"
        >
          {typeOptions.map((option) => (
            <MenuItem value={option.value} key={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>

        <Typography style={{ marginTop: theme.spacing(1) }} variant="h6">
          {strings.device.dialog.defaultOrientation}
        </Typography>
        <Select
          variant="filled"
          fullWidth
          IconComponent={(props) => (
            <ArrowDownIcon {...props} className={`material-icons ${props.className}`} />
          )}
          id="select-filtering"
          name="screenOrientation"
          value={selectedDeviceModel.screenOrientation}
          onChange={this.onDeviceInfoSelectChange}
        >
          {orientationOptions.map((option) => (
            <MenuItem value={option.value} key={option.value}>
              {option.name}
            </MenuItem>
          ))}
        </Select>
        <FormControlLabel
          style={{ marginTop: theme.spacing(2) }}
          control={
            <Switch
              checked={selectedDeviceModel.capabilities.touch}
              onChange={this.onDeviceInfoChange}
              color="secondary"
              name="capabilities.touch"
              inputProps={{ "aria-label": "primary checkbox" }}
            />
          }
          label={strings.device.dialog.touchscreen}
        />
      </>
    );
  };

  /**
   * Render display metric options
   */
  private renderDisplayMetricOptions = () => {
    const { deviceData, selectedDeviceModel } = this.state;

    if (!selectedDeviceModel || !deviceData) {
      return;
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            error={this.fieldIsInvalid(
              selectedDeviceModel.dimensions.screenWidth,
              deviceData.dimensions.screenWidth
            )}
            fullWidth
            type="screenWidth"
            label={strings.device.dialog.dimensions.screenWidth}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>
            }}
            variant="outlined"
            value={deviceData ? deviceData.dimensions.screenWidth : ""}
            name="dimensions.screenWidth"
            onChange={this.onDeviceInfoChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            error={this.fieldIsInvalid(
              selectedDeviceModel.dimensions.screenHeight,
              deviceData.dimensions.screenHeight
            )}
            fullWidth
            type="screenHeight"
            label={strings.device.dialog.dimensions.screenHeight}
            InputProps={{
              endAdornment: <InputAdornment position="end">mm</InputAdornment>
            }}
            variant="outlined"
            value={deviceData ? deviceData.dimensions.screenHeight : ""}
            name="dimensions.screenHeight"
            onChange={this.onDeviceInfoChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            error={this.fieldIsInvalid(
              selectedDeviceModel.displayMetrics.widthPixels,
              deviceData.displayMetrics.widthPixels
            )}
            fullWidth
            type="widthPixels"
            label={strings.device.dialog.displayMetrics.widthPixels}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>
            }}
            variant="outlined"
            value={deviceData ? deviceData.displayMetrics.widthPixels : ""}
            name="displayMetrics.widthPixels"
            onChange={this.onDeviceInfoChange}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            error={this.fieldIsInvalid(
              selectedDeviceModel.displayMetrics.heightPixels,
              deviceData.displayMetrics.heightPixels
            )}
            fullWidth
            type="heightPixels"
            label={strings.device.dialog.displayMetrics.heightPixels}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>
            }}
            variant="outlined"
            value={deviceData ? deviceData.displayMetrics.heightPixels : ""}
            name="displayMetrics.heightPixels"
            onChange={this.onDeviceInfoChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            type="xdpi"
            label={strings.device.dialog.displayMetrics.xdpi}
            variant="outlined"
            value={deviceData.displayMetrics.xdpi ?? ""}
            name="displayMetrics.xdpi"
            onChange={this.onDeviceInfoChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            type="ydpi"
            label={strings.device.dialog.displayMetrics.ydpi}
            variant="outlined"
            value={deviceData.displayMetrics.ydpi ?? ""}
            name="displayMetrics.ydpi"
            onChange={this.onDeviceInfoChange}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            fullWidth
            type="density"
            label={strings.device.dialog.displayMetrics.density}
            variant="outlined"
            value={deviceData.displayMetrics.density ?? ""}
            name="displayMetrics.density"
            onChange={this.onDeviceInfoChange}
          />
        </Grid>
      </Grid>
    );
  };

  /**
   * Determines if text field value is invalid
   *
   * @param devicePropertyValue device property value
   * @param deviceDataPropertyValue device data property value
   * @returns true if values are not equal
   */
  private fieldIsInvalid = (
    devicePropertyValue: number | undefined,
    deviceDataPropertyValue: string
  ) => {
    return (
      devicePropertyValue !== undefined &&
      devicePropertyValue.toString() !== deviceDataPropertyValue
    );
  };

  /**
   * Creates new device model with default values
   *
   * @param deviceModel device model
   */
  private createNewDevice = async (deviceModel: DeviceModel) => {
    const { accessToken } = this.props;
    const deviceModelsApi = Api.getDeviceModelsApi(accessToken);
    const createdDevice = await deviceModelsApi.createDeviceModel({ deviceModel });
    this.props.setDeviceModels([...this.props.deviceModels, createdDevice]);
    this.onDeviceDialogClose();
  };

  /**
   * Updates device model
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
    const index = devices.findIndex((device) => updatedDevice.id === device.id);

    if (index > -1) {
      devices.splice(index, 1, updatedDevice);
      this.props.setDeviceModels([...devices]);
      this.onDeviceDialogClose();
    }
  };

  /**
   * Get card menu options for device models
   *
   * @param deviceModel device model
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (deviceModel: DeviceModel): ActionButton[] => {
    return [
      {
        name: strings.device.delete.deleteTitle,
        action: () => this.onDeleteDialogOpen(deviceModel)
      }
    ];
  };

  /**
   * Get action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [{ name: strings.device.newDevice, action: this.onAddDeviceClick }] as ActionButton[];
  };

  /**
   * Event handler for card click
   *
   * @param deviceModel device model
   */
  private onCardClick = (deviceModel: DeviceModel) => {
    this.setState({
      deviceDialogOpen: true,
      newDevice: false,
      selectedDeviceModel: deviceModel,
      deviceData: this.translateDeviceToDeviceData(deviceModel)
    });
  };

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
    const value: string | boolean =
      target.name === "capabilities.touch" ? target.checked : target.value;
    const keys = target.name.split(".");

    if (keys.length > 1) {
      const key1 = keys[0] as keyof DeviceModelData;
      const key2 = keys[1] as DeviceModelDataSubPropertyKey;
      const deviceData = { ...this.state.deviceData } as DeviceModelData;
      const propertyToUpdate = deviceData[key1] as DeviceModelDataProperty;
      const updatedProperty = this.updateSubProperty(propertyToUpdate, key2, value);
      const updatedDeviceData = { ...deviceData, [key1]: updatedProperty } as DeviceModelData;
      const updatedDevice = this.assignDeviceDataToDevice(
        updatedDeviceData,
        selectedDeviceModel,
        true
      );
      this.setState({
        selectedDeviceModel: updatedDevice,
        deviceData: updatedDeviceData,
        formError:
          JSON.stringify(this.translateDeviceToDeviceData(updatedDevice)) !==
          JSON.stringify(updatedDeviceData)
      });
    } else {
      const updatedDeviceData = {
        ...this.state.deviceData,
        [target.name]: value
      } as DeviceModelData;
      const updatedDevice = this.assignDeviceDataToDevice(
        updatedDeviceData,
        selectedDeviceModel,
        true
      );
      this.setState({
        selectedDeviceModel: updatedDevice,
        deviceData: updatedDeviceData,
        formError:
          JSON.stringify(this.translateDeviceToDeviceData(updatedDevice)) !==
          JSON.stringify(updatedDeviceData)
      });
    }
  };

  /**
   * On device select info change handler
   *
   * @param event react change event
   */
  private onDeviceInfoSelectChange = (event: SelectChangeEvent<string>) => {
    const { selectedDeviceModel } = this.state;
    if (!selectedDeviceModel) {
      return;
    }

    const key = event.target.name;
    const value = event.target.value;

    if (!key) {
      return;
    }

    this.setState(
      produce((draft: Draft<State>) => {
        draft.selectedDeviceModel = { ...selectedDeviceModel, [key]: value };
      })
    );
  };

  /**
   * Adds new device model to state handler. Note: this just creates new device to state.
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
      model: "Model",
      screenOrientation: ScreenOrientation.Portrait
    };

    this.setState({
      deviceDialogOpen: true,
      deviceSettingsPanelOpen: true,
      newDevice: true,
      selectedDeviceModel: newDeviceModel,
      deviceData: this.translateDeviceToDeviceData(newDeviceModel)
    });
  };

  /**
   * Event handler for save device model click
   */
  private onSaveDeviceClick = () => {
    const { newDevice, deviceData, selectedDeviceModel } = this.state;
    if (!deviceData || !selectedDeviceModel) {
      return;
    }

    this.setState({ formError: false });
    const device = this.assignDeviceDataToDevice(deviceData, selectedDeviceModel, false);
    if (newDevice) {
      this.createNewDevice(device);
    } else {
      this.updateDevice(device);
    }
  };

  /**
   * Event handler for Delete device click
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
      const index = devices.findIndex((device) => deviceToDelete.id === device.id);

      if (index > -1) {
        devices.splice(index, 1);

        this.props.setDeviceModels(devices);
        this.onDeleteDialogClose();
      }
    }
  };

  /**
   * Event handler for device dialog close
   */
  private onDeviceDialogClose = () => {
    this.setState({
      selectedDeviceModel: undefined,
      deviceData: undefined,
      deviceDialogOpen: false,
      formError: false
    });
  };

  /**
   * Event handler for open delete device dialog
   *
   * @param selectedDevice selected device
   */
  private onDeleteDialogOpen = async (selectedDeviceModel: DeviceModel) => {
    const { accessToken } = this.props;

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);
    const devicesApi = Api.getExhibitionDevicesApi(accessToken);

    const [allExhibitions, layouts] = await Promise.all([
      exhibitionsApi.listExhibitions(),
      pageLayoutsApi.listPageLayouts({ deviceModelId: selectedDeviceModel.id })
    ]);

    const devices: ExhibitionDevice[] = [];
    const exhibitions: Exhibition[] = [];
    for (const exhibition of allExhibitions) {
      const exhibitionDevices = await devicesApi.listExhibitionDevices({
        exhibitionId: exhibition.id!,
        deviceModelId: selectedDeviceModel.id
      });

      if (exhibitionDevices.length > 0) {
        devices.push(...exhibitionDevices);
        exhibitions.push(exhibition);
      }
    }

    const tempDeleteData = { ...this.state.confirmDialogData } as ConfirmDialogData;
    if (devices.length > 0) {
      tempDeleteData.deletePossible = false;
      tempDeleteData.contentTitle = strings.device.delete.contentTitle;
      const holder: DeleteDataHolder[] = [];

      holder.push({ objects: devices, localizedMessage: strings.deleteContent.devices });
      holder.push({ objects: exhibitions, localizedMessage: strings.deleteContent.exhibitions });
      holder.push({ objects: layouts, localizedMessage: strings.deleteContent.layouts });
      tempDeleteData.contentSpecificMessages = DeleteUtils.constructContentDeleteMessages(holder);
    }

    tempDeleteData.onConfirm = () => this.onDeleteDeviceClick(selectedDeviceModel);

    this.setState({
      selectedDeviceModel,
      deleteDialogOpen: true,
      confirmDialogData: tempDeleteData
    });
  };

  /**
   * Event handler for close delete device dialog
   */
  private onDeleteDialogClose = () => {
    this.setState({
      selectedDeviceModel: undefined,
      deleteDialogOpen: false
    });
  };

  /**
   * Checks deviceModel sub property type and updates its value
   *
   * @param propertyToUpdate property to update
   * @param key property key
   * @param value new value
   * @returns updated property
   */
  private updateSubProperty = (
    property: DeviceModelDataProperty,
    key: DeviceModelDataSubPropertyKey,
    value: string | boolean
  ): DeviceModelDataProperty => {
    const updatedProperty = { ...property } as DeviceModelDataProperty;
    if (isTypeOfDeviceModelDimensionsData(updatedProperty)) {
      updatedProperty[key as keyof DeviceModelDimensionsData] = value as string;
    } else if (isTypeOfDeviceModelDisplayMetricsData(updatedProperty)) {
      updatedProperty[key as keyof DeviceModelDisplayMetricsData] = value as string;
    } else if (isTypeOfDeviceModelCapabilitiesData(updatedProperty)) {
      updatedProperty[key as keyof DeviceModelCapabilities] = value as boolean;
    }

    return updatedProperty;
  };

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
    };

    return deviceData;
  };

  /**
   * Assigns device model data to device model
   *
   * @param deviceData device model data
   * @param device device model
   * @returns device model
   */
  private assignDeviceDataToDevice = (
    deviceData: DeviceModelData,
    device: DeviceModel,
    modify: boolean
  ): DeviceModel => {
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
  };
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
