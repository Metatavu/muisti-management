import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/exhibition-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, Typography } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
// tslint:disable-next-line: max-line-length
import { Exhibition, ExhibitionPage, PageLayout, DeviceModel, ExhibitionRoom, ExhibitionPageEventTrigger, ExhibitionDevice, ContentVersion, ExhibitionDeviceGroup, ExhibitionPageEventTriggerFromJSON, ExhibitionPageResourceFromJSON, ExhibitionPageTransition, GroupContentVersion, ExhibitionPageResource } from "../../generated/client";
import EventTriggerEditor from "../right-panel-editors/event-trigger-editor";
import ExhibitionTreeMenu from "../left-panel-editors/exhibition-tree-menu";
import BasicLayout from "../layouts/basic-layout";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import ElementContentsPane from "../layouts/element-contents-pane";
import EditorView from "../editor/editor-view";
import CodeEditor from "../editor/code-editor";
import ResourceEditor from "../right-panel-editors/resource-editor";
import PageSettingsEditor from "../left-middle-panel-editors/page-settings-editor";
import DeviceSettingsEditor from "../left-middle-panel-editors/device-settings-editor";
import { AccessToken, BreadcrumbData, ActionButton } from '../../types';
import strings from "../../localization/strings";
import AndroidUtils from "../../utils/android-utils";
import PagePreview from "../preview/page-preview";
import PageUtils from "../../utils/page-utils";
import ResourceUtils from "../../utils/resource-utils";
import { TreeNodeInArray } from "react-simple-tree-menu";
import produce from "immer";
import PanZoom from "../generic/pan-zoom";

type View = "CODE" | "VISUAL";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  floorId: string;
  roomId: string;
  contentVersionId: string;
  groupContentVersionId: string;
  exhibition: Exhibition;
  layouts: PageLayout[];
  deviceModels: DeviceModel[];
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
  room?: ExhibitionRoom;
  contentVersion?: ContentVersion;
  groupContentVersion?: GroupContentVersion;
  deviceGroup?: ExhibitionDeviceGroup;
  pageLayout?: PageLayout;
  selectedDevice?: ExhibitionDevice;
  selectedPage?: ExhibitionPage;
  selectedResourceIndex?: number;
  selectedEventTriggerIndex?: number;
  view: View;
  name: string;
}

/**
 * Component for timeline screen
 */
export class TimelineScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      devices: [],
      pages: [],
      view: "VISUAL",
      name: ""
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { exhibition, exhibitionId, accessToken } = this.props;

    if (!exhibition || exhibitionId !== exhibition.id) {
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      this.props.setSelectedExhibition(await exhibitionsApi.findExhibition({ exhibitionId }));
      return;
    }

    this.fetchComponentData();
  }

  /**
   * Component did update life cycle handler
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (!prevProps.exhibition && this.props.exhibition) {
      this.fetchComponentData();
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, exhibition, history } = this.props;
    const { selectedResourceIndex, selectedEventTriggerIndex, selectedPage } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading) {
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
        breadcrumbs={ this.getBreadcrumbsData() }
        actionBarButtons={ this.getActionButtons() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title="">
            <ExhibitionTreeMenu treeData={ this.constructTreeData() } />
          </ElementNavigationPane>

          <ElementContentsPane title="">
            { this.renderElementContents() }
          </ElementContentsPane>

          <EditorView>
            { this.renderEditor() }
          </EditorView>

          <ElementSettingsPane
            width={ 380 }
            title={ selectedPage ? selectedPage.name : "" }
            open={ selectedResourceIndex !== undefined || selectedEventTriggerIndex !== undefined }
          >
            {
              selectedResourceIndex !== undefined &&
              this.renderResourceEditor()
            }
            {
              selectedEventTriggerIndex !== undefined &&
              this.renderEventTriggerEditor()
            }
          </ElementSettingsPane>
        </div>

      </BasicLayout>
    );
  }

  /**
   * Renders editor
   */
  private renderEditor = () => {
    switch (this.state.view) {
      case "CODE":
        return this.renderCodeEditor();
      case "VISUAL":
        return this.renderVisualEditor();
      default:
        return null;
    }
  }

  /**
   * Renders visual editor
   */
  private renderVisualEditor = () => {
    const { classes, deviceModels } = this.props;
    const { selectedPage, pageLayout } = this.state;

    if (!selectedPage || !pageLayout) {
      return;
    }
    console.log(selectedPage);
    
    const view = pageLayout.data;
    const resources = selectedPage.resources;
    const deviceModel = deviceModels.find(model => model.id === pageLayout.modelId);
    const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel ? deviceModel : deviceModels[0]);
    const scale = 1;

    return (
      <div className={ classes.visualEditorContainer }>
        <PanZoom minScale={ 0.1 } fitContent={ true } contentWidth={ displayMetrics.widthPixels } contentHeight={ displayMetrics.heightPixels }>
          <PagePreview
            screenOrientation={ pageLayout.screenOrientation }
            view={ view }
            resources={ resources }
            displayMetrics={ displayMetrics }
            scale={ scale } />
        </PanZoom>
      </div>
    );
  }

  /**
   * Renders code editor
   */
  private renderCodeEditor = () => {
    const { selectedPage } = this.state;
    if (!selectedPage) {
      return;
    }

    return (
      <CodeEditor
        json={ this.toJsonCode(selectedPage) }
        onChange={ (json: string) => this.applyCodeEditorChanges(json) }
      />
    );
  }

  /**
   * Renders element contents pane content
   */
  private renderElementContents = () => {
    const { selectedDevice, selectedPage } = this.state;

    if (selectedPage) {
      return this.renderPageSettings(selectedPage);
    }

    if (selectedDevice) {
      return this.renderDeviceSettings(selectedDevice);
    }
  }

  /**
   * Renders device settings
   *
   * @param deviceData device data
   */
  private renderDeviceSettings = (deviceData: ExhibitionDevice) => {
    const { classes } = this.props;
    const devicePages = this.state.pages.filter(page => page.deviceId === deviceData.id);
    return (
      <div className={ classes.toolbarContent }>
        <DeviceSettingsEditor
          deviceData={ deviceData }
          devicePages={ devicePages }
          onChange={ this.onDeviceDataChange }
        />
      </div>
    );
  }

  /**
   * Renders page settings
   */
  private renderPageSettings = (pageData: ExhibitionPage) => {
    const { classes } = this.props;
    const { pages, devices } = this.state;
    const { resources, eventTriggers } = pageData;

    return (
      <div className={ classes.toolbarContent }>
        <PageSettingsEditor
          devices={ devices }
          pages={ pages }
          resources={ resources }
          eventTriggers={ eventTriggers }
          pageData={ pageData }
          onChange={ this.onPageDataChange }
          onPageTransitionChange={ this.onTransitionChange }
          onLayoutChange={ this.onLayoutChange }
          onAddEventTriggerClick={ this.onAddEventTriggerClick }
          onResourceClick={ this.onResourceNodeClick }
          onEventTriggerClick={ this.onEventTriggerNodeClick }
        />
      </div>
    );
  }

  /**
   * Renders resource editor
   */
  private renderResourceEditor = () => {
    const { selectedResourceIndex, selectedPage } = this.state;
    if (selectedResourceIndex === undefined || !selectedPage) {
      return null;
    }

    const { resources } = selectedPage;
    if (!resources) {
      return null;
    }

    const selectedResource = resources.length > selectedResourceIndex ? resources[selectedResourceIndex] : undefined;
    if (!selectedResource) {
      return null;
    }

    console.log(selectedResource)

    return (
      <>
        <Typography variant="h3">{ selectedResource.id }</Typography>
        <ResourceEditor
          resource={ selectedResource }
          onUpdate={ this.onUpdateResource }
        />
      </>
    );
  }

  /**
   * Renders event trigger editor
   */
  private renderEventTriggerEditor = () => {
    const { history, classes } = this.props;
    const { selectedEventTriggerIndex, pageLayout, selectedDevice, pages, selectedPage } = this.state;
    if (selectedEventTriggerIndex === undefined || !pageLayout || !selectedDevice || !selectedDevice.id || !selectedPage) {
      return null;
    }

    const { eventTriggers } = selectedPage;
    if (!eventTriggers) {
      return null;
    }
    
    const selectedEventTrigger = eventTriggers.length > selectedEventTriggerIndex ? eventTriggers[selectedEventTriggerIndex] : undefined;
    if (!selectedEventTrigger) {
      return null;
    }

    return <>
      <Typography variant="h4">
        { strings.formatString(strings.exhibition.eventTrigger, selectedEventTriggerIndex + 1) }
      </Typography>
      <EventTriggerEditor
        history={ history }
        classes={ classes }
        selectedEventTrigger={ selectedEventTrigger }
        pages={ PageUtils.getSortedPages(pages.filter(page => page.deviceId === selectedDevice.id)) }
        layout={ pageLayout }
        onSave={ this.updateEventTrigger }
      />
    </>;
  }

  /**
   * Get breadcrumbs data
   * 
   * @returns breadcrumbs data as array
   */
  private getBreadcrumbsData = (): BreadcrumbData[] => {
    const { exhibitionId, exhibition, floorId, roomId, contentVersionId } = this.props;
    const { room, contentVersion, groupContentVersion } = this.state;

    return [
      {
        name: strings.exhibitions.listTitle,
        url: `/v4/exhibitions`
      },
      {
        name: exhibition.name,
        url: `/v4/exhibitions/${exhibitionId}`
      },
      {
        name: room?.name || "",
        url: `/v4/exhibitions/${exhibitionId}/floors/${floorId}/rooms/${roomId}`
      },
      {
        name: contentVersion?.name || "",
        url: `/v4/exhibitions/${exhibitionId}/floors/${floorId}/rooms/${roomId}/contentVersions/${contentVersionId}`
      },
      { 
        name: groupContentVersion?.name || ""
      }
    ];
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { selectedDevice, selectedPage, view } = this.state;

    if (selectedPage) {
      return [{
        name: view === "CODE" ?
          strings.exhibitionLayouts.editView.switchToVisualButton :
          strings.exhibitionLayouts.editView.switchToCodeButton,
        action: this.onSwitchViewClick
      }, {
        name: strings.generic.save,
        action: this.onSavePageClick
      }, {
        name: strings.exhibition.deletePage,
        action: this.onDeletePageClick
      }];
    }

    if (selectedDevice) {
      return [{
        name: strings.exhibition.addPage,
        action: this.onAddPageClick
      }, {
        name: strings.generic.save,
        action: this.onSaveDeviceClick
      }];
    }

    return [];
  }

  /**
   * Fetches component data
   */
  private fetchComponentData = async () => {
    const { accessToken, exhibitionId, roomId, contentVersionId, groupContentVersionId } = this.props;

    const roomsApi = Api.getExhibitionRoomsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const groupContentVersionsApi = Api.getGroupContentVersionsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);

    const [ room, contentVersion, groupContentVersion ] = await Promise.all([
      roomsApi.findExhibitionRoom({ exhibitionId, roomId }),
      contentVersionsApi.findContentVersion({ exhibitionId, contentVersionId }),
      groupContentVersionsApi.findGroupContentVersion({ exhibitionId, groupContentVersionId })
    ]);

    const exhibitionGroupId = groupContentVersion.deviceGroupId;
    const devices = await exhibitionDevicesApi.listExhibitionDevices({ exhibitionId, exhibitionGroupId });

    const devicePages = await Promise.all(
      devices.map(device =>
        exhibitionPagesApi.listExhibitionPages({
          exhibitionId,
          exhibitionDeviceId: device.id
        })
      )
    );
    const pages = devicePages.flat();

    this.setState({
      room,
      contentVersion,
      groupContentVersion,
      devices,
      pages
    });
  }

  /**
   * Constructs tree data
   *
   * @returns array of tree nodes in array
   */
  private constructTreeData = (): TreeNodeInArray[] => {
    const { devices, pages } = this.state;
    const treeData = devices.map(device => {
      return {
        key: device.id!,
        label: device.name,
        onSelect: () => this.onDeviceClick(device.id!),
        nodes: PageUtils.getSortedPages(pages.filter(page => page.deviceId === device.id)).map(page => {
          return {
            key: page.id!,
            label: page.name,
            onSelect: () => this.onPageClick(device.id!, page.id!),
            nodes: []
          }
        })
      }
    });

    return treeData;
  }

  /**
   * Applies changes from code editor to page object
   * 
   * @param json changed json
   */
  private applyCodeEditorChanges = (json: string) => {
    this.setState(
      produce((draft: State) => {
        if (!draft.selectedPage) {
          return;
        }

        const parsedCode = this.parseCode(json);
        if (parsedCode.resources) {
          draft.selectedPage.resources = parsedCode.resources;
        }
        
        if (parsedCode.eventTriggers) {
          draft.selectedPage.eventTriggers = parsedCode.eventTriggers;
        }
      })
    );
  }

  /**
   * Parses exhibition page json to object
   * 
   * @param json page json
   */
  private parseCode = (json: string) => {
    const result: Partial<ExhibitionPage> = {
      eventTriggers: [],
      resources: []
    };

    try {
      const parsedCode = JSON.parse(json);
      result.eventTriggers = (parsedCode.eventTriggers || []).map(ExhibitionPageEventTriggerFromJSON);
      result.resources = (parsedCode.resources || []).map(ExhibitionPageResourceFromJSON);
    } catch (error) {
      this.setState({ error });
    }

    return result;
  }

  /**
   * Serializes exhibition page into JSON code
   *
   * @param page exhibition page
   * @returns exhibition page as JSON string
   */
  private toJsonCode = (page: Partial<ExhibitionPage>): string => {
    const { resources, eventTriggers } = page;
    return JSON.stringify({ resources, eventTriggers }, null, 2);
  }

  /**
   * Event handler for event trigger add click
   */
  private onAddEventTriggerClick = () => {
    this.setState(
      produce((draft: State) => {
        if (!draft.selectedPage) {
          return;
        }

        draft.selectedPage.eventTriggers.push({
          clickViewId: (draft.selectedPage.eventTriggers.length + 1).toString(),
          delay: 0,
          events: [],
          next: []
        });
      })
    );
  }

  /**
   * Event handler for device click
   * 
   * @param deviceId selected device id
   */
  private onDeviceClick = (deviceId: string) => {
    const { devices } = this.state;
    this.setState({
      selectedDevice: devices.find(device => device.id === deviceId),
      selectedPage: undefined,
      selectedResourceIndex: undefined,
      selectedEventTriggerIndex: undefined
    });
  }
  
  /**
   * Event handler for page click
   * 
   * @param deviceId selected device id
   * @param pageId selected page id
   */
  private onPageClick = (deviceId: string, pageId: string) => {
    const { devices, pages } = this.state;
    const selectedDevice = devices.find(device => device.id === deviceId);
    const selectedPage = pages.find(page => page.id === pageId);
    if (!selectedDevice || !selectedPage) {
      return;
    }

    const pageLayout = this.props.layouts.find(layout => layout.id === selectedPage.layoutId);
    if (selectedPage.resources.length < 1) {
      if (pageLayout) {
        selectedPage.resources = ResourceUtils.getResourcesFromLayoutData(pageLayout.data);
      }
    }

    this.setState({
      selectedDevice,
      selectedPage,
      pageLayout
    });
  }

  /**
   * Event handler for resource node click
   *
   * @param selectedResourceIndex resource index of selected node
   */
  private onResourceNodeClick = (selectedResourceIndex: number) =>
    this.setState({ selectedResourceIndex, selectedEventTriggerIndex: undefined })

  /**
   * Event handler for event trigger node click
   *
   * @param selectedEventTriggerIndex event trigger index of selected node
   */
  private onEventTriggerNodeClick = (selectedEventTriggerIndex: number) => 
    this.setState({ selectedEventTriggerIndex, selectedResourceIndex: undefined })

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  private onUpdateResource = (resource: ExhibitionPageResource) => {
    this.setState(
      produce((draft: State) => {
        const { selectedResourceIndex } = draft;
        if (selectedResourceIndex === undefined ||
            !draft.selectedPage ||
            draft.selectedPage.resources.length < selectedResourceIndex) {
          return;
        }

        draft.selectedPage.resources[selectedResourceIndex] = resource;
      })
    );
  }

  /**
   * Event handler for device change
   * 
   * @param event event
   */
  private onDeviceDataChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { selectedDevice } = this.state;
    const { name, value } = event.target;
    if (!selectedDevice || !name) {
      return;
    }

    this.setState(
      produce((draft: State) => {

        draft.selectedDevice = { 
          ...draft.selectedDevice!,
          [name]: value !== strings.generic.undefined ? value : undefined
        };
      })
    );
  }

  /**
   * Event handler for transition change
   *
   * @param transitions transition list to be updated
   * @param transitionType transition type to update
   */
  private onTransitionChange = (transitions: ExhibitionPageTransition[], transitionType: string) => {
    const { selectedPage } = this.state;
    if (!selectedPage) {
      return;
    }

    if (transitionType === "enter") {
      this.setState(
        produce((draft: State) => {
          draft.selectedPage!.enterTransitions = transitions;
        })
      );
    } else if (transitionType === "exit") {
      produce((draft: State) => {
        draft.selectedPage!.exitTransitions = transitions;
      })
    }
  }

  /**
   * Updates event trigger
   * 
   * @param eventTrigger event trigger
   */
  private updateEventTrigger = (eventTrigger: ExhibitionPageEventTrigger) => {
    this.setState(
      produce((draft: State) => {
        const { selectedEventTriggerIndex } = draft;
        if (selectedEventTriggerIndex === undefined ||
          !draft.selectedPage || 
          draft.selectedPage.eventTriggers.length < selectedEventTriggerIndex) {
          return;
        }

        draft.selectedPage.eventTriggers[selectedEventTriggerIndex] = eventTrigger;
      })
    );
  }

  /**
   * Event handler for layout change
   *
   * @param event event
   */
  private onLayoutChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedPage } = this.state;
    if (!selectedPage) {
      return;
    }

    const layoutId = event.target.value;
    const selectedLayout = this.props.layouts.find(layout => layout.id === layoutId);
    if (!selectedLayout) {
      return;
    }

    const resources = ResourceUtils.getResourcesFromLayoutData(selectedLayout.data);

    this.setState(
      produce((draft: State) => {
        draft.selectedPage!.layoutId = layoutId;
        draft.selectedPage!.resources = resources;
      })
    );
  }

  /**
   * Event handler for page data change
   *
   * @param event event
   */
  private onPageDataChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedPage } = this.state;
    const { name, value } = event.target;
    if (!selectedPage || !name) {
      return;
    }

    this.setState(
      produce((draft: State) => {
        draft.selectedPage = { ...draft.selectedPage!, [name]: value };
      })
    );
  }

  /**
   * Event handler for switch view button click
   */
  private onSwitchViewClick = () => {
    this.setState(
      produce((draft: State) => {
        draft.view = draft.view === "CODE" ? "VISUAL" : "CODE";
      })
    );
  }

  /**
   * Event handler for save device click
   */
  private onSaveDeviceClick = () => {
    const { selectedDevice } = this.state;
    if (!selectedDevice) {
      return;
    }

    this.onDeviceSave({
      ...selectedDevice,
      indexPageId: selectedDevice.indexPageId,
      groupId: selectedDevice.groupId,
      name: selectedDevice.name
    });
  }

  /**
   * Event handler for save page click
   */
  private onSavePageClick = () => {
    const { selectedPage } = this.state;
    if (!selectedPage) {
      return;
    }

    this.onPageSave({ ...selectedPage });
  }

  /**
   * Event handler for add page click
   */
  private onAddPageClick = () => {
    const { layouts, contentVersionId } = this.props;
    const { selectedDevice } = this.state;
    if (!selectedDevice) {
      return;
    }
    
    const layoutId = layouts && layouts.length ? layouts[0].id : null;
    const deviceId = selectedDevice.id;
    const resources = ResourceUtils.getResourcesFromLayoutData(layouts[0].data);

    if (!layoutId || !deviceId || !contentVersionId) {
      return null;
    }

    const newPage: ExhibitionPage = {
      layoutId: layoutId,
      deviceId: deviceId,
      contentVersionId: contentVersionId,
      name: strings.exhibition.newPage,
      eventTriggers: [],
      resources: resources,
      enterTransitions: [],
      exitTransitions: []
    }

    this.setState({
      selectedPage: newPage
    });
  }

  /**
   * Event handler for delete page click
   */
  private onDeletePageClick = () => {
    const { selectedPage } = this.state;
    if (!selectedPage) {
      return;
    }
    
    /**
     * FIXME:
     * Add cleaner confirm dialog
     */
    if (!window.confirm(strings.exhibition.confirmDeletePage)) {
      return;
    }

    this.onPageDelete(selectedPage);
  }

  /**
   * Event handler for device save
   *
   * @param page page
   */
  private onDeviceSave = async (device: ExhibitionDevice) => {
    try {
      const deviceId = device.id;
      if (!deviceId) {
        return;
      }

      const exhibitionDevicesApi = Api.getExhibitionDevicesApi(this.props.accessToken);
      const updatedDevice = await exhibitionDevicesApi.updateExhibitionDevice({
        exhibitionId: this.props.exhibitionId,
        deviceId: deviceId,
        exhibitionDevice: device
      });

      this.setState(
        produce((draft: State) => {
          const deviceIndex = draft.devices.findIndex(device => device.id === deviceId);
          if (deviceIndex > -1) {
            draft.devices[deviceIndex] = updatedDevice;
          }
        })
      );
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for page save
   *
   * @param page page to save
   */
  private onPageSave = async (page: ExhibitionPage) => {
    try {
      const exhibitionPagesApi = Api.getExhibitionPagesApi(this.props.accessToken);
      if (page.id) {
        const updatedPage = await exhibitionPagesApi.updateExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          pageId: page.id,
          exhibitionPage: page
        });

        const pages = produce(this.state.pages, draft => {
          const pageIndex = draft.findIndex(page => page.id === updatedPage.id);
          if (pageIndex > -1) {
            draft[pageIndex] = updatedPage;
          }
        });

        this.setState({ pages });
      } else {
        const createdPage = await exhibitionPagesApi.createExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          exhibitionPage: page
        });

        this.setState({
          pages: [ ...this.state.pages || [], createdPage ]
        });
      }
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

    /**
   * Event handler for page delete
   * 
   * @param page page to delete
   */
  private onPageDelete = async (page: ExhibitionPage) => {
    try {
      const { accessToken, exhibitionId } = this.props;
      const pageId = page.id;
      if (!pageId) {
        return;
      }

      const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
      await exhibitionPagesApi.deleteExhibitionPage({ exhibitionId, pageId });

      this.setState(
        produce((draft: State) => {
          const pageIndex = draft.pages.findIndex(page => page.id === pageId);

          if (pageIndex > -1) {
            draft.pages.splice(pageIndex, 1);
          }

          draft.selectedPage = undefined;
          draft.selectedDevice = undefined;
          draft.selectedEventTriggerIndex = undefined;
          draft.selectedResourceIndex = undefined;
        })
      );
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
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
    exhibition: state.exhibitions.selectedExhibition as Exhibition,
    layouts: state.layouts.layouts,
    devices: state.devices.devices,
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
    setSelectedExhibition: (exhibition: Exhibition) => dispatch(setSelectedExhibition(exhibition))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TimelineScreen));
