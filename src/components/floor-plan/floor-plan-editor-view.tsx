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
import { Exhibition, ExhibitionFloor, Coordinates, Bounds } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import FileUploader from "../generic/file-uploader";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken } from '../../types';
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
  exhibitions: Exhibition[];
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
    await this.loadViewData();
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
    const { classes, history } = this.props;
    const { exhibition } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        history={ history }
        title={ exhibition.name }
        breadcrumbs={ [] }
        actionBarButtons={ [] }
        onDashboardButtonClick={ () => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.floorPlan.title }>
            <div className={ classes.toolbarContent }>
            </div>
          </ElementNavigationPane>
          <EditorView>
            { this.renderToolbar() }
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
   * Renders a toolbar
   */
  private renderToolbar = () => {
    const { classes } = this.props;

    return (
      <div className={ classes.toolBar }>
        <div>
          <Button disableElevation variant="contained" color="secondary" onClick={ this.onSaveClick } style={{ marginRight: 8 }}>
            { strings.floorPlan.toolbar.save }
          </Button>

          <FileUploader
            uploadKey="new"
            buttonText={ strings.floorPlan.toolbar.upload }
            allowedFileTypes={ [ "image/png" ] }
            onSave={ this.onUploadSave }
          />
        </div>
      </div>
    );

  }

  /**
   * Renders editor view
   */
  private renderEditor = () => {
    const { exhibitionFloor } = this.state;
    const { exhibitionId, accessToken } = this.props;
    if (this.state.cropping && this.state.cropImageDataUrl ) {
      return (
        <FloorPlanCrop imageDataUrl={ this.state.cropImageDataUrl } onDetailsUpdate={ this.onCropDetailsUpdate } onDataUpdate={ this.onCropDataUpdate } />
      );
    }

    if (exhibitionFloor && exhibitionFloor.floorPlanUrl && exhibitionFloor.floorPlanBounds) {
      const floorBounds = exhibitionFloor.floorPlanBounds;
      const swCorner = floorBounds.southWestCorner;
      const neCorner = floorBounds.northEastCorner;
      const sw: LatLngExpression = [ swCorner.longitude, swCorner.latitude ];
      const ne: LatLngExpression = [ neCorner.longitude, neCorner.latitude ];
      const bounds = new LatLngBounds(sw, ne);
      return <FloorPlanMap accessToken={ accessToken } exhibitionFloorId={ exhibitionFloor.id } exhibitionId={ exhibitionId } bounds={ bounds } url={ exhibitionFloor.floorPlanUrl } imageHeight={ 965 } imageWidth={ 1314 }/>
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
    if (!this.props.exhibitionId || !this.props.exhibitionFloorId) {
      return;
    }

    this.setState({
      loading: true
    });

    const exhibition = this.loadExhibition();
    const exhibitionFloor = exhibition ? await this.loadExhibitionFloor(exhibition, this.props.exhibitionFloorId) : undefined;
    this.setState({
      exhibition: exhibition,
      exhibitionFloor: exhibitionFloor
    });

    this.setState({
      loading: false
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
    }
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
    const updatedDetails = { ...this.state.cropImageDetails!, [key] : value }
    this.setState({
      cropImageDetails : updatedDetails
    })
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
    }

    const neCorner: Coordinates = {
      latitude: cropImageDetails.naturalWidth,
      longitude: cropImageDetails.naturalHeight
    }

    const floorBounds: Bounds = { 
      northEastCorner : neCorner,
      southWestCorner : swCorner
    }

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
