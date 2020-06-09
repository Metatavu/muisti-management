import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import Api from "../../api/api";
import { History } from "history";
import styles from "../../styles/floor-plan-editor-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, Button } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionFloor, Coordinates, Bounds, ExhibitionRoom, ContentVersion } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, BreadcrumbData } from '../../types';
import strings from "../../localization/strings";
import 'cropperjs/dist/cropper.css';
import FloorPlanCrop from "./floor-plan-crop";
import FloorPlanCropProperties from "./floor-plan-crop-properties";
import * as cropperjs from 'cropperjs';
import FileUpload from "../../utils/file-upload";
import { LatLngExpression, LatLngBounds } from "leaflet";
import FloorPlanMap from "../generic/floor-plan-map";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId?: string;
  exhibitionFloorId?: string;
  roomId?: string;
  contentVersionId?: string;
  exhibitions: Exhibition[];
  readOnly: boolean;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  name: string;
  toolbarOpen: boolean;
  exhibition?: Exhibition;
  exhibitionFloor?: ExhibitionFloor;
  cropping: boolean;
  cropImageDataUrl?: string;
  cropImageData?: Blob;
  cropImageDetails?: cropperjs.default.ImageData;
  room?: ExhibitionRoom;
  contentVersion?: ContentVersion;
}

/**
 * Component for exhibition floor plan editor
 */
export class FloorPlanEditorView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      name: "",
      toolbarOpen: true,
      cropping: false
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.loadViewData();
    this.setState({ loading: false });
  }

  /**
   * Component did update life-cycle handler
   */
  public componentDidUpdate = async (prevProps: Props) => {
    if (prevProps.exhibitions !== this.props.exhibitions) {
      await this.loadViewData();
    }
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history, keycloak } = this.props;
    const { exhibition } = this.state;
    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    const breadCrumbs = this.getBreadCrumbsData();
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ exhibition.name }
        breadcrumbs={ [] }
        actionBarButtons={ actionBarButtons }
        onDashboardButtonClick={ () => this.onDashboardButtonClick() }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }
      >

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.floorPlan.title }>
            <div className={ classes.toolbarContent }>
            </div>
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditor() }
          </EditorView>
          <ElementSettingsPane width={ 320 } title={ strings.floorPlan.properties.title }>
            { this.renderProperties() }
          </ElementSettingsPane>
        </div>

      </BasicLayout>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditor = () => {
    const { exhibitionFloor } = this.state;
    const { exhibitionId, accessToken, readOnly } = this.props;
    if (this.state.cropping && this.state.cropImageDataUrl ) {
      return (
        <FloorPlanCrop
          imageDataUrl={ this.state.cropImageDataUrl }
          onDetailsUpdate={ this.onCropDetailsUpdate }
          onDataUpdate={ this.onCropDataUpdate }
        />
      );
    }

    if (exhibitionFloor && exhibitionFloor.floorPlanUrl && exhibitionFloor.floorPlanBounds) {
      const floorBounds = exhibitionFloor.floorPlanBounds;
      const swCorner = floorBounds.southWestCorner;
      const neCorner = floorBounds.northEastCorner;
      const sw: LatLngExpression = [ swCorner.longitude, swCorner.latitude ];
      const ne: LatLngExpression = [ neCorner.longitude, neCorner.latitude ];
      const bounds = new LatLngBounds(sw, ne);
      return (
        <FloorPlanMap
          accessToken={ accessToken }
          exhibitionFloorId={ exhibitionFloor.id }
          exhibitionId={ exhibitionId }
          bounds={ bounds }
          url={ exhibitionFloor.floorPlanUrl }
          imageHeight={ 965 }
          imageWidth={ 1314 }
          readOnly={ readOnly }
        />
      );
    }
    return null;
  }

  /**
   * Renders properties
   */
  private renderProperties = () => {
    if (this.state.cropping && this.state.cropImageDataUrl) {
      return <FloorPlanCropProperties
        imageHeight={ this.state.cropImageDetails?.height }
        imageWidth={ this.state.cropImageDetails?.width }
        naturalWidth={ this.state.cropImageDetails?.naturalWidth }
        naturalHeight={ this.state.cropImageDetails?.naturalHeight }
        onCropPropertyChange={ this.onCropPropertyChange }
      />;
    }

    return null;
  }

  /**
   * Loads view data
   */
  private loadViewData = async () => {
    const { exhibitionId, exhibitionFloorId, roomId, contentVersionId } = this.props;
    if (!this.props.exhibitionId || !this.props.exhibitionFloorId) {
      return;
    }

    const exhibition = this.loadExhibition();
    const exhibitionFloor = exhibition ? await this.loadExhibitionFloor(exhibition, this.props.exhibitionFloorId) : undefined;
    this.setState({
      exhibition: exhibition,
      exhibitionFloor: exhibitionFloor
    });
  }

  /**
   * Loads an exhibition
   *
   * @returns loads exhibition
   */
  private loadExhibition = () => {
    return this.props.exhibitions.find(exhibition => exhibition.id === this.props.exhibitionId);
  }

  /**
   * Loads an exhibition floor
   *
   * @returns loads exhibition floor
   */
  private loadExhibitionFloor = (exhibition: Exhibition, exhibitionFloorId: string) => {
    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(this.props.accessToken);

    return exhibitionFloorsApi.findExhibitionFloor({
      exhibitionId: exhibition.id!,
      floorId: exhibitionFloorId
    });
  }

  /**
   * Updates floor's floor plan image
   *
   * @param data image data
   */
  private updateFloorPlan = async (data: Blob) => {
    const exhibitionFloor = this.state.exhibitionFloor;
    if (!exhibitionFloor || !exhibitionFloor.id || !exhibitionFloor.exhibitionId) {
      return;
    }
    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(this.props.accessToken);
    const uploadedFile = await FileUpload.uploadFile(data, `/floorplans/${exhibitionFloor.exhibitionId}`);

    const floorPlanToUpdate = { ...exhibitionFloor,
      floorPlanUrl: uploadedFile.uri,
      floorPlanBounds : this.getBounds()
    };

    await exhibitionFloorsApi.updateExhibitionFloor({
      floorId: exhibitionFloor.id,
      exhibitionId: exhibitionFloor.exhibitionId,
      exhibitionFloor: floorPlanToUpdate
    });
  }

  /**
   * Event handler for crop details update
   *
   * @param details details
   */
  private onCropDetailsUpdate = (details: cropperjs.default.ImageData) => {
    this.setState({
      cropImageDetails: details
    });
  }

  /**
   * Event handler for crop data update
   *
   * @param data
   */
  private onCropDataUpdate = (data: Blob) => {
    this.setState({
      cropImageData: data,
    });
  }

  /**
   * Event handler for property data change
   */
  private onCropPropertyChange = (key: string, value: number) => {
    const updatedDetails = { ...this.state.cropImageDetails!, [key] : value };
    this.setState({
      cropImageDetails : updatedDetails
    });
  }

  /**
   * Get bounds from cropImageDetails
   */
  private getBounds = (): Bounds | undefined => {
    const { cropImageDetails } = this.state;

    if (!cropImageDetails) {
      return;
    }

    const swCorner: Coordinates = {
      latitude: 0.0,
      longitude: 0.0
    };

    const neCorner: Coordinates = {
      latitude: cropImageDetails.naturalWidth,
      longitude: cropImageDetails.naturalHeight
    };

    const floorBounds: Bounds = {
      northEastCorner : neCorner,
      southWestCorner : swCorner
    };

    return floorBounds;
  }

  /**
   * Event handler for upload save click
   *
   * @param files files
   * @param key  upload key
   */
  private onUploadSave = (files: File[], _key?: string) => {
    const file = files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = event => {
        const dataUrl = event.target?.result;
        if (dataUrl) {
          this.setState({
            cropImageDataUrl: dataUrl as string,
            cropping: true
          });
        }
      };

      reader.readAsDataURL(file);
    }
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.floorPlan.toolbar.save, action: this.onSaveClick },
      { name: strings.floorPlan.toolbar.upload, action: this.onUploadSave }
    ] as ActionButton[];
  }

  /**
   * Get breadcrumbs data
   *
   * @returns breadcrumbs data as array
   */
  private getBreadCrumbsData = () => {
    const { exhibitionId, roomId } = this.props;
    const { exhibition, room, contentVersion } = this.state;
    return [
      { name: strings.exhibitions.listTitle, url: "/v4/exhibitions" },
      { name: exhibition?.name, url: `/v4/exhibitions/${exhibitionId}/content` },
      { name: room?.name, url: `/v4/exhibitions/${exhibitionId}/content/floors/${room?.floorId}/rooms/${roomId}` },
      { name: contentVersion?.name || "" }
    ] as BreadcrumbData[];
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = async () => {
    if (this.state.cropping && this.state.cropImageData) {
      await this.updateFloorPlan(this.state.cropImageData);

      this.setState({
        cropping: false
      });
    }
  }

  /**
   * Handle dashboard click
   */
  private onDashboardButtonClick = () => {
    this.props.history.push(`/dashboard/overview`);
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
    exhibitions: state.exhibitions.exhibitions
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FloorPlanEditorView));
