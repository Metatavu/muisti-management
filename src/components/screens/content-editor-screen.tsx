import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/content-editor-screen";
// tslint:disable-next-line: max-line-length
import { WithStyles, withStyles, CircularProgress, Divider, Accordion, AccordionSummary, Typography, AccordionDetails, Button, List, ListItem, ListItemSecondaryAction, IconButton, TextField } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken, ActionButton } from '../../types';
import BasicLayout from "../layouts/basic-layout";
import Api from "../../api/api";
// tslint:disable-next-line: max-line-length
import { GroupContentVersion, ExhibitionDevice, ExhibitionPage, Exhibition, ExhibitionPageEventTriggerFromJSON, ExhibitionPageResourceFromJSON, DeviceModel, PageLayout, PageLayoutView, ExhibitionPageResource, ExhibitionPageTransition, ExhibitionPageEventTrigger, PageLayoutWidgetType } from "../../generated/client";
import EditorView from "../editor/editor-view";
import ElementTimelinePane from "../layouts/element-timeline-pane";
import ElementContentsPane from "../layouts/element-contents-pane";
import ElementPropertiesPane from "../layouts/element-properties-pane";
import TimelineDevicesList from "../content-editor/timeline-devices-list";
import TimelineEditor from "../content-editor/timeline-editor";
import PagePreview from "../preview/page-preview";
import produce from "immer";
import CodeEditor from "../editor/code-editor";
import AndroidUtils from "../../utils/android-utils";
import PanZoom from "../generic/pan-zoom";
import strings from "../../localization/strings";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import theme from "../../styles/theme";
import ResourceUtils from "../../utils/resource-utils";
import ResourceEditor from "../content-editor/resource-editor";
import CommonSettingsEditor from "../content-editor/common-settings-editor";
import TransitionsEditor from "../content-editor/transitions-editor";
import { DropResult } from "react-beautiful-dnd";
import EventTriggerEditor from "../content-editor/event-trigger-editor";
import { v4 as uuid } from "uuid";
import DeleteIcon from '@material-ui/icons/Delete';
import { allowedWidgetTypes, TabStructure, Tab, TabProperty } from "../content-editor/constants";
import TabEditor from "../content-editor/tabs-editor";
import { parseStringToJsonObject } from "../../utils/content-editor-utils";

type View = "CODE" | "VISUAL";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  setSelectedExhibition: typeof setSelectedExhibition;
  exhibitionId: string;
  exhibition: Exhibition;
  floorId: string;
  roomId: string;
  contentVersionId: string;
  groupContentVersionId: string;
  deviceModels: DeviceModel[];
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  groupContentVersion?: GroupContentVersion;
  devices: ExhibitionDevice[];
  layouts: PageLayout[];
  selectedDevice?: ExhibitionDevice;
  pages: ExhibitionPage[];
  view: View;
  selectedPage?: ExhibitionPage;
  pageLayout?: PageLayout;
  resourceWidgetIdList?: Map<string, string[]>;
  selectedTriggerIndex?: number;
  tabResourceIndex?: number;
  selectedTabIndex?: number;
}

/**
 * Component for content editor screen
 */
class ContentEditorScreen extends React.Component<Props, State> {

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
      layouts: [],
      view: "VISUAL"
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    const { exhibition, exhibitionId, accessToken, setSelectedExhibition } = this.props;
    if (!exhibition || exhibitionId !== exhibition.id) {
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      setSelectedExhibition(await exhibitionsApi.findExhibition({ exhibitionId }));
      return;
    }
    await this.fetchComponentData();
  }

  /**
   * Component did update life cycle handler
   *
   * @param prevProps previous props
   * @param prevState previous state
   */
  public componentDidUpdate = async (prevProps: Props, prevState: State) => {
    const { exhibition } = this.props;
    const { selectedPage, layouts } = this.state;
    if (!prevProps.exhibition && exhibition) {
      await this.fetchComponentData();
    }

    if (
      selectedPage &&
      prevState.selectedPage &&
      (prevState.selectedPage.id !== selectedPage.id || prevState.selectedPage.layoutId !== selectedPage.layoutId)
    ) {
      this.updateResources(layouts, selectedPage);
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const { groupContentVersion, devices, selectedTriggerIndex, selectedTabIndex } = this.state;
    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={ keycloak }
          history={ history }
          title={ "" }
          breadcrumbs={ [] }
          actionBarButtons={ [] }
          noBackButton
          noTabs
        >
          <div className={ classes.loader }>
            <CircularProgress size={ 50 } color="secondary"></CircularProgress>
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ groupContentVersion?.name || "" }
        devices={ devices }
        setSelectedDevice={ this.setSelectedDevice }
        breadcrumbs={ [] }
        actionBarButtons={ this.getActionButtons() }
        noBackButton
        noTabs
      >
        <div className={ classes.editorLayout }>
          <EditorView>
            { this.renderEditor() }
          </EditorView>

          <ElementTimelinePane>
            { this.renderTimeline() }
          </ElementTimelinePane>

          <ElementContentsPane>
            { this.renderElementContentsPaneContent() }
          </ElementContentsPane>

          <ElementPropertiesPane
            open={ selectedTriggerIndex !== undefined || selectedTabIndex !== undefined}
            title={ strings.contentEditor.editor.eventTriggers.title }
          >
            { this.renderProperties() }
          </ElementPropertiesPane>
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders element contents pane content
   */
  private renderElementContentsPaneContent = () => {
    const { selectedPage, selectedDevice } = this.state;
    if (selectedPage) {
      return (
        <>
          { this.renderContentAccordion() }
          { this.renderTransitionAccordion() }
        </>
      );
    }

    if (selectedDevice) {
      return (
        <TextField
          label={ strings.generic.name }
          name="name"
          value={ selectedDevice.name }
          onChange={ this.onDeviceDataChange }
          style={{ marginTop: 10 }}
        />
      );
    }
  }

  /**
   * Render content accordion
   */
  private renderContentAccordion = () => {
    const { devices, layouts, selectedPage } = this.state;

    if (!selectedPage) {
      return null;
    }

    const pageElements = this.constructPageElements();

    return(
      <Accordion>
        <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
          <Typography variant="h3">{ strings.contentEditor.editor.properties }</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <CommonSettingsEditor
            devices={ devices }
            layouts={ layouts }
            pageData={ selectedPage }
            onChange={ this.onPageDataChange }
            onLayoutChange={ this.onLayoutChange }
          />
        </AccordionDetails>
          { pageElements }
      </Accordion>
    );
  }

  /**
   * Construct page elements
   */
  private constructPageElements = () => {
    const { selectedPage, pageLayout } = this.state;

    if (!selectedPage || !pageLayout) {
      return null;
    }

    const elementList: JSX.Element[] = [];
    return this.constructSingleElement(elementList, [pageLayout.data]);

  }

  /**
   * Construct single page layout view element for accordion listing
   *
   * @param elementList JSX element list
   * @param pageLayoutViews list of page layout views
   */
  private constructSingleElement = (elementList: JSX.Element[], pageLayoutViews: PageLayoutView[]) => {
    const { selectedPage, resourceWidgetIdList } = this.state;
    if (!selectedPage || !resourceWidgetIdList) {
      return;
    }

    pageLayoutViews.forEach(pageLayoutView => {
      if (allowedWidgetTypes.includes(pageLayoutView.widget)) {
        const idList = resourceWidgetIdList.get(pageLayoutView.id);
        if (!idList) {
          return;
        }
        if (pageLayoutView.widget === PageLayoutWidgetType.MaterialTabLayout) {
          elementList.push(this.renderTabs(pageLayoutView));
        } else {
          elementList.push(this.renderResources(selectedPage, pageLayoutView, idList));
        }
      }

      if (pageLayoutView.children.length > 0) {
        this.constructSingleElement(elementList, pageLayoutView.children);
      }
    });

    return elementList;
  }

  /**
   * Render individual resources inside accordion element
   *
   * @param selectedPage selected page
   * @param pageLayoutView page layout view
   * @param idList list resource ids
   */
  private renderResources = (selectedPage: ExhibitionPage, pageLayoutView: PageLayoutView, idList: string[]) => {
    const elementItems = this.getElementItems(idList, selectedPage);
    const eventTriggerItems = this.getEventTriggerItems(selectedPage, pageLayoutView);

    return (
      <Accordion key={ pageLayoutView.name }>
        <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
          <Typography variant="h5">
            { pageLayoutView.name || "" }
          </Typography>
          <Button
            variant="text"
            onClick={ this.onAddEventTrigger(pageLayoutView.id) }
          >
            { strings.contentEditor.editor.eventTriggers.add }
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{ padding: theme.spacing(1) }} variant="h5">
            { strings.contentEditor.editor.resources }
          </Typography>
          { elementItems }
          <Typography style={{ padding: theme.spacing(1) }} variant="h5">
            { strings.contentEditor.editor.eventTriggers.title }
          </Typography>
          {
            eventTriggerItems ??
            <Typography variant="caption" style={{ marginLeft: theme.spacing(1), marginBottom: theme.spacing(1) }}>
              { strings.contentEditor.editor.eventTriggers.noTriggers }
            </Typography>
          }
        </AccordionDetails>
      </Accordion>
    );
  }

  /**
   * Render tabs
   *
   * @param pageLayoutView page layout view
   */
  private renderTabs = (pageLayoutView: PageLayoutView) => {
    const tabItems = this.getTabs();

    return (
      <Accordion key={ pageLayoutView.name }>
        <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
          <Typography style={{ padding: theme.spacing(1) }} variant="h5">
            { pageLayoutView.name || "" }
          </Typography>
          <Button
            variant="text"
            onClick={ this.onAddTab() }
          >
            { strings.contentEditor.editor.tabs.add }
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{ padding: theme.spacing(1) }} variant="h5">
            { strings.contentEditor.editor.tabs.title }
          </Typography>
          { tabItems }
        </AccordionDetails>
      </Accordion>
    );
  }

  /**
   * Render transition accordion
   */
  private renderTransitionAccordion = () => {
    const { devices, pages, selectedPage } = this.state;
    if (!selectedPage) {
      return null;
    }

    return(
      <Accordion>
        <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
          <Typography variant="h3">{ strings.contentEditor.editor.transitions.title }</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TransitionsEditor
            selectedPage={ selectedPage }
            devices={ devices }
            pages={ pages }
            onPageTransitionChange={ this.onTransitionChange }
          />
        </AccordionDetails>
      </Accordion>
    );
  }

  /**
   * Render properties
   */
  private renderProperties = () => {
    const { selectedPage, selectedTriggerIndex, selectedTabIndex, pages, tabResourceIndex } = this.state;
    if (!selectedPage) {
      return null;
    }

    if (selectedTriggerIndex !== undefined) {
      const foundTrigger = selectedPage.eventTriggers[selectedTriggerIndex];

      return(
        <EventTriggerEditor
          selectedEventTrigger={ foundTrigger }
          pages={ pages }
          onSave={ this.updateEventTrigger }
        />
      );
    }

    if (tabResourceIndex !== undefined && selectedTabIndex !== undefined) {
      const test = selectedPage.resources[tabResourceIndex].data;
      const parsed = parseStringToJsonObject<typeof test, TabStructure>(test);
      if (!parsed || !parsed.tabs) {
        return null;
      }

      const foundTab = parsed.tabs[selectedTabIndex];

      return(
        <TabEditor
          selectedTab={ foundTab }
          onSave={ this.updateTab }
        />
      );
    }

  }

  /**
   * Get element JSX items
   *
   * @param idList list of element id
   * @param selectedPage selected page
   */
  private getElementItems = (idList: string[], selectedPage: ExhibitionPage) => {
    return idList.map(elementId => {
      const resourceIndex = selectedPage.resources.findIndex(resource => resource.id === elementId);

      if (resourceIndex < 0) {
        return null;
      }

      const foundResource = selectedPage.resources[resourceIndex];
      return (
        <ResourceEditor
          resource={ foundResource }
          resourceIndex={ resourceIndex }
          onUpdate={ this.onUpdateResource }
        />
      );
    });
  }

  /**
   * Get tabs JSX items
   */
  private getTabs = () => {
    const tabs = this.renderTabList();
    return (
      <AccordionDetails>
        { tabs }
      </AccordionDetails>
    );
  }

  /**
   * Render tab list
   */
  private renderTabList = () => {
    const { selectedTabIndex } = this.state;
    const tabStructure = this.getTabStructure();
    if (!tabStructure || !tabStructure.tabs) {
      return null;
    }

    const tabs = tabStructure.tabs;

    const tabItems = tabs.map((tab, tabIndex) => {
      return (
        <ListItem
          key={ tabIndex }
          button
          onClick={ this.onTabClick(tabIndex) }
          selected={ selectedTabIndex === tabIndex }
        >
          <Typography style={{ marginLeft: theme.spacing(1) }} variant="h6">
            { tab.label }
          </Typography>
          <ListItemSecondaryAction>
            <IconButton
              size="small"
              edge="end"
              aria-label="delete"
              onClick={ this.onDeleteTabClick(tabIndex) }
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return (
      <List
        disablePadding
        dense
        style={{ marginBottom: theme.spacing(1) }}
      >
        { tabItems }
      </List>
    );
  }

  /**
   * Get event trigger items
   *
   * @param selectedPage selected page
   * @param pageLayoutView page layout view
   */
  private getEventTriggerItems = (selectedPage: ExhibitionPage, pageLayoutView: PageLayoutView) => {

      const triggerList = selectedPage.eventTriggers.filter(trigger => trigger.clickViewId === pageLayoutView.id);

      if (triggerList.length < 1) {
        return;
      }

      return triggerList.map((trigger, index) => {
        const pageEventTriggerIndex = selectedPage.eventTriggers.findIndex(pageTrigger => pageTrigger.id === trigger.id);

        return (
          <List
            disablePadding
            dense
            style={{ marginBottom: theme.spacing(1) }}
          >
            <ListItem
              key={ index }
              button
              onClick={ this.onTriggerClick(pageEventTriggerIndex) }
            >
              <Typography style={{ marginLeft: theme.spacing(1) }} variant="h6">
                { trigger.name }
              </Typography>
              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  edge="end"
                  aria-label="delete"
                  onClick={ this.onDeleteTriggerClick(pageEventTriggerIndex) }
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        );
      });
  }

  /**
   * Updates event trigger
   *
   * @param eventTrigger event trigger
   */
  private updateEventTrigger = (eventTrigger: ExhibitionPageEventTrigger) => {
    this.setState(
      produce((draft: State) => {
        const { selectedTriggerIndex } = draft;
        if (selectedTriggerIndex === undefined ||
          !draft.selectedPage ||
          draft.selectedPage.eventTriggers.length < selectedTriggerIndex)
        {
          return;
        }

        draft.selectedPage.eventTriggers[selectedTriggerIndex] = eventTrigger;
      })
    );
  }

  /**
   * Updates tab
   *
   * @param updatedTab updated tab
   */
  private updateTab = (updatedTab: Tab) => {
    this.setState(
      produce((draft: State) => {
        const { tabResourceIndex, selectedTabIndex, selectedPage } = draft;
        if (tabResourceIndex === undefined ||
          selectedTabIndex === undefined ||
          !selectedPage
        ) {
        return;
      }
      const tabData = this.getTabStructure();
      if (tabData && tabData.tabs) {
        tabData.tabs[selectedTabIndex] = updatedTab;
        selectedPage.resources[tabResourceIndex].data = JSON.stringify(tabData);
      }

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
   * Event handler for layout change
   *
   * @param event event
   */
  private onLayoutChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
    const { selectedPage, layouts } = this.state;
    if (!selectedPage) {
      return;
    }

    const layoutId = event.target.value;
    const selectedLayout = layouts.find(layout => layout.id === layoutId);
    if (!selectedLayout) {
      return;
    }

    const resourceHolder = ResourceUtils.getResourcesFromLayoutData(selectedLayout.data);

    this.setState(
      produce((draft: State) => {
        draft.selectedPage!.layoutId = layoutId;
        draft.selectedPage!.resources = resourceHolder.resources;
        draft.resourceWidgetIdList = resourceHolder.widgetIds;
      })
    );
  }

  /**
   * On update resource handler
   *
   * @param resourceIndex resource index
   * @param resource page resource
   */
  private onUpdateResource = (resourceIndex: number, resource: ExhibitionPageResource) => {
    this.setState(
      produce((draft: State) => {
        if (resourceIndex === undefined ||
            !draft.selectedPage ||
            draft.selectedPage.resources.length < resourceIndex) {
          return;
        }

        draft.selectedPage.resources[resourceIndex] = resource;
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
      this.setState(
        produce((draft: State) => {
          draft.selectedPage!.exitTransitions = transitions;
        })
      );
    }
  }

  /**
   * Fetches component data
   */
  private fetchComponentData = async () => {
    const { accessToken, exhibitionId, groupContentVersionId } = this.props;

    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    const groupContentVersionsApi = Api.getGroupContentVersionsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);

    const [ groupContentVersion, layouts ] = await Promise.all([
      groupContentVersionsApi.findGroupContentVersion({ exhibitionId, groupContentVersionId }),
      layoutsApi.listPageLayouts({ })
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

    const devicesWithPageOrders: ExhibitionDevice[] = devices.map((device, index) => {
      const pageOrder = device.pageOrder ?? devicePages[index].map(page => page.id!);
      const indexPageId = pageOrder[0] ?? undefined;
      return {
        ...device,
        pageOrder,
        indexPageId
      };
    });

    const pages: ExhibitionPage[] = devicePages.flat();
    const selectedDevice = devicesWithPageOrders[0];
    const selectedPage = pages.find(page => page.deviceId === selectedDevice.id);

    if (selectedPage) {
      this.updateResources(layouts, selectedPage);
    }

    this.setState({
      groupContentVersion,
      devices: devicesWithPageOrders,
      pages,
      layouts,
      selectedDevice
    });

  }

  /**
   * Renders timeline content
   */
  private renderTimeline = () => {
    const { classes } = this.props;
    const { devices, selectedDevice, pages, selectedPage } = this.state;
    return (
      <div className={ classes.timelineContent }>
        <TimelineDevicesList
          devices={ devices }
          selectedDevice={ selectedDevice }
          onClick={ this.onDeviceClick }
        />
        <Divider orientation="vertical" flexItem />
        <TimelineEditor
          devices={ devices }
          pages={ pages }
          selectedDevice={ selectedDevice }
          selectedPage={ selectedPage }
          onClick={ this.onPageClick }
          onDragEnd={ this.onPageDragEnd }
        />
      </div>
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
   * Renders visual editor
   */
  private renderVisualEditor = () => {
    const { classes, deviceModels } = this.props;
    const { selectedPage, pageLayout } = this.state;

    if (!selectedPage || !pageLayout) {
      return;
    }

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
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { selectedDevice, selectedPage, view } = this.state;

    const actionButtons: ActionButton[] = [{
      name: view === "CODE" ?
        strings.exhibitionLayouts.editView.switchToVisualButton :
        strings.exhibitionLayouts.editView.switchToCodeButton,
      action: this.onSwitchViewClick
    }];

    if (selectedDevice) {
      actionButtons.push({
        name: strings.contentEditor.editor.saveDevice,
        action: this.onSaveDeviceClick
      }, {
        name: strings.exhibition.addPage,
        action: this.onAddPageClick
      });
    }

    if (selectedPage) {
      actionButtons.push({
        name: strings.contentEditor.editor.savePage,
        action: this.onPageSave
      }, {
        name: strings.exhibition.deletePage,
        action: this.onDeletePageClick
      });
    }
    return actionButtons;
  }

  /**
   * Sets selected device
   *
   * @param deviceId device id
   */
  private setSelectedDevice = (deviceId: string) => {
    const { devices } = this.state;
    const selectedDevice = devices.find(device => device.id === deviceId);
    this.setState({
      selectedDevice: selectedDevice
    });
    return selectedDevice;
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
          ...selectedDevice,
          [name]: value !== strings.generic.undefined ? value : undefined
        };
      })
    );
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
   * Event handler for add event trigger
   *
   * @param pageLayoutViewId page layout view id
   * @param event react mouse event
   */
  private onAddEventTrigger = (pageLayoutViewId: string) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const { selectedPage } = this.state;

    if (!selectedPage) {
      return;
    }

    event.stopPropagation();
    const newTrigger: ExhibitionPageEventTrigger = {
      clickViewId: pageLayoutViewId,
      id: uuid(),
      name: "New trigger"
    };

    this.setState(
      produce((draft: State) => {
        draft.selectedPage = selectedPage;
        draft.selectedPage.eventTriggers.push(newTrigger);
        draft.selectedTriggerIndex = draft.selectedPage.eventTriggers.length - 1;
      })
    );
  }

  /**
   * Event handler for add tab
   *
   * @param event react mouse event
   */
  private onAddTab = () => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const { selectedPage, tabResourceIndex } = this.state;
    event.stopPropagation();

    if (!selectedPage || tabResourceIndex === undefined) {
      return;
    }

    /**
     * TODO: This is needed for the first version of the tab editor.
     * Remove this once we have more complex support for tab resources
     */
    const newProperty: TabProperty = {
      name: "src",
      type: "string",
      value: "@resources/src"
    };

    const newTab: Tab = {
      label: "New tab",
      properties: [
        newProperty
      ],
      resources: []
    };

    const currentTabStructure = this.getTabStructure();

    if (!currentTabStructure) {
      return;
    }

    currentTabStructure.tabs.push(newTab);


    this.setState(
      produce((draft: State) => {
        draft.selectedPage = selectedPage;
        draft.selectedPage.resources[tabResourceIndex].data = JSON.stringify(currentTabStructure);
      })
    );
  }

  /**
   * Event handler for trigger click
   *
   * @param triggerIndex trigger index within selected pages triggers
   */
  private onTriggerClick = (triggerIndex: number) => () => {
    this.setState({
      selectedTriggerIndex: triggerIndex,
      selectedTabIndex: undefined
    });
  }

  /**
   * Event handler for delete trigger click
   *
   * @param triggerIndex trigger index within selected pages triggers
   */
  private onDeleteTriggerClick = (triggerIndex: number) => () => {
    const { selectedPage } = this.state;

    if (!selectedPage) {
      return;
    }

    this.setState(
      produce((draft: State) => {
        draft.selectedPage = selectedPage;
        draft.selectedPage.eventTriggers.splice(triggerIndex, 1);
        draft.selectedTriggerIndex = undefined;
      })
    );
  }

  /**
   * Event handler for tab resource click
   *
   * @param tabIndex clicked tab index
   */
  private onTabClick = (tabIndex: number) => () => {
    this.setState({
      selectedTriggerIndex: undefined,
      selectedTabIndex: tabIndex
    });
  }

  /**
   * Event handler for delete tab click
   *
   * @param tabIndex tab index to be deleted 
   */
  private onDeleteTabClick = (tabIndex: number) => () => {
    const { selectedPage, tabResourceIndex } = this.state;
    const tabStructure = this.getTabStructure();

    if (!tabStructure || !tabStructure.tabs || !selectedPage || tabResourceIndex === undefined) {
      return;
    }

    const tempTabs = tabStructure.tabs;
    tempTabs.splice(tabIndex, 1);
    tabStructure.tabs = tempTabs;

    this.setState(
      produce((draft: State) => {
        draft.selectedPage = selectedPage;
        draft.selectedPage.resources[tabResourceIndex].data = JSON.stringify(tabStructure);
        draft.selectedTabIndex = undefined;
      })
    );
  }

  /**
   * Event handler for device click
   *
   * @param selectedDevice selected device
   */
  private onDeviceClick = (selectedDevice: ExhibitionDevice) => () => {
    this.setState({
      selectedDevice,
      selectedPage: undefined
    });
  }

  /**
   * Event handler for page click
   *
   * @param selectedPage selected page
   */
  private onPageClick = (selectedPage: ExhibitionPage) => () => {
    const { devices } = this.state;
    this.setState({
      selectedDevice: devices.find(device => device.id === selectedPage.deviceId),
      selectedPage,
      selectedTriggerIndex: undefined
    });
  }

  /**
   * Event handler for page drag end
   *
   * @param deviceId device id
   * @param result drop result
   */
  private onPageDragEnd = (deviceId: string) => async (result: DropResult) => {
    const { accessToken, exhibitionId } = this.props;
    const { devices } = this.state;
    if (!result.destination) {
      return;
    }

    const deviceIndex = devices.findIndex(device => device.id === deviceId);
    if (deviceIndex < 0) {
      return;
    }

    const pageOrder = this.reorderPages(
      devices[deviceIndex].pageOrder,
      result.source.index,
      result.destination!.index
    );
    const indexPageId = pageOrder.length > 0 ? pageOrder[0] : "";

    const exhibitionDevice: ExhibitionDevice = {
      ...devices[deviceIndex],
      pageOrder,
      indexPageId
    };

    this.setState(
      produce((draft: State) => {
        draft.devices[deviceIndex] = exhibitionDevice;
      })
    );

    const devicesApi = Api.getExhibitionDevicesApi(accessToken);
    await devicesApi.updateExhibitionDevice({
      exhibitionId,
      deviceId,
      exhibitionDevice
    });
  }

  /**
   * Reorders device pages
   *
   * @param pageOrder page order
   * @param prevIndex previous index
   * @param newIndex new index
   * @returns new order as string list
   */
  private reorderPages = (pageOrder: string[], prevIndex: number, newIndex: number): string[] => {
    const result = Array.from(pageOrder);
    const [removed] = result.splice(prevIndex, 1);
    result.splice(newIndex, 0, removed);

    return result;
  }

  /**
   * Update page resources and id mappings
   *
   * @param layouts list of layouts
   * @param selectedPage selected page
   */
  private updateResources = (layouts: PageLayout[], selectedPage: ExhibitionPage) => {
    const pageLayout = layouts.find(layout => layout.id === selectedPage.layoutId);
    if (!pageLayout) {
      return;
    }

    this.setState(
      produce((draft: State) => {
        const resourceHolder = ResourceUtils.getResourcesFromLayoutData(pageLayout.data);
        draft.selectedPage = selectedPage;

        /**
         * TODO: Will need a update handler that can update page resources when layout is changed
         * WITHOUT deleting already existing data
         */
        if (selectedPage.resources.length < 1) {
          draft.selectedPage.resources = resourceHolder.resources;
        }

        const tempTriggers = [ ...draft.selectedPage.eventTriggers ] as ExhibitionPageEventTrigger[];
        tempTriggers.forEach(trigger => {
          if (!trigger.id) {
            trigger.id = uuid();
          }
          if (!trigger.name) {
            trigger.name = "Name";
          }
        });

        draft.selectedPage.resources.forEach((resource, index) => {
          const resourceWidgetType = resourceHolder.resourceToWidgetType.get(resource.id);
          if (resourceWidgetType && resourceWidgetType === PageLayoutWidgetType.MaterialTabLayout) {
            draft.tabResourceIndex = index;
            return;
          }
        });

        draft.selectedPage.eventTriggers = tempTriggers;
        draft.resourceWidgetIdList = resourceHolder.widgetIds;
        draft.pageLayout = pageLayout;
      })
    );
  }

  /**
   * Event handler for save device click
   */
  private onSaveDeviceClick = async () => {
    try {
      const { selectedDevice } = this.state;
      if (!selectedDevice || !selectedDevice.id) {
        return;
      }

      const exhibitionDevicesApi = Api.getExhibitionDevicesApi(this.props.accessToken);
      const updatedDevice = await exhibitionDevicesApi.updateExhibitionDevice({
        exhibitionId: this.props.exhibitionId,
        deviceId: selectedDevice.id,
        exhibitionDevice: selectedDevice
      });

      this.setState(
        produce((draft: State) => {
          const deviceIndex = draft.devices.findIndex(device => device.id === selectedDevice.id);
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
   * Event handler for add page click
   */
  private onAddPageClick = async () => {
    const { contentVersionId, accessToken, exhibitionId } = this.props;
    const { layouts, selectedDevice, devices } = this.state;
    if (!selectedDevice) {
      return;
    }

    const layoutId = layouts && layouts.length ? layouts[0].id : null;
    const deviceId = selectedDevice.id;
    const temp = ResourceUtils.getResourcesFromLayoutData(layouts[0].data);

    if (!layoutId || !deviceId || !contentVersionId) {
      return null;
    }

    const newPage: ExhibitionPage = {
      layoutId: layoutId,
      deviceId: deviceId,
      contentVersionId: contentVersionId,
      name: strings.exhibition.newPage,
      eventTriggers: [],
      resources: temp.resources,
      enterTransitions: [],
      exitTransitions: []
    };

    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const createdPage = await exhibitionPagesApi.createExhibitionPage({
      exhibitionId: exhibitionId,
      exhibitionPage: newPage
    });
    const updatedDevice = await exhibitionDevicesApi.updateExhibitionDevice({
      exhibitionId: exhibitionId,
      deviceId: selectedDevice.id!,
      exhibitionDevice: {
        ...selectedDevice,
        pageOrder: [ ...selectedDevice.pageOrder, createdPage.id! ]
      }
    });

    this.setState(
      produce((draft: State) => {
        const deviceIndex = devices.findIndex(device => device.id === selectedDevice.id);
        if (deviceIndex < 0) {
          return;
        }

        draft.devices[deviceIndex] = updatedDevice;
        draft.selectedDevice!.pageOrder.push(createdPage.id!);
        draft.pages.push(createdPage);
        draft.selectedPage = createdPage;
      })
    );
  }

  /**
   * Event handler for page save
   */
  private onPageSave = async () => {
    const { selectedPage, pages } = this.state;

    if (!selectedPage || !selectedPage.id) {
      return;
    }

    try {
      const exhibitionPagesApi = Api.getExhibitionPagesApi(this.props.accessToken);
      const updatedPage = await exhibitionPagesApi.updateExhibitionPage({
        exhibitionId: this.props.exhibitionId,
        pageId: selectedPage.id,
        exhibitionPage: selectedPage
      });

      const newPages = produce(pages, draft => {
        const pageIndex = draft.findIndex(page => page.id === updatedPage.id);
        if (pageIndex > -1) {
          draft[pageIndex] = updatedPage;
        }
      });

        this.setState({ pages: newPages });
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for page delete
   */
  private onDeletePageClick = async () => {
    try {
      const { accessToken, exhibitionId } = this.props;
      const { selectedPage } = this.state;
      if (!selectedPage || !selectedPage.id) {
        return;
      }

      /**
       * TODO:
       * Add cleaner confirm dialog
       */
      if (!window.confirm(strings.exhibition.confirmDeletePage)) {
        return;
      }

      const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
      await exhibitionPagesApi.deleteExhibitionPage({ exhibitionId, pageId: selectedPage.id });

      this.setState(
        produce((draft: State) => {
          const pageIndex = draft.pages.findIndex(page => page.id === selectedPage.id);

          if (pageIndex > -1) {
            draft.pages.splice(pageIndex, 1);
          }

          draft.selectedPage = undefined;
          draft.selectedTriggerIndex = undefined;
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
   * Get tab structure from resources
   */
  private getTabStructure = () => {
    const { tabResourceIndex, selectedPage } = this.state;

    if (tabResourceIndex !== undefined && selectedPage) {
      const data = selectedPage.resources[tabResourceIndex].data;
      const parsed = parseStringToJsonObject<typeof data, TabStructure>(data);
      if (!parsed) {
        return { tabs: [] } as TabStructure;
      }

      return parsed;
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
    deviceModels: state.devices.deviceModels,
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ContentEditorScreen));
