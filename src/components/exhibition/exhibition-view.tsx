import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";
import Api from "../../api/api";

import { History } from "history";
import styles from "../../styles/exhibition-view";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, CircularProgress, ButtonGroup, Button, Typography } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition, ExhibitionPage, PageLayout, DeviceModel, ExhibitionPageEventTrigger, ExhibitionPageResource, ExhibitionPageResourceType, ExhibitionDevice, ExhibitionContentVersion, ExhibitionFloor, ExhibitionRoom, ScreenOrientation, ExhibitionDeviceGroup, ExhibitionPageEventTriggerFromJSON, ExhibitionPageResourceFromJSON, ExhibitionPageEventActionType } from "../../generated/client";
import EventTriggerEditor from "../right-panel-editors/event-trigger-editor";
import ExhibitionTreeMenu from "../left-panel-editors/exhibition-tree-menu";
import BasicLayout from "../generic/basic-layout";
import GenericButton from "../generic/generic-button";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import ElementContentsPane from "../editor-panes/element-contents-pane";
import EditorView from "../editor/editor-view";
import CodeEditor from "../editor/code-editor";
import ResourceEditor from "../right-panel-editors/resource-editor";
import PageSettingsEditor from "../left-middle-panel-editors/page-settings-editor";
import DeviceSettingsEditor from "../left-middle-panel-editors/device-settings-editor";
import AddDeviceEditor from "../left-middle-panel-editors/add-device-editor";
import { AccessToken, ExhibitionElementType, ExhibitionElement } from '../../types';
import strings from "../../localization/strings";
import AddIcon from "@material-ui/icons/AddSharp";
import AndroidUtils from "../../utils/android-utils";
import PagePreview from "../preview/page-preview";
import PageUtils from "../../utils/page-utils";

type View = "CODE" | "VISUAL";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitionId: string;
  exhibition: Exhibition;
  layouts: PageLayout[];
  devices: ExhibitionDevice[];
  deviceModels: DeviceModel[];
  setSelectedExhibition: typeof setSelectedExhibition;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  contentVersions: ExhibitionContentVersion[];
  floors: ExhibitionFloor[];
  rooms: ExhibitionRoom[];
  deviceGroups: ExhibitionDeviceGroup[];
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];
  selectedElement?: ExhibitionElement;
  pageLayout?: PageLayout;
  selectedRoomId?: string;
  selectedDeviceGroupId?: string;
  selectedContentVersionId?: string;
  selectedDeviceId?: string;
  selectedResource?: ExhibitionPageResource;
  selectedEventTriggerIndex?: number;
  view: View;
  name: string;
  jsonCode: string;
  newDevice?: Partial<ExhibitionDevice>;
}

/**
 * Component for exhibition view
 */
export class ExhibitionView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      contentVersions: [],
      floors: [],
      rooms: [],
      devices: [],
      pages: [],
      deviceGroups: [],
      view: "VISUAL",
      name: "",
      jsonCode: "{}"
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

    this.fetchExhibitionData(this.props.exhibition);
  }

  /**
   * Component did update life cycle handler
   */
  public componentDidUpdate = (prevProps: Props) => {
    if (!prevProps.exhibition && this.props.exhibition) {
      this.fetchExhibitionData(this.props.exhibition);
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, exhibition } = this.props;
    const { selectedElement, selectedResource } = this.state;

    if (!exhibition || !exhibition.id || this.state.loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        title={ exhibition.name }
        onDashboardButtonClick={() => this.onDashboardButtonClick() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }>

        <div className={ classes.editorLayout }>
          <ElementNavigationPane title="">
            <ButtonGroup fullWidth className={ classes.navigationTabs }>
              <Button>{ strings.exhibition.content }</Button>
              <Button>{ strings.exhibition.tech }</Button>
            </ButtonGroup>
            { this.renderTreeMenu() }
            <div className={ classes.actionButtons }>
              <GenericButton
                text={ strings.exhibition.addPage }
                color="secondary"
                disabled={ !this.state.selectedDeviceId || !this.state.selectedContentVersionId }
                onClick={ this.onAddPageClick }
                icon={ <AddIcon /> }
              />
              <GenericButton
                text={ strings.exhibition.addDevice }
                color="secondary"
                disabled={ !this.state.selectedDeviceGroupId }
                onClick={ this.onAddDeviceClick }
                icon={ <AddIcon /> }
              />
            </div>
          </ElementNavigationPane>

          <ElementContentsPane title={ selectedElement ? selectedElement.data.name : "" }>
            { this.state.selectedElement &&
              this.renderElementContents()
            }
          </ElementContentsPane>

          <EditorView>
            <div className={ classes.toolBar }>
              { this.renderToolbarContents() }
            </div>
            { this.renderEditor() }
          </EditorView>

          <ElementSettingsPane title={ selectedResource ? selectedResource.id : "" }>
            {
              this.state.selectedResource &&
              <ResourceEditor 
                resource={ this.state.selectedResource }
                selectedElement={ this.state.selectedElement }
                onChange={ this.onResourceDataChange} />
            }
            {
              this.state.selectedEventTriggerIndex !== undefined &&
              this.renderEventTriggerEditor()
            }
          </ElementSettingsPane>
        </div>

      </BasicLayout>
    );
  }

  /**
   * Renders toolbar contents
   */
  private renderToolbarContents = () => {
    if (this.state.newDevice) {
      return (
        <GenericButton
          text={ strings.exhibition.addDeviceEditor.saveButton }
          color="secondary"
          onClick={ this.onSaveNewDeviceClick }
        />
      );
    }

    if (this.state.selectedElement) {
      return (
        <>
          <GenericButton
            text={ this.state.view === "CODE" ?
              strings.exhibitionLayouts.editView.switchToVisualButton :
              strings.exhibitionLayouts.editView.switchToCodeButton
            }
            color="secondary"
            onClick={ this.onSwitchViewClick }
            style={{ marginRight: 8 }}
          />
          <GenericButton
            text={ strings.exhibitionLayouts.editView.saveButton }
            color="secondary"
            onClick={ this.onSaveClick }
          />
        </>
      );
    }

    return null;
  }

  /**
   * Renders tree menu
   */
  private renderTreeMenu = () => {
    const { contentVersions, floors, rooms, devices, pages } = this.state;
    return (
      <ExhibitionTreeMenu 
        contentVersions={ contentVersions }
        devices={ devices }
        floors={ floors }
        rooms={ rooms }
        pages={ pages }
        onSelect={ this.onSelectElementFromTree }
      />
    )
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
   * Renders add device editor
   */
  private renderAddDeviceEditor = () => {
    const { newDevice } = this.state;
    if (!newDevice) {
      return null;
    }

    return (
      <AddDeviceEditor
        newDevice={ newDevice }
        onModelChange={ this.onNewDeviceModelChange }
        onNameChange={ this.onNewDeviceNameChange }
        onScreenOrientationChange={ this.onNewDeviceScreenOrientationChange }
      />
    );
  }

  /**
   * Renders visual editor
   */
  private renderVisualEditor = () => {
    const { classes } = this.props;
    const { selectedElement, pageLayout } = this.state;

    if (!selectedElement) {
      return;
    }

    const parsedCode = this.parseJsonCode();
    const resources = parsedCode.resources;
    const view = pageLayout?.data;
    // TODO: load from layout
    const displayMetrics = AndroidUtils.getDisplayMetrics(this.props.deviceModels[0]);
    const scale = 0.3;

    return (
      <div className={ classes.visualEditorContainer }>
        <PagePreview
          screenOrientation={ pageLayout?.screenOrientation }
          view={ view }
          resources={ resources }
          displayMetrics={ displayMetrics }
          scale={ scale }
        />
      </div>
    );
  }

  /**
   * Renders code editor
   */
  private renderCodeEditor = () => {
    const { jsonCode } = this.state;
    return (
      <CodeEditor
        json={ jsonCode }
        parseJson={ this.parseJsonCode }
        onChange={ (json: string) => this.setState({jsonCode: json}) }
      />
    );
  }

  /**
   * Renders element contents pane content
   */
  private renderElementContents = () => {
    const { selectedElement, newDevice } = this.state;
    if (newDevice) {
      return this.renderAddDeviceEditor();
    }

    if (!selectedElement) {
      return null;
    }

    switch (selectedElement.type) {
      case ExhibitionElementType.DEVICE:
        return this.renderDeviceSettings(selectedElement.data as ExhibitionDevice);
      case ExhibitionElementType.PAGE:
        return this.renderPageSettings(selectedElement.data as ExhibitionPage);
      default:
        return null;
    }
  }

  /**
   * Renders device settings
   */
  private renderDeviceSettings = (deviceData: ExhibitionDevice) => {
    const { classes } = this.props;
    const devicePages = this.state.pages.filter(page => page.deviceId === deviceData.id);
    return (
      <div className={ classes.toolbarContent }>
        <DeviceSettingsEditor
          deviceData={ deviceData }
          devicePages={ devicePages }
          onNameChange={ this.onDeviceNameChange }
          onIndexPageChange={ this.onDeviceIndexPageChange }
        />
      </div>
    );
  }

  /**
   * Renders page settings
   */
  private renderPageSettings = (pageData: ExhibitionPage) => {
    const { classes } = this.props;
    const { resources, eventTriggers } = this.parseJsonCode();

    return (
      <div className={ classes.toolbarContent }>
        <PageSettingsEditor
          devices={ this.state.devices }
          resources={ resources || [] }
          eventTriggers={ eventTriggers || [] }
          pageData={ pageData }
          onPageNameChange={ this.onPageNameChange }
          onLayoutChange={ this.onLayoutChange }
          onDeviceChange={ this.onDeviceChange }
          onAddResourceClick={ this.onAddResourceClick }
          onAddEventTriggerClick={ this.onAddEventTriggerClick }
          onResourceClick={ this.onResourceNodeClick }
          onEventTriggerClick={ this.onEventTriggerNodeClick }
        />
      </div>
    );
  }

  /**
   * Renders event trigger editor
   */
  private renderEventTriggerEditor = () => {
    const { selectedEventTriggerIndex, pageLayout, selectedDeviceId } = this.state;
    if (selectedEventTriggerIndex === undefined || !pageLayout) {
      return null;
    }

    const { eventTriggers } = this.parseJsonCode();
    if (!eventTriggers) {
      return null;
    }
    
    const selectedEventTrigger = eventTriggers.length > selectedEventTriggerIndex ? eventTriggers[selectedEventTriggerIndex] : undefined;
    if (!selectedEventTrigger) {
      return null;
    }

    return <>
      <Typography variant="h4">{ `${ strings.exhibition.eventTrigger } ${ selectedEventTriggerIndex + 1 }` }</Typography>
      <EventTriggerEditor
        history={ this.props.history }
        classes={ this.props.classes }
        selectedEventTrigger={ selectedEventTrigger }
        pages={ PageUtils.getSortedPages(this.state.pages.filter(page => page.deviceId === selectedDeviceId)) }
        layout={ pageLayout }
        onSave={ this.updateJsonFromChild }
      />
    </>;
  }

  /**
   * Fetches exhibition data
   *
   * @param exhibition exhibition
   */
  private fetchExhibitionData = async (exhibition: Exhibition) => {
    const { accessToken } = this.props;
    const exhibitionId = exhibition.id!;
    const exhibitionContentVersionsApi = Api.getExhibitionContentVersionsApi(accessToken);
    const exhibitionFloorsApi = Api.getExhibitionFloorsApi(accessToken);
    const exhibitionRoomsApi = Api.getExhibitionRoomsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    const exhibitionDeviceGroupApi = Api.getExhibitionDeviceGroupsApi(accessToken);

    const [ contentVersions, floors, rooms, deviceGroups, devices, pages ] =
      await Promise.all<ExhibitionContentVersion[], ExhibitionFloor[], ExhibitionRoom[], ExhibitionDeviceGroup[], ExhibitionDevice[], ExhibitionPage[]>([
        exhibitionContentVersionsApi.listExhibitionContentVersions({ exhibitionId }),
        exhibitionFloorsApi.listExhibitionFloors({ exhibitionId }),
        exhibitionRoomsApi.listExhibitionRooms({ exhibitionId }),
        exhibitionDeviceGroupApi.listExhibitionDeviceGroups({ exhibitionId: exhibitionId }),
        exhibitionDevicesApi.listExhibitionDevices({ exhibitionId }),
        exhibitionPagesApi.listExhibitionPages({ exhibitionId })
      ]);

    this.setState({
      contentVersions: contentVersions,
      floors: floors,
      rooms: rooms,
      deviceGroups: deviceGroups,
      devices: devices,
      pages: pages,
    });
  }

  /**
   * Returns unique id
   *
   * @param idPrefix id prefix
   * @param existingIds existing ids
   * @return unique id
   */
  private getUniqueId = (idPrefix: string, existingIds: string[]) => {
    let index = 0;
    let id = idPrefix;

    while (existingIds.includes(id)) {
      index++;
      id = `${idPrefix}-${index}`;
    }

    return id;
  }

  /**
   * Parses JSON code from the editor
   *
   * @param errorHandler error handler for the parsing errors
   * @returns parsed JSON code from the editor
   */
  private parseJsonCode = (errorHandler?: (message: string, e?: SyntaxError) => void) => {
    const result: Partial<ExhibitionPage> = {
      eventTriggers: [],
      resources: []
    };

    try {
      const parsedCode = JSON.parse(this.state.jsonCode);
      result.eventTriggers = (parsedCode.eventTriggers || []).map(ExhibitionPageEventTriggerFromJSON);
      result.resources = (parsedCode.resources || []).map(ExhibitionPageResourceFromJSON);

      if (errorHandler) {
        this.validateParsedPage(result, errorHandler);
      }


    } catch (e) {
      if (errorHandler) {
        errorHandler(e.message, e);
      }
    }

    return result;
  }

  /**
   * Validates parsed page
   *
   * @param parsedPage parsed page
   * @param errorHandler parser error handler
   */
  private validateParsedPage = (parsedPage: Partial<ExhibitionPage>, errorHandler: (message: string, e?: SyntaxError) => void) => {
    if (!parsedPage.resources) {
      return errorHandler("Invalid resources");
    }

    if (!parsedPage.eventTriggers) {
      return errorHandler("Invalid event triggers");
    }

    const eventTypes = Object.values(ExhibitionPageEventActionType);

    for (let i = 0; i < parsedPage.resources.length; i++) {
      if (!parsedPage.resources[i].id) {
        return errorHandler(`Resource ${i} requires id`);
      }

      if (!parsedPage.resources[i].data) {
        return errorHandler(`Resource ${i} requires data`);
      }

      if (!parsedPage.resources[i].type) {
        return errorHandler(`Resource ${i} requires type`);
      }
    }

    for (let i = 0; i < parsedPage.eventTriggers.length; i++) {
      const events = parsedPage.eventTriggers[i].events || [];

      for (let j = 0; j < events.length; j++) {
        const eventAction = events[j].action;

        if (!eventAction) {
          return errorHandler(`Event ${i} requires an action`);
        }

        if (!eventTypes.includes(eventAction)) {
          return errorHandler(`Event ${i} action ${events[j].action} is not valid (${eventTypes.join(", ")})`);
        }
      }
    }
  }

  /**
   * Event handler for resource add click
   */
  private onAddResourceClick = () => {
    const parsedCode = this.parseJsonCode();
    parsedCode.resources = (parsedCode.resources || []);
    const ids = parsedCode.resources.map(resource => resource.id);

    parsedCode.resources.push({
      "id": this.getUniqueId("new", ids),
      "data": "https://example.com",
      "type": ExhibitionPageResourceType.Image
    });

    this.setState({
      jsonCode: this.toJsonCode(parsedCode)
    });
  }

  /**
   * Event handler for event trigger add click
   */
  private onAddEventTriggerClick = () => {
    const parsedCode = this.parseJsonCode();
    parsedCode.eventTriggers = (parsedCode.eventTriggers || []);

    parsedCode.eventTriggers.push({
      clickViewId: (parsedCode.eventTriggers.length + 1).toString(),
      delay: 0,
      events: [],
      next: []
    });

    this.setState({
      jsonCode: this.toJsonCode(parsedCode)
    });
  }

  /**
   * Event handler for resource node click
   *
   * @param resource selected node
   */
  private onResourceNodeClick = (resource: ExhibitionPageResource) => {
    this.setState({
      selectedEventTriggerIndex: undefined,
      selectedResource: resource
    });
  }

  /**
   * Event handler for event trigger node click
   *
   * @param eventTrigger selected node
   */
  private onEventTriggerNodeClick = (eventTriggerIndex: number) => {

    this.setState({
      selectedEventTriggerIndex: eventTriggerIndex,
      selectedResource: undefined
    });
  }

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  private onResourceDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedResource = this.state.selectedResource;
    if (!selectedResource) {
      return null;
    }

    const parsedCode = this.parseJsonCode();
    parsedCode.resources = parsedCode.resources || [];
    const index = parsedCode.resources.findIndex(resource => selectedResource.id === resource.id);
    if (index > -1) {
      parsedCode.resources[index].data = event.target.value;

      this.setState({
        selectedResource: parsedCode.resources[index],
        jsonCode: this.toJsonCode(parsedCode)
      });
    }
  }

  /**
   * Event handler for index page select change
   * 
   * @param event event
   */
  private onDeviceIndexPageChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedElement } = this.state;
    if (!selectedElement || selectedElement.type !== ExhibitionElementType.DEVICE) {
      return;
    }

    const data: ExhibitionDevice = { ...selectedElement.data as ExhibitionDevice, indexPageId: event.target.value };

    this.setState({
      selectedElement: { ...selectedElement, data }
    });
  }

  /**
   * Event handler for device name change
   *
   * @param event event
   */
  private onDeviceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedElement } = this.state;
    if (!selectedElement || selectedElement.type !== ExhibitionElementType.DEVICE) {
      return;
    }
    
    const device = selectedElement.data as ExhibitionDevice;

    this.setState({
      selectedElement: { ...selectedElement, data: { ...device, name: event.target.value }}
    });
  }

  /**
   * Event handler for page name change
   *
   * @param event event
   */
  private onPageNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedElement } = this.state;
    if (!selectedElement || selectedElement.type !== ExhibitionElementType.PAGE) {
      return;
    }


    const page = selectedElement.data as ExhibitionPage;

    this.setState({
      selectedElement: { ...selectedElement, data: { ...page, name: event.target.value }}
    });
  }

  /**
   * Update json from child component. Atm updated only event triggers
   */
  private updateJsonFromChild = (eventTrigger: ExhibitionPageEventTrigger) => {
    const { selectedEventTriggerIndex } = this.state;
    if (selectedEventTriggerIndex === undefined) {
      return;
    }

    const parsedCode = this.parseJsonCode();
    if (!parsedCode || !parsedCode.eventTriggers || parsedCode.eventTriggers.length <= selectedEventTriggerIndex) {
      return;
    }
    
    parsedCode.eventTriggers[selectedEventTriggerIndex] = eventTrigger;
    this.setState({
      jsonCode: this.toJsonCode(parsedCode)
    });
  }

  /**
   * Event handler for layout change
   *
   * @param event event
   */
  private onLayoutChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedElement } = this.state;
    if (!selectedElement || selectedElement.type !== ExhibitionElementType.PAGE) {
      return;
    }

    const data: ExhibitionPage = { ...selectedElement.data as ExhibitionPage, layoutId: event.target.value };

    this.setState({
      selectedElement: { ...selectedElement, data }
    });
  }

  /**
   * Event handler for device change
   *
   * @param event event
   */
  private onDeviceChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedElement } = this.state;
    if (!selectedElement || selectedElement.type !== ExhibitionElementType.PAGE) {
      return;
    }

    const data = { ...selectedElement.data, deviceId: event.target.value };

    this.setState({
      selectedElement: { ...selectedElement, data }
    });
  }

  /**
   * Event listener for switch view button click
   */
  private onSwitchViewClick = () => {
    this.setState({
      view: this.state.view === "CODE" ? "VISUAL" : "CODE"
    });
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    const { selectedElement } = this.state;
    if (!selectedElement) {
      return;
    }

    switch (selectedElement.type) {
      case ExhibitionElementType.DEVICE:
        const updatedDeviceData = selectedElement.data as ExhibitionDevice;
        this.onDeviceSave({
          ...updatedDeviceData,
          indexPageId: updatedDeviceData.indexPageId,
          groupId: updatedDeviceData.groupId,
          name: updatedDeviceData.name
        });
      break;
      case ExhibitionElementType.PAGE:
        const updatedPageData = selectedElement.data as ExhibitionPage;
        const parsedCode = this.parseJsonCode();
        this.onPageSave({
          ...updatedPageData,
          layoutId: updatedPageData.layoutId,
          deviceId: updatedPageData.deviceId,
          name: updatedPageData.name,
          contentVersionId: updatedPageData.contentVersionId,
          eventTriggers: parsedCode.eventTriggers || [],
          resources: parsedCode.resources || []
        });
      break;
      default:
      break;
    }
  }

  /**
   * Serializes the page into JSON code
   *
   * @returns JSON
   */
  private toJsonCode = (page: Partial<ExhibitionPage>): string => {
    const { resources, eventTriggers } = page;

    return JSON.stringify({
      resources: resources,
      eventTriggers: eventTriggers
    }, null, 2);
  }

  /**
   * Event handler for add page click
   */
  private onAddPageClick = () => {
    const layoutId = this.props.layouts && this.props.layouts.length ? this.props.layouts[0].id : null;
    const deviceId = this.state.selectedDeviceId;
    const contentVersionId = this.state.selectedContentVersionId;

    if (!layoutId || !deviceId || !contentVersionId) {
      return null;
    }

    const newPage: ExhibitionPage = {
      layoutId: layoutId,
      deviceId: deviceId,
      contentVersionId: contentVersionId,
      name: strings.exhibition.newPage,
      eventTriggers: [],
      resources: [],
      enterTransitions: [],
      exitTransitions: []
    }

    const newElement: ExhibitionElement = {
      data: newPage,
      type: ExhibitionElementType.PAGE
    }

    this.setState({
      selectedElement: newElement
    });
  }

  /**
   * Event handler for add device click
   */
  private onAddDeviceClick = () => {
    this.setState({
      newDevice: {
        name: strings.exhibition.addDeviceEditor.defaultName,
        modelId: this.props.deviceModels[0]?.id,
        groupId: this.state.selectedDeviceGroupId,
        screenOrientation: ScreenOrientation.Portrait
      }
    }); 
  }

  /**
   * Event handler for device save
   *
   * @param page page
   */
  private onDeviceSave = async (device: ExhibitionDevice) => {
    try {
      const exhibitionDevicesApi = Api.getExhibitionDevicesApi(this.props.accessToken);
      if (device.id) {
        const updatedDevice = await exhibitionDevicesApi.updateExhibitionDevice({
          exhibitionId: this.props.exhibitionId,
          deviceId: device.id,
          exhibitionDevice: device
        });

        const devices = this.state.devices.filter(item => item.id !== updatedDevice.id) || [];

        this.setState({
          devices: [ ...devices, updatedDevice ]
        });

      } else {
        const createdDevice = await exhibitionDevicesApi.createExhibitionDevice({
          exhibitionId: this.props.exhibitionId,
          exhibitionDevice: device
        });

        this.setState({
          devices: [ ...this.state.devices || [], createdDevice ]
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
   * Event handler for page save
   *
   * @param page page
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

        const pages = this.state.pages.filter(item => item.id !== updatedPage.id) || [];

        this.setState({
          pages: [ ...pages, updatedPage ]
        });

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
   * Handle dashboard click
   */
  private onDashboardButtonClick = () => {
    this.props.history.push(`/dashboard/overview`);
  }

  /**
   * Finds selected exhibition content version from tree
   * 
   * @param elements tree elements
   * @return content version or null if not found
   */
  private findSelectedExhibitionContentVersion = (elements: ExhibitionElement[]): ExhibitionContentVersion | null => {
    const element = elements.find(item => item.type === ExhibitionElementType.CONTENT_VERSION);

    if (!element || !element.data) {
      return null;
    }

    return element.data as ExhibitionContentVersion;
  }

  /**
   * Finds selected exhibition device from tree
   * 
   * @param elements tree elements
   * @return device or null if not found
   */
  private findSelectedExhibitionDevice = (elements: ExhibitionElement[]): ExhibitionDevice | null => {
    const element = elements.find(item => item.type === ExhibitionElementType.DEVICE);

    if (!element || !element.data) {
      return null;
    }

    return element.data as ExhibitionDevice;
  }

  /**
   * Handles element selected from navigation tree
   *
   * @param parents selected element parents
   * @param element selected element
   * @param elementType selected element type
   */
  private onSelectElementFromTree = (parents: ExhibitionElement[], element: ExhibitionElement) => {
    const elements = [ ...parents, element ];

    this.setState({
      selectedDeviceGroupId: undefined,
      selectedDeviceId: this.findSelectedExhibitionDevice(elements)?.id,
      selectedContentVersionId: this.findSelectedExhibitionContentVersion(elements)?.id,
      selectedRoomId: undefined,
      newDevice: undefined,
      selectedEventTriggerIndex: undefined,
      jsonCode: "{}"
    });

    switch (element.type) {
      case ExhibitionElementType.EXHIBITION:
      break;
      case ExhibitionElementType.CONTENT_VERSION:
      break;
      case ExhibitionElementType.FLOOR:
      break;
      case ExhibitionElementType.ROOM:
        const selectedRoom = element.data as ExhibitionDevice;
        const selectedDeviceGroup = this.state.deviceGroups.find(item => item.roomId === selectedRoom.id); 

        this.setState({
          selectedDeviceGroupId: selectedDeviceGroup?.id,
          selectedRoomId: selectedRoom?.id
        });

      break;
      case ExhibitionElementType.DEVICE:
        this.setState({
          selectedElement: element
        });
      break;
      case ExhibitionElementType.PAGE:
        const pageData = element.data as ExhibitionPage;
        const jsonCode = this.toJsonCode(pageData);
        const pageLayout = this.props.layouts.find(item => item.id === pageData.layoutId);

        this.setState({
          selectedElement: element,
          jsonCode: jsonCode,
          pageLayout: pageLayout
        });

      break;
      default:
      break;
    }
  }

  /**
   * Event handler for new device save button click
   */
  private onSaveNewDeviceClick = async () => {
    const { newDevice } = this.state;
    if (!newDevice) {
      return;
    }

    const { groupId, modelId, name, screenOrientation } = newDevice; 
    if (!groupId || !modelId || !name || !screenOrientation) {
      // TODO: Better error handling
      return;
    }

    const payload: ExhibitionDevice = { ...newDevice, groupId: groupId, modelId: modelId, name: name, screenOrientation: screenOrientation };
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(this.props.accessToken);
    const createdDevice = await exhibitionDevicesApi.createExhibitionDevice({exhibitionId : this.props.exhibitionId, exhibitionDevice: payload });

    this.setState({
      newDevice: undefined,
      devices: [ ...this.state.devices, createdDevice ]
    });
  }

  /**
   * Event handler for new device name change
   * 
   * @param event event
   */
  private onNewDeviceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { target } = event;
    const value: string = target.value;
    this.setState({
      newDevice: { ...this.state.newDevice, name: value } 
    });
  }

  /**
   * Event handler for new device screen orientation select change
   *
   * @param event event
   * @param _child child node
   */
  private onNewDeviceScreenOrientationChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>, _child: React.ReactNode) => {
    this.setState({
      newDevice: { ...this.state.newDevice, screenOrientation: e.target.value as ScreenOrientation }
    });
  }

  /**
   * Event handler for new device model select change
   *
   * @param event event
   * @param _child child node
   */
  private onNewDeviceModelChange = (e: React.ChangeEvent<{ name?: string | undefined; value: unknown }>, _child: React.ReactNode) => {
    this.setState({
      newDevice: { ...this.state.newDevice, modelId: e.target.value as string }
    });
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionView));
