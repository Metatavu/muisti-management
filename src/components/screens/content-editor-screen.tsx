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
import { GroupContentVersion, ExhibitionDevice, ExhibitionPage, Exhibition, ExhibitionPageEventTriggerFromJSON, ExhibitionPageResourceFromJSON, DeviceModel, PageLayout, PageLayoutView, ExhibitionPageResource, ExhibitionPageTransition, ExhibitionPageEventTrigger, PageLayoutWidgetType, ContentVersion } from "../../generated/client";
import EditorView from "../editor/editor-view";
import ElementTimelinePane from "../layouts/element-timeline-pane";
import ElementContentsPane from "../layouts/element-contents-pane";
import ElementPropertiesPane from "../layouts/element-properties-pane";
import TimelineDevicesList from "../content-editor/timeline-devices-list";
import TimelineEditor from "../content-editor/timeline-editor";
import LayoutViewResourcesList from "../content-editor/layout-view-resources-list";
import PagePreview from "../preview/page-preview";
import produce from "immer";
import CodeEditor from "../editor/code-editor";
import AndroidUtils from "../../utils/android-utils";
import PanZoom from "../generic/pan-zoom";
import strings from "../../localization/strings";
import ExpandMoreIcon from "@material-ui/icons/ChevronRight";
import theme from "../../styles/theme";
import ResourceUtils from "../../utils/resource-utils";
import ResourceEditor from "../content-editor/resource-editor";
import CommonSettingsEditor from "../content-editor/common-settings-editor";
import TransitionsEditor from "../content-editor/transitions-editor";
import { DropResult } from "react-beautiful-dnd";
import EventTriggerEditor from "../content-editor/event-trigger-editor";
import { v4 as uuid } from "uuid";
import DeleteIcon from '@material-ui/icons/Delete';
import { allowedWidgetTypes, TabStructure, Tab, TabProperty, TabHolder } from "../content-editor/constants";
import TabEditor from "../content-editor/tab-editor";
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
  contentVersions: ContentVersion[];
  groupContentVersion?: GroupContentVersion;
  devices: ExhibitionDevice[];
  layouts: PageLayout[];
  selectedContentVersion?: ContentVersion;
  selectedDevice?: ExhibitionDevice;
  pages: ExhibitionPage[];
  view: View;
  selectedPage?: ExhibitionPage;
  selectedLayoutView?: PageLayoutView;
  pageLayout?: PageLayout;
  resourceWidgetIdList?: Map<string, string[]>;
  selectedResource?: ExhibitionPageResource;
  selectedTriggerIndex?: number;
  tabResourceIndex?: number;
  selectedTabIndex?: number;
  propertiesExpanded: boolean;
  tabMap: Map<string, TabHolder>;
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
      contentVersions: [],
      view: "VISUAL",
      propertiesExpanded: false,
      tabMap: new Map()
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
    const { layouts } = this.state;

    if (!prevProps.exhibition && exhibition) {
      await this.fetchComponentData();
    }

    const previousPage = prevState.selectedPage;
    const currentPage = this.state.selectedPage;

    const pageChanged = this.isPageChanged(previousPage, currentPage);
    const layoutChanged = this.isLayoutChanged(previousPage, currentPage);

    if (currentPage && (pageChanged || layoutChanged)) {
      this.updateResources(layouts, currentPage);
    }
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const {
      groupContentVersion,
      devices,
      selectedResource,
      selectedTriggerIndex,
      selectedTabIndex
    } = this.state;

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

    const propertiesTitle = selectedResource ?
      selectedResource.id :
      selectedTriggerIndex ?
        strings.contentEditor.editor.eventTriggers.title :
        strings.contentEditor.editor.tabs.title;

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
            open={
              !!selectedResource ||
              selectedTriggerIndex !== undefined ||
              selectedTabIndex !== undefined
            }
            title={ propertiesTitle }
            onCloseClick={ this.onPropertiesClose }
          >
            { this.renderProperties() }
          </ElementPropertiesPane>
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
    const { selectedPage, pageLayout, selectedLayoutView, tabMap } = this.state;

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
        <PanZoom
          minScale={ 0.1 }
          fitContent={ true }
          contentWidth={ displayMetrics.widthPixels }
          contentHeight={ displayMetrics.heightPixels }
        >
          <PagePreview
            screenOrientation={ pageLayout.screenOrientation }
            deviceOrientation={ deviceModel?.screenOrientation }
            view={ view }
            selectedView={ selectedLayoutView }
            resources={ resources }
            displayMetrics={ displayMetrics }
            scale={ scale }
            onViewClick={ this.onLayoutViewClick }
            onTabClick={ this.onPreviewTabClick }
            tabMap={ tabMap }
          />
        </PanZoom>
      </div>
    );
  }

  /**
   * Renders timeline content
   */
  private renderTimeline = () => {
    const { classes } = this.props;
    const {
      contentVersions,
      selectedContentVersion,
      devices,
      selectedDevice,
      pages,
      selectedPage
    } = this.state;

    return (
      <div className={ classes.timelineContent }>
        {
          contentVersions.map(contentVersion => {
            const selected = contentVersion.id === selectedContentVersion?.id;
            return (
              <Accordion
                key={ `ContentVersionAccordion-${contentVersion.id}` }
                className={ classes.timelineContentVersion }
                expanded={ selected }
                onChange={ this.onExpandContentVersion(contentVersion) }
              >
                <AccordionSummary
                  expandIcon={ <ExpandMoreIcon/> }
                  className={ classes.timelineContentVersionTitle }
                >
                  <Typography
                    variant="body2"
                    className={ selected ? classes.selected : undefined }
                  >
                    { contentVersion.language }
                  </Typography>
                </AccordionSummary>
                <AccordionDetails className={ classes.timelineContentVersionContent }>
                  <TimelineDevicesList
                    contentVersion={ contentVersion }
                    selectedContentVersion={ selectedContentVersion }
                    devices={ devices }
                    selectedDevice={ selectedDevice }
                    onClick={ this.onDeviceClick }
                  />
                  <Divider orientation="vertical" flexItem className={ classes.timelineDivider } />
                  <TimelineEditor
                    contentVersion={ contentVersion }
                    devices={ devices }
                    pages={ pages }
                    selectedContentVersion={ selectedContentVersion }
                    selectedDevice={ selectedDevice }
                    selectedPage={ selectedPage }
                    onClick={ this.onPageClick }
                    onDragEnd={ this.onPageDragEnd }
                  />
                </AccordionDetails>
              </Accordion>
            );
          })
        }
      </div>
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
        <div style={{ padding: theme.spacing(2) }}>
          <TextField
            label={ strings.generic.name }
            name="name"
            value={ selectedDevice.name }
            onChange={ this.onDeviceDataChange }
            style={{ marginTop: theme.spacing(1) }}
          />
        </div>
      );
    }
  }

  /**
   * Render content accordion
   */
  private renderContentAccordion = () => {
    const {
      devices,
      layouts,
      selectedPage,
      propertiesExpanded
    } = this.state;

    if (!selectedPage) {
      return null;
    }

    const pageElements = this.constructPageElements();

    return(
      <Accordion
        expanded={ propertiesExpanded }
        onChange={ (_e, expanded) => this.setState({ propertiesExpanded: expanded }) }
      >
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
    const { classes } = this.props;
    const { selectedLayoutView, selectedResource } = this.state;
    const resources = this.getResources(idList, selectedPage);
    const eventTriggerItems = this.getEventTriggerItems(selectedPage, pageLayoutView);

    return (
      <Accordion
        key={ pageLayoutView.id }
        className={ classes.resource }
        expanded={ selectedLayoutView?.id === pageLayoutView.id }
        onChange={ this.onExpandElement(pageLayoutView) }
      >
        <AccordionSummary
          expandIcon={ <ExpandMoreIcon/> }
          className={ classes.resourceItem }
        >
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
          <LayoutViewResourcesList
            resources={ resources }
            selectedResource={ selectedResource }
            onClick={ this.onResourceClick }
          />
          { eventTriggerItems &&
            <>
              <Typography style={{ padding: theme.spacing(1) }} variant="h5">
                { strings.contentEditor.editor.eventTriggers.title }
              </Typography>
              { eventTriggerItems }
            </>
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
    const { classes } = this.props;
    const { selectedLayoutView } = this.state;
    const tabItems = this.getTabs();
    const tabStructure = this.getTabStructure();

    return (
      <Accordion
        key={ pageLayoutView.name }
        className={ classes.resource }
        expanded={ selectedLayoutView?.id === pageLayoutView.id }
        onChange={ this.onExpandElement(pageLayoutView) }
      >
        <AccordionSummary expandIcon={ <ExpandMoreIcon/> } className={ classes.resourceItem }>
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
            {
              !tabStructure ||
              !tabStructure.tabs ||
              tabStructure.tabs.length === 0 ?
                strings.contentEditor.editor.tabs.noTabs :
                strings.contentEditor.editor.tabs.title
            }
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
    const { accessToken } = this.props;
    const {
      selectedPage,
      selectedResource,
      selectedTriggerIndex,
      selectedTabIndex,
      pages,
      tabResourceIndex
    } = this.state;

    if (!selectedPage) {
      return null;
    }

    if (selectedResource) {
      return (
        <ResourceEditor
          resource={ selectedResource }
          onUpdate={ this.onUpdateResource }
        />
      );
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

    if (tabResourceIndex !== undefined &&
      selectedTabIndex !== undefined &&
      selectedPage.resources[tabResourceIndex] !== undefined
    ) {
      const data = selectedPage.resources[tabResourceIndex].data;
      const parsed = parseStringToJsonObject<typeof data, TabStructure>(data);
      if (!parsed || !parsed.tabs) {
        return null;
      }

      const foundTab = parsed.tabs[selectedTabIndex];

      return(
        <TabEditor
          accessToken={ accessToken }
          selectedTab={ foundTab }
          onSave={ this.updateTab }
        />
      );
    }

  }

  /**
   * Get element resources
   *
   * @param idList list of element id
   * @param selectedPage selected page
   */
  private getResources = (idList: string[], selectedPage: ExhibitionPage) => {
    const resources = idList.reduce((filtered: ExhibitionPageResource[], elementId: string) => {
      const resourceIndex = selectedPage.resources.findIndex(resource => resource.id === elementId);

      if (resourceIndex > -1) {
        filtered.push(selectedPage.resources[resourceIndex]);
      }

      return filtered;
    }, []);

    return resources;
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
            key={ trigger.id }
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
        const { tabResourceIndex, selectedTabIndex, selectedPage, selectedLayoutView, tabMap } = draft;
        if (tabResourceIndex === undefined ||
          selectedTabIndex === undefined ||
          !selectedLayoutView ||
          !tabMap ||
          !selectedPage
        ) {
          return;
        }


        const tabHolder = tabMap.get(selectedLayoutView.id);
        const tabData = this.getTabStructure(tabHolder?.tabComponent.contentContainerId);
        if (tabData && tabData.tabs) {
          tabData.tabs[selectedTabIndex] = updatedTab;
          if (tabHolder) {
            tabHolder.tabComponent = tabData;
            draft.tabMap.set(selectedLayoutView.id, tabHolder);
          }
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
   * @param updatedResource updated page resource
   */
  private onUpdateResource = (updatedResource: ExhibitionPageResource) => {
    this.setState(
      produce((draft: State) => {
        if (!draft.selectedPage) {
          return;
        }

        const resourceIndex = draft.selectedPage.resources.findIndex(resource => resource.id === updatedResource.id);
        if (resourceIndex > -1) {
          draft.selectedPage.resources[resourceIndex] = updatedResource;
          draft.selectedResource = updatedResource;
        }
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
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const groupContentVersionsApi = Api.getGroupContentVersionsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);

    const [ groupContentVersion, layouts ] = await Promise.all([
      groupContentVersionsApi.findGroupContentVersion({ exhibitionId, groupContentVersionId }),
      layoutsApi.listPageLayouts({ })
    ]);

    const deviceGroupId = groupContentVersion.deviceGroupId;
    const [ devices, groupContentVersions ] = await Promise.all([
      exhibitionDevicesApi.listExhibitionDevices({ exhibitionId, exhibitionGroupId: deviceGroupId }),
      groupContentVersionsApi.listGroupContentVersions({ exhibitionId, deviceGroupId })
    ]);

    const contentVersions: ContentVersion[] = [];
    for (const gContentVersion of groupContentVersions) {
      const { contentVersionId } = gContentVersion;
      if (!contentVersions.find(contentVersion => contentVersion.id === contentVersionId)) {
        const contentVersion = await contentVersionsApi.findContentVersion({ exhibitionId, contentVersionId });
        contentVersions.push(contentVersion);
      }
    }

    contentVersions.sort((a, b) => {
      return a.language.localeCompare(b.language);
    });

    const devicePages = await Promise.all(
      devices.map(device =>
        exhibitionPagesApi.listExhibitionPages({
          exhibitionId,
          exhibitionDeviceId: device.id
        })
      )
    );

    const pages: ExhibitionPage[] = devicePages.flat();
    const selectedDevice = devices[0];
    const selectedContentVersion = contentVersions[0];
    const selectedPage = pages.find(page => page.deviceId === selectedDevice.id && page.contentVersionId === selectedContentVersion.id);

    if (selectedPage) {
      this.updateResources(layouts, selectedPage);
    }

    this.setState({
      contentVersions,
      groupContentVersion,
      devices,
      pages,
      layouts,
      selectedContentVersion,
      selectedDevice
    });

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
        action: this.onSaveDeviceClick,
        // TODO: Check if there is any changes and if not, set the save button disabled: true
        disabled: false
      }, {
        name: strings.exhibition.addPage,
        action: this.onAddPageClick
      });
    }

    if (selectedPage) {
      actionButtons.push({
        name: strings.contentEditor.editor.savePage,
        action: this.onPageSave,
        // TODO: Check if there is any changes and if not, set the save button disabled: true
        disabled: false
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
   * @returns selected device if found or undefined
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
    const { selectedPage, tabResourceIndex, selectedLayoutView, tabMap } = this.state;
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

    const newTabStructure = produce(currentTabStructure, draft => {
      if (!draft.tabs) {
        draft.tabs = [];
      }
      draft.tabs.push(newTab);
      if (!draft.contentContainerId && selectedLayoutView) {
        draft.contentContainerId = tabMap.get(selectedLayoutView.id)?.tabComponent.contentContainerId;
      }
    });


    this.setState(
      produce((draft: State) => {
        draft.selectedPage = selectedPage;
        draft.selectedPage.resources[tabResourceIndex].data = JSON.stringify(newTabStructure);
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
      selectedResource: undefined,
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
      selectedResource: undefined,
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
    const { selectedPage, tabResourceIndex, selectedLayoutView, tabMap } = this.state;

    if (tabResourceIndex === undefined ||
      !selectedLayoutView ||
      !tabMap ||
      !selectedPage
    ) {
      return;
    }

    this.setState(
      produce((draft: State) => {
        draft.selectedPage = selectedPage;

        const tabData = this.getTabStructure();

        if (tabData && tabData.tabs) {

          const tabHolder = tabMap.get(selectedLayoutView.id);

          if (tabHolder) {
            const updateTabHolder = produce(tabHolder, draft => {
              draft.tabComponent.tabs.splice(tabIndex, 1);
            });

            draft.tabMap.set(selectedLayoutView.id, updateTabHolder);
            draft.selectedPage.resources[tabResourceIndex].data = JSON.stringify(updateTabHolder.tabComponent);
          }
        }
        draft.selectedTabIndex = undefined;
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
   * Event handler for device click
   *
   * @param selectedContentVersion selected content version
   * @param selectedDevice selected device
   */
  private onDeviceClick = (selectedContentVersion: ContentVersion, selectedDevice: ExhibitionDevice) => () => {
    this.setState({
      selectedContentVersion,
      selectedDevice,
      selectedPage: undefined,
      selectedLayoutView: undefined,
      selectedResource: undefined,
      selectedTabIndex: undefined,
      selectedTriggerIndex: undefined
    });
  }

  /**
   * Event handler for page click
   *
   * @param selectedContentVersion selected content version
   * @param selectedPage selected page
   */
  private onPageClick = (selectedContentVersion: ContentVersion, selectedPage: ExhibitionPage) => () => {
    const { devices } = this.state;
    this.setState({
      selectedContentVersion,
      selectedDevice: devices.find(device => device.id === selectedPage.deviceId),
      selectedPage,
      selectedResource: undefined,
      selectedTriggerIndex: undefined,
      selectedTabIndex: undefined
    });
  }

  /**
   * Event handler for layout view click
   *
   * @param view page layout view
   */
  private onLayoutViewClick = (view: PageLayoutView) => {
    this.setState({
      selectedLayoutView: view,
      propertiesExpanded: true
    });
  }

  /**
   * Event handler for resource click
   *
   * @param resource resource
   */
  private onResourceClick = (resource: ExhibitionPageResource) => () => {
    this.setState({
      selectedResource: resource,
      selectedTriggerIndex: undefined,
      selectedTabIndex: undefined
    });
  };

  /**
   * Event handler for preview tab click
   *
   * @param viewId tab component view id
   * @param newIndex new active tab index
   */
  private onPreviewTabClick = (viewId: string, newIndex: number) => {
    const { tabMap } = this.state;

    this.setState(
      produce((draft: State) => {
        const tabToUpdate = tabMap.get(viewId);
        if (!tabToUpdate) {
          return;
        }

        const newTabHolder = { ...tabToUpdate, "activeTabIndex": newIndex };
        draft.tabMap.set(viewId, newTabHolder);
      })
    );
  }

  /**
   * Event handler for expand element
   *
   * @param view page layout view
   * @param event React change event
   * @param expanded is element expanded
   */
  private onExpandElement = (view: PageLayoutView) => (event: React.ChangeEvent<{}>, expanded: boolean) => {
    this.setState({
      selectedLayoutView: expanded ? view : undefined
    });
  }

  /**
   * Event handler for expand content version
   *
   * @param contentVersion content version
   * @param event React change event
   * @param expanded is content version expanded
   */
  private onExpandContentVersion = (contentVersion: ContentVersion) => (event: React.ChangeEvent<{}>, expanded: boolean) => {
    this.setState({
      selectedContentVersion: expanded ? contentVersion : undefined,
      selectedPage: expanded ? this.getCorrespondingSelectedPage(contentVersion) : undefined
    });
  }

  /**
   * Get corresponding selected page from given content version.
   *
   * Used when content version is changed.
   * Uses selected device and order number of the currently selected page
   * to find corresponding page from new selected content version.
   *
   * @param contentVersion new content version
   * @returns corresponding selected page if one is found, otherwise false
   */
  private getCorrespondingSelectedPage = (contentVersion: ContentVersion): ExhibitionPage | undefined => {
    const { selectedDevice, selectedPage, pages } = this.state;
    return pages.find(page => 
      page.contentVersionId === contentVersion.id &&
      page.deviceId === selectedDevice?.id &&
      page.orderNumber === selectedPage?.orderNumber
    );
  }

  /**
   * Event handler for page drag end
   *
   * @param contentVersionId content version id
   * @param deviceId device id
   * @param result drop result
   */
  private onPageDragEnd = (contentVersionId: string, deviceId: string) => (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const movedPageId = result.draggableId;
    const oldIndex = result.source.index;
    const newIndex = result.destination.index;

    if (oldIndex === newIndex) {
      return;
    }

    this.updatePageOrderNumber(newIndex, movedPageId, contentVersionId, deviceId);
  }

  /**
   * Update page order number
   *
   * @param newIndex new index
   * @param movedPageId moved pages uuid
   * @param contentVersionId id of content version where page belongs to
   * @param deviceId id of device where page belongs to
   * @returns new order as string list
   */
  private updatePageOrderNumber = (newIndex: number, movedPageId: string, contentVersionId: string, deviceId: string) => {
    const { pages } = this.state;

    const movedPage = pages.find(page => page.id === movedPageId);

    if (!movedPage) {
      return;
    }

    const filteredPages = pages.filter(page => (
      page.deviceId === deviceId &&
      page.contentVersionId === contentVersionId &&
      page.id !== movedPage.id
    ));

    const updatedPages = this.resolvesNewPageOrderNumber(filteredPages, movedPage.orderNumber, newIndex);
    updatedPages.push( { ...movedPage, orderNumber: newIndex } );

    this.doPageOrderUpdate(updatedPages);
  }

  /**
   * Updates new order numbers to pages within given list
   *
   * @param filteredPages list of pages that have been filtered by device and content version
   * @param oldIndex old index of moved page
   * @param newIndex new index of moved page
   */
  private resolvesNewPageOrderNumber = (filteredPages: ExhibitionPage[], oldIndex: number, newIndex: number): ExhibitionPage[] => {
    const updatedPages: ExhibitionPage[] = [];

    filteredPages.forEach(page => {
      const pagesOrderNumber = page.orderNumber;
      if (pagesOrderNumber > oldIndex && pagesOrderNumber <= newIndex) {
        const newOrderNumber = page.orderNumber - 1;
        updatedPages.push( { ...page, orderNumber: newOrderNumber } );
      } else if (pagesOrderNumber < oldIndex && pagesOrderNumber >= newIndex) {
        const newOrderNumber = page.orderNumber + 1;
        updatedPages.push( { ...page, orderNumber: newOrderNumber } );
      }
    });

    return updatedPages;
  }

  /**
   * Do page order update to API and state
   *
   * @param pagesToUpdate list of pages that needs to be updated
   */
  private doPageOrderUpdate = async (pagesToUpdate: ExhibitionPage[]) => {
    const { accessToken, exhibitionId } = this.props;

    pagesToUpdate.forEach(pageToUpdate => {
      this.setState(
        produce((draft: State) => {
          const pageIndex = draft.pages.findIndex(page => page.id === pageToUpdate.id);
          if (pageIndex > -1) {
            draft.pages[pageIndex] = pageToUpdate;
          }
        })
      );
    });

    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    for (const pageToUpdate of pagesToUpdate) {
      if (!pageToUpdate.id) {
        return;
      }

      await exhibitionPagesApi.updateExhibitionPage({
        exhibitionId: exhibitionId,
        exhibitionPage: pageToUpdate,
        pageId: pageToUpdate.id
      });
    }
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
        draft.selectedLayoutView = undefined;

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

        resourceHolder.tabPropertyIdToTabResourceId.forEach((value, key) => {
          const tabIndex = draft.selectedPage?.resources.findIndex(resource => resource.id === value.tabResourceId);
          if (tabIndex !== undefined && tabIndex > -1 && draft.selectedPage) {
            const tabComponent = ResourceUtils.getResourcesForTabComponent(draft.selectedPage.resources, tabIndex, value.tabContentContainerId);
            draft.tabMap.set(key, {
              activeTabIndex: 0,
              tabComponent: tabComponent
            });
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
    const { accessToken, exhibitionId } = this.props;
    const {
      layouts,
      selectedContentVersion,
      selectedDevice,
      devices,
      pages
    } = this.state;

    if (!selectedDevice) {
      return;
    }

    const layoutId = layouts && layouts.length ? layouts[0].id : null;
    const deviceId = selectedDevice.id;
    const temp = ResourceUtils.getResourcesFromLayoutData(layouts[0].data);

    if (!layoutId || !deviceId || !selectedContentVersion) {
      return null;
    }

    const filteredPages = pages.filter(page =>
      page.deviceId === deviceId &&
      page.contentVersionId === selectedContentVersion.id!
    );

    const newPage: ExhibitionPage = {
      layoutId: layoutId,
      deviceId: deviceId,
      contentVersionId: selectedContentVersion.id!,
      name: strings.exhibition.newPage,
      eventTriggers: [],
      resources: temp.resources,
      orderNumber: filteredPages.length,
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
      }
    });

    this.setState(
      produce((draft: State) => {
        const deviceIndex = devices.findIndex(device => device.id === selectedDevice.id);
        if (deviceIndex < 0) {
          return;
        }

        draft.devices[deviceIndex] = updatedDevice;
        draft.pages.push(createdPage);
        draft.selectedPage = createdPage;
        draft.tabResourceIndex = undefined;
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
      const { selectedPage, selectedDevice } = this.state;
      if (!selectedPage || !selectedPage.id || !selectedDevice) {
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
   * On properties panel close
   */
  private onPropertiesClose = () => {
    this.setState({
      selectedTabIndex: undefined,
      selectedTriggerIndex: undefined
    });
  }

  /**
   * Get tab structure from resources
   */
  private getTabStructure = (contentContainerId?: string) => {
    const { tabResourceIndex, selectedPage } = this.state;

    if (tabResourceIndex !== undefined && selectedPage && selectedPage.resources.length > 0) {
      const data = selectedPage.resources[tabResourceIndex].data;

      const parsed = parseStringToJsonObject<typeof data, TabStructure>(data);
      return { contentContainerId: contentContainerId, ...parsed } as TabStructure;

    }
  }

  /**
   * Checks if selected page has changed
   *
   * @param previousPage previous selected page
   * @param currentPage current selected page
   * @returns true if selected page has changed, otherwise false
   */
  private isPageChanged = (previousPage?: ExhibitionPage, currentPage?: ExhibitionPage): boolean => {
    return previousPage?.id !== currentPage?.id;
  }

  /**
   * Checks if page layout has changed
   *
   * @param previousPage previous selected page
   * @param currentPage current selected page
   * @returns true if layout has changed, otherwise false
   */
  private isLayoutChanged = (previousPage?: ExhibitionPage, currentPage?: ExhibitionPage) => {
    return previousPage?.layoutId !== currentPage?.layoutId;
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
