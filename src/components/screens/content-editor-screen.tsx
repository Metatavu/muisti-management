import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/content-editor-screen";
// tslint:disable-next-line: max-line-length
import { WithStyles, withStyles, CircularProgress, Divider, Accordion, AccordionSummary, Typography, AccordionDetails, Button, List, ListItem, ListItemSecondaryAction, TextField, Tabs, Tab, Box, MenuItem } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken, ActionButton, ConfirmDialogData, LanguageOptions, PreviewDeviceData } from "../../types";
import BasicLayout from "../layouts/basic-layout";
import Api from "../../api/api";
// tslint:disable-next-line: max-line-length
import { GroupContentVersion, ExhibitionDevice, ExhibitionPage, Exhibition, ExhibitionPageEventTriggerFromJSON, ExhibitionPageResourceFromJSON, DeviceModel, PageLayout, PageLayoutView, ExhibitionPageResource, ExhibitionPageTransition, ExhibitionPageEventTrigger, PageLayoutWidgetType, ContentVersion, VisitorVariable, GroupContentVersionStatus } from "../../generated/client";
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
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { allowedWidgetTypes, TabStructure, ExhibitionPageTab, ExhibitionPageTabProperty, ExhibitionPageTabHolder } from "../content-editor/constants";
import TabEditor from "../content-editor/tab-editor";
import { parseStringToJsonObject } from "../../utils/content-editor-utils";
import LanguageUtils from "../../utils/language-utils";
import GenericDialog from "../generic/generic-dialog";
import ConfirmDialog from "../generic/confirm-dialog";

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
  groupContentVersions: GroupContentVersion[];
  groupContentVersion?: GroupContentVersion;
  devices: ExhibitionDevice[];
  previewDevicesData: PreviewDeviceData[];
  layouts: PageLayout[];
  newContentVersion?: ContentVersion;
  selectedContentVersion?: ContentVersion;
  selectedDevice?: ExhibitionDevice;
  pages: ExhibitionPage[];
  visitorVariables: VisitorVariable[];
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
  tabMap: Map<string, ExhibitionPageTabHolder>;
  dataChanged: boolean;
  timelineTabIndex: number;
  addLanguageDialogOpen: boolean;
  confirmDialogData: ConfirmDialogData;
  deleteDialogOpen: boolean;
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
      timelineTabIndex: 1,
      dataChanged: false,
      loading: false,
      devices: [],
      previewDevicesData: [],
      pages: [],
      visitorVariables: [],
      layouts: [],
      contentVersions: [],
      groupContentVersions: [],
      view: "VISUAL",
      propertiesExpanded: false,
      tabMap: new Map(),
      addLanguageDialogOpen: false,
      confirmDialogData: {
        deletePossible: true,
        title: strings.contentEditor.delete.deleteTitle,
        text: strings.contentEditor.delete.deleteText,
        cancelButtonText: strings.confirmDialog.cancel,
        positiveButtonText: strings.confirmDialog.delete,
        onCancel: this.onCloseOrCancelClick,
        onClose: this.onCloseOrCancelClick,
        onConfirm: this.onDeletePageClick
      },
      deleteDialogOpen: false
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
      selectedResource,
      selectedTriggerIndex,
      selectedTabIndex,
      dataChanged,
      timelineTabIndex
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
        >
          <div className={ classes.loader }>
            <CircularProgress size={ 50 } color="secondary"></CircularProgress>
          </div>
        </BasicLayout>
      );
    }

    const propertiesTitle = selectedResource ?
      strings.contentEditor.editor.resourceProperties :
      selectedTriggerIndex !== undefined ?
        strings.contentEditor.editor.eventTriggers.title :
        strings.contentEditor.editor.tabs.title;

    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ groupContentVersion?.name || "" }
        breadcrumbs={ [] }
        actionBarButtons={ this.getActionButtons() }
        noBackButton
        dataChanged={ dataChanged }
        openDataChangedPrompt={ true }
      >
        <div className={ classes.editorLayout }>
          <EditorView>
            { this.renderEditor() }
          </EditorView>

          <ElementTimelinePane>
            <Tabs
              classes={{
                root: classes.contentTabs,
                indicator: classes.tabIndicator
              }}
              onChange= { this.setTabIndex }
              value={ timelineTabIndex }
            >
              <Tab
                value={ 0 }
                label={ strings.contentEditor.editor.editorTabs.noVisitor }
              />
              <Tab
                value={ 1 }
                label={ strings.contentEditor.editor.editorTabs.visitorPresent }
              />
            </Tabs>
            <div className={ classes.timelineContent }>
              { timelineTabIndex === 0 &&
                this.renderIdlePageEditor()
              }
              { timelineTabIndex === 1 &&
                this.renderTimeline() 
              }
            </div>

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
        { this.renderAddContentVersionDialog() }
        { this.renderConfirmDeleteDialog() }
      </BasicLayout>
    );
  }

  /**
   * Render add new content language version dialog
   */
  private renderAddContentVersionDialog = () => {
    const { addLanguageDialogOpen, newContentVersion } = this.state;
    const languageOptions = this.getAvailableLanguages();

    return(
      <GenericDialog
        cancelButtonText={ strings.genericDialog.cancel }
        positiveButtonText={ strings.genericDialog.add }
        title={ strings.contentEditor.editor.addLanguageDialog.title }
        onConfirm={ this.addContentVersion }
        onCancel={ this.onCloseOrCancelClick }
        open={ addLanguageDialogOpen }
        error={ false }
        onClose={ this.onCloseOrCancelClick }
      >
        <Box width={ 320 }>
          <TextField
            select
            name="language"
            label={ strings.contentVersion.language }
            value={ newContentVersion?.language || "" }
            onChange={ this.onNewContentVersionLanguageChange }
          >
            { languageOptions.map(option =>
              <MenuItem key={ option } value={ option }>
                { option }
              </MenuItem>
            )}
          </TextField>
        </Box>
      </GenericDialog>
    );
  }

  /**
   * Render confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { confirmDialogData, deleteDialogOpen } = this.state;

    return (
      <ConfirmDialog
        open={ deleteDialogOpen }
        confirmDialogData={ confirmDialogData }
      />
    );
  }

  /**
   * Sets tab index
   *
   * @param event event object
   * @param newIndex new tab index value
   */
  private setTabIndex = (event: React.ChangeEvent<{ }>, newIndex: number) => {
    this.setState({
      timelineTabIndex: newIndex,
      selectedContentVersion: this.state.contentVersions[0],
      selectedDevice: undefined,
      selectedPage: undefined,
      selectedLayoutView: undefined,
      selectedTriggerIndex: undefined,
      selectedResource: undefined,
      selectedTabIndex: undefined
    });
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
    const {
      previewDevicesData,
      pages,
      layouts,
      selectedContentVersion,
      selectedLayoutView,
      tabMap
    } = this.state;

    let totalContentWidth = 0;
    let totalContentHeight = 0;

    const previews = previewDevicesData.map((previewData, index, array) => {
      const devicePages = pages.filter(page =>
        page.deviceId === previewData.device.id &&
        page.contentVersionId === selectedContentVersion?.id
      );

      const previewPage = devicePages.find(page => page.id === previewData.page?.id);
      const previewLayout = layouts.find(layout => layout.id === previewPage?.layoutId);
      if (!previewPage || !previewLayout) {
        return null;
      }

      const view = previewLayout.data;
      const resources = previewPage.resources;
      const deviceModel = deviceModels.find(model => model.id === previewLayout.modelId);
      const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel ? deviceModel : deviceModels[0]);
      const scale = 1;

      totalContentWidth += displayMetrics.widthPixels;
      if (index < array.length - 1) {
        totalContentWidth += 50;
      }

      if (totalContentHeight < displayMetrics.heightPixels) {
        totalContentHeight = displayMetrics.heightPixels;
      }

      return (
        <div key={ previewData.device.id } className={ classes.previewDeviceContainer }>
          <Typography variant="h1" style={{ fontSize: 72 }}>
            { `${previewData.device?.name} - ${previewPage.name}` }
          </Typography>
          <PagePreview
            screenOrientation={ previewLayout.screenOrientation }
            deviceOrientation={ deviceModel?.screenOrientation }
            device={ previewData.device }
            page={ previewPage }
            view={ view }
            selectedView={ selectedLayoutView }
            resources={ resources }
            displayMetrics={ displayMetrics }
            scale={ scale }
            onViewClick={ this.onLayoutViewClick }
            onTabClick={ this.onPreviewTabClick }
            tabMap={ tabMap }
          />
        </div>
      );
    });

    return (
      <div className={ classes.visualEditorContainer }>
        <PanZoom
          minScale={ 0.1 }
          fitContent={ true }
          contentWidth={ totalContentWidth }
          contentHeight={ totalContentHeight }
        >
          { previews }
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
      previewDevicesData,
      selectedDevice,
      pages,
      selectedPage
    } = this.state;

    return contentVersions.map(contentVersion => {
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
              previewDevicesData={ previewDevicesData }
              pages={ pages }
              pageType="active"
              selectedContentVersion={ selectedContentVersion }
              selectedDevice={ selectedDevice }
              selectedPage={ selectedPage }
              onClick={ this.onPageClick }
              onDragEnd={ this.onPageDragEnd }
            />
          </AccordionDetails>
        </Accordion>
      );
    });
  }

  /**
   * Renders idle page editor
   */
  private renderIdlePageEditor = () => {
    const { classes } = this.props;
    const {
      devices,
      pages,
      previewDevicesData,
      selectedDevice,
      selectedPage
    } = this.state;

    return (
      <div className={ classes.idlePageEditor }>
        <TimelineDevicesList
          selectedDevice={ selectedDevice }
          onClick={ this.onDeviceClick }
          devices={ devices }
        />
        <Divider orientation="vertical" flexItem className={ classes.timelineDivider } />
        <TimelineEditor
          devices={ devices }
          previewDevicesData={ previewDevicesData }
          pages={ pages }
          pageType="idle"
          selectedDevice={ selectedDevice }
          selectedPage={ selectedPage }
          onClick={ this.onPageClick }
          onDragEnd={ this.onPageDragEnd }
        />
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
        if (pageLayoutView.widget === PageLayoutWidgetType.TouchableOpacity) {
          elementList.push(this.renderResources(selectedPage, pageLayoutView, []));
        }

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
          <LayoutViewResourcesList
            resources={ resources }
            selectedResource={ selectedResource }
            onClick={ this.onResourceClick }
          />
          { eventTriggerItems &&
            <div style={{ marginLeft: theme.spacing(4) }}>
              <Typography style={{ padding: theme.spacing(1) }} variant="h5">
                { strings.contentEditor.editor.eventTriggers.title }
              </Typography>
              { eventTriggerItems }
            </div>
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
          <div style={{ marginLeft: theme.spacing(4) }}>
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
          </div>
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
      pageLayout,
      selectedResource,
      selectedTriggerIndex,
      selectedTabIndex,
      pages,
      contentVersions,
      visitorVariables,
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
          visitorVariables={ visitorVariables }
        />
      );
    }

    if (selectedTriggerIndex !== undefined) {
      const foundTrigger = selectedPage.eventTriggers[selectedTriggerIndex];
      const availableLanguages = LanguageUtils.getAvailableLanguages(contentVersions);

      return(
        <EventTriggerEditor
          selectedEventTrigger={ foundTrigger }
          view={ pageLayout?.data }
          pages={ pages }
          availableLanguages={ availableLanguages }
          visitorVariables={ visitorVariables }
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
    const { classes } = this.props;
    const { selectedTabIndex } = this.state;
    const tabStructure = this.getTabStructure();
    if (!tabStructure || !tabStructure.tabs) {
      return null;
    }

    const tabs = tabStructure.tabs;

    const tabItems = tabs.map((tab, tabIndex) => {
      return (
        <ListItem
          className={ classes.borderedListItem }
          key={ tabIndex }
          button
          onClick={ this.onTabClick(tabIndex) }
          selected={ selectedTabIndex === tabIndex }
        >
          <Typography style={{ marginLeft: theme.spacing(1) }} variant="h6">
            { tab.label }
          </Typography>
          <ListItemSecondaryAction>
            <Button
              size="small"
              aria-label="delete"
              onClick={ this.onDeleteTabClick(tabIndex) }
            >
              { strings.generic.delete }
            </Button>
          </ListItemSecondaryAction>
          <ChevronRightIcon htmlColor="#888" />
        </ListItem>
      );
    });

    return (
      <List
        disablePadding
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
      const { classes } = this.props;

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
            style={{ marginBottom: theme.spacing(1) }}
          >
            <ListItem
              className={ classes.borderedListItem }
              key={ index }
              button
              onClick={ this.onTriggerClick(pageEventTriggerIndex) }
            >
              <Typography style={{ marginLeft: theme.spacing(1) }} variant="h6">
                { trigger.name }
              </Typography>
              <ListItemSecondaryAction className={ classes.borderedListItemSecondaryAction }>
                <Button
                  variant="text"
                  size="small"
                  aria-label="delete"
                  onClick={ this.onDeleteTriggerClick(pageEventTriggerIndex) }
                >
                  { strings.generic.delete }
                </Button>
                <ChevronRightIcon htmlColor="#888" />
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
        draft.dataChanged = true;
      })
    );
  }

  /**
   * Updates tab
   *
   * @param updatedTab updated tab
   */
  private updateTab = (updatedTab: ExhibitionPageTab) => {
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
        draft.dataChanged = true;
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
        draft.dataChanged = true;
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
        draft.dataChanged = true;
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
          draft.dataChanged = true;
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
          draft.dataChanged = true;
        })
      );
    } else if (transitionType === "exit") {
      this.setState(
        produce((draft: State) => {
          draft.selectedPage!.exitTransitions = transitions;
          draft.dataChanged = true;
        })
      );
    }
  }

  /**
   * Fetches component data
   */
  private fetchComponentData = async () => {
    const {
      accessToken,
      exhibitionId,
      roomId,
      contentVersionId,
      groupContentVersionId
    } = this.props;

    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const groupContentVersionsApi = Api.getGroupContentVersionsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);

    const [ initialContentVersion, contentVersionsInRoom, groupContentVersion, layouts, visitorVariables ] = await Promise.all([
      contentVersionsApi.findContentVersion({ exhibitionId, contentVersionId }),
      contentVersionsApi.listContentVersions({ exhibitionId, roomId }),
      groupContentVersionsApi.findGroupContentVersion({ exhibitionId, groupContentVersionId }),
      layoutsApi.listPageLayouts({ }),
      visitorVariablesApi.listVisitorVariables({ exhibitionId: exhibitionId })
    ]);

    /**
     * Devices from device group
     */
    const deviceGroupId = groupContentVersion.deviceGroupId;
    const devices = await exhibitionDevicesApi.listExhibitionDevices({ exhibitionId, exhibitionGroupId: deviceGroupId });

    /**
     * Content versions for different languages.
     * Identified by having the same name but different language than
     * initial content version selected before navigating to content editor.
     */
    const contentVersions: ContentVersion[] = [];
    contentVersionsInRoom.forEach(contentVersionInRoom => {
      const sameName = contentVersionInRoom.name === initialContentVersion.name;
      const newLanguage = contentVersions.every(version => version.language !== contentVersionInRoom.language);
      if (sameName && newLanguage) {
        contentVersions.push(contentVersionInRoom);
      }
    });

    /**
     * Group content versions for different content versions
     * Creates new group content version for a content version if one does not exist yet
     */
    const groupContentVersions: GroupContentVersion[] = [];
    for (const contentVersion of contentVersions) {
      const foundGroupContentVersions = await groupContentVersionsApi.listGroupContentVersions({
        exhibitionId,
        contentVersionId: contentVersion.id!,
        deviceGroupId: deviceGroupId
      });

      if (foundGroupContentVersions.length < 1) {
        const newGroupContentVersion = await groupContentVersionsApi.createGroupContentVersion({
          exhibitionId,
          groupContentVersion: {
            contentVersionId: contentVersion.id!,
            deviceGroupId: deviceGroupId,
            name: groupContentVersion.name,
            status: GroupContentVersionStatus.Inprogress,
            exhibitionId: exhibitionId
          }
        });

        groupContentVersions.push(newGroupContentVersion);
      } else {
        if (foundGroupContentVersions.length > 1) {
          console.error("More than one group content version with same device group found under one content version. This should not be possible!");
        }

        groupContentVersions.push(foundGroupContentVersions[0]);
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
    const selectedContentVersion = contentVersions[0];
    const selectedDevice = devices[0];
    const previewDevicesData = this.getPreviewDevicesData(selectedContentVersion, devices, pages);
    const selectedPage = pages.find(
      page => page.deviceId === selectedDevice.id &&
      page.contentVersionId === selectedContentVersion.id &&
      page.orderNumber === 0
    );

    if (selectedPage) {
      this.updateResources(layouts, selectedPage);
    }

    this.setState({
      contentVersions,
      groupContentVersions,
      groupContentVersion,
      devices,
      previewDevicesData,
      pages,
      visitorVariables: visitorVariables,
      layouts,
      selectedContentVersion,
      selectedDevice
    });

  }

  /**
   * Get preview devices data for given content version
   *
   * @param contentVersion content version
   * @param devices devices
   * @param pages pages
   * @returns preview devices
   */
  private getPreviewDevicesData = (contentVersion: ContentVersion, devices: ExhibitionDevice[], pages: ExhibitionPage[]): PreviewDeviceData[] => {
    return devices.map((device): PreviewDeviceData => {
      const page = pages.find(page =>
        page.contentVersionId === contentVersion.id &&
        page.deviceId === device.id &&
        page.orderNumber === 0
      );

      return { device, page };
    });
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const {
      selectedContentVersion,
      selectedDevice,
      selectedPage,
      view,
      dataChanged
    } = this.state;

    const actionButtons: ActionButton[] = [{
      name: view === "CODE" ?
        strings.exhibitionLayouts.editView.switchToVisualButton :
        strings.exhibitionLayouts.editView.switchToCodeButton,
      action: this.onSwitchViewClick
    }];

    if (!selectedContentVersion && !this.idlePageEditorActive()) {
      actionButtons.push({
        name: strings.exhibition.addLanguageVersion,
        action: this.onAddContentVersionClick,
        disabled: this.getAvailableLanguages().length < 1
      })
    }

    if (selectedDevice && !selectedPage) {
      actionButtons.push({
        name: strings.contentEditor.editor.saveDevice,
        action: this.onSaveDeviceClick,
        disabled: !dataChanged
      });
    }

    if (selectedDevice) {
      actionButtons.push({
        name: strings.exhibition.addPage,
        action: this.onAddPageClick,
        disabled: this.idlePageEditorActive() && !!selectedDevice.idlePageId
      });
    }

    if (selectedPage) {
      actionButtons.push({
        name: strings.contentEditor.editor.savePage,
        action: this.onPageSave,
        disabled: !dataChanged
      }, {
        name: strings.contentEditor.delete.deleteTitle,
        action: this.onDeletePageClick
      });
    }
    return actionButtons;
  }

  /**
   * Adds new content version
   */
  private addContentVersion = async () => {
    const { accessToken, exhibitionId } = this.props;
    const {
      newContentVersion,
      groupContentVersion,
      contentVersions,
      groupContentVersions
    } = this.state;

    if (!newContentVersion || !groupContentVersion) {
      return;
    }

    try {
      const contentVersionsApi = Api.getContentVersionsApi(accessToken);
      const groupContentVersionsApi = Api.getGroupContentVersionsApi(accessToken);
      const createdContentVersion = await contentVersionsApi.createContentVersion({
        exhibitionId: exhibitionId,
        contentVersion: newContentVersion
      });

      const createdGroupContentVersion = await groupContentVersionsApi.createGroupContentVersion({
        exhibitionId: exhibitionId,
        groupContentVersion: {
          contentVersionId: createdContentVersion.id!,
          deviceGroupId: groupContentVersion.deviceGroupId,
          name: groupContentVersion.name,
          status: GroupContentVersionStatus.Inprogress
        }
      });

      this.setState({
        contentVersions: [ ...contentVersions, createdContentVersion ],
        groupContentVersions: [ ...groupContentVersions, createdGroupContentVersion ]
      });
    } catch (error) {
      console.error(`Could not add new language.\nError: ${error}`)
    }

    this.setState({
      addLanguageDialogOpen: false
    });
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
        draft.dataChanged = true;
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
        draft.dataChanged = true;
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
    const newProperty: ExhibitionPageTabProperty = {
      name: "src",
      type: "string",
      value: "@resources/src"
    };

    const newTab: ExhibitionPageTab = {
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
  private onDeleteTabClick = (tabIndex: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const { selectedPage, tabResourceIndex, selectedLayoutView, tabMap } = this.state;
    event.stopPropagation();

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
  private onDeviceClick = (selectedDevice: ExhibitionDevice, selectedContentVersion?: ContentVersion) => () => {
    if (selectedContentVersion) {
      this.setState({ selectedContentVersion });
    }

    this.setState({
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
   * @param selectedPage selected page
   * @param selectedContentVersion possible selected content version
   */
  private onPageClick = (selectedPage: ExhibitionPage, selectedContentVersion?: ContentVersion) => () => {
    const { devices, previewDevicesData, timelineTabIndex, contentVersions } = this.state;
    const isIdlePage = timelineTabIndex === 0;
    const selectedDevice = devices.find(device => device.id === selectedPage.deviceId);
    const previewDeviceIndex = previewDevicesData.findIndex(previewData => previewData.device.id === selectedDevice?.id);
    if (previewDeviceIndex > -1) {
      this.setState(
        produce((draft: State) => {
          draft.previewDevicesData[previewDeviceIndex].page = selectedPage;
        })
      )
    }

    this.setState({
      selectedContentVersion: isIdlePage ?
        contentVersions[0] :
        selectedContentVersion,
      selectedDevice,
      selectedPage,
      selectedResource: undefined,
      selectedTriggerIndex: undefined,
      tabResourceIndex: undefined,
      selectedTabIndex: undefined
    });
  }

  /**
   * Event handler for layout view click
   *
   * @param view page layout view
   */
  private onLayoutViewClick = (device: ExhibitionDevice, page: ExhibitionPage, view: PageLayoutView) => {
    this.setState({
      selectedDevice: device,
      selectedPage: page,
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
      selectedPage: expanded ? this.getCorrespondingSelectedPage(contentVersion) : undefined,
      previewDevicesData: expanded ? this.getPreviewDevicesData(contentVersion, this.state.devices, this.state.pages) : []
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
   * @returns corresponding selected page if one is found, otherwise undefined
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
   * @param device device
   * @param contentVersionId possible content version id
   * @param result drop result
   */
  private onPageDragEnd = (device: ExhibitionDevice, contentVersionId?: string) => (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const movedPageId = result.draggableId;
    const oldIndex = result.source.index;
    const newIndex = result.destination.index;

    if (oldIndex === newIndex) {
      return;
    }

    this.updateOrderNumbers(newIndex, movedPageId, device, contentVersionId);
  }

  /**
   * Updates page order numbers
   *
   * @param newIndex new index
   * @param movedPageId moved pages uuid
   * @param device device where page belongs to
   * @param contentVersionId possible id of content version where page belongs to
   */
  private updateOrderNumbers = (newIndex: number, movedPageId: string, device: ExhibitionDevice, contentVersionId?: string) => {
    const { pages } = this.state;

    const movedPage = pages.find(page => page.id === movedPageId);
    if (!movedPage) {
      return;
    }

    const devicePages = this.getDevicePages(pages, device, contentVersionId);
    const updatedPages = this.getUpdatedDevicePagesOrder(devicePages, movedPageId, newIndex);

    this.doPageOrderUpdate(updatedPages);
  }

  /**
   * Filters device pages from all pages and sorts them by order number
   * 
   * @param pages pages
   * @param device device
   * @param contentVersionId possible content version ID
   * @returns filtered and sorted device pages
   */
  private getDevicePages = (pages: ExhibitionPage[], device: ExhibitionDevice, contentVersionId?: string) => {
    return pages
      .filter(page =>
        page.deviceId === device.id &&
        (page.contentVersionId === contentVersionId || page.id === device.idlePageId)
      )
      .sort((a, b) => a.orderNumber - b.orderNumber);
  }

  /**
   * Get list of device pages in updated order
   * 
   * @param devicePages device pages
   * @param movedPageId moved or removed page id
   * @param newIndex possible new index for moved page
   * @returns device pages in new order
   */
  private getUpdatedDevicePagesOrder = (
    devicePages: ExhibitionPage[],
    movedPageId: string,
    newIndex?: number
  ): ExhibitionPage[] => {
    const pageIndex = devicePages.findIndex(page => page.id === movedPageId);
    if (pageIndex > -1) {
      const [page] = devicePages.splice(pageIndex, 1);
      if (newIndex !== undefined) {
        devicePages.splice(newIndex, 0, page);
      }
    }

    return devicePages.map((devicePage, index) => ({
      ...devicePage,
      orderNumber: index
    }));;
  }

  /**
   * Do page order update to API and state
   *
   * @param pagesToUpdate list of pages that needs to be updated
   */
  private doPageOrderUpdate = async (pagesToUpdate: ExhibitionPage[]) => {
    const { accessToken, exhibitionId } = this.props;
    const originalPages = [ ...this.state.pages ];

    this.setState({
      loading: true
    });

    this.setState(
      produce((draft: State) => {
        pagesToUpdate.forEach(pageToUpdate => {
          const pageIndex = draft.pages.findIndex(page => page.id === pageToUpdate.id);
          if (pageIndex > -1) {
            draft.pages[pageIndex] = pageToUpdate;
          }

          const previewDeviceIndex = draft.previewDevicesData.findIndex(data => data.page?.id === pageToUpdate.id);
          if (previewDeviceIndex > -1) {
            draft.previewDevicesData[previewDeviceIndex].page = pageToUpdate;
          }
        });
      })
    );

    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    for (const pageToUpdate of pagesToUpdate) {
      if (!pageToUpdate.id) {
        return;
      }

      const originalPage = originalPages.find(page => page.id === pageToUpdate.id);
      const originalPageOrder = originalPage?.orderNumber;

      if (originalPageOrder !== pageToUpdate.orderNumber) {
        await exhibitionPagesApi.updateExhibitionPage({
          exhibitionId: exhibitionId,
          exhibitionPage: pageToUpdate,
          pageId: pageToUpdate.id
        });
      }
    }

    this.setState({
      loading: false
    });
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

        resourceHolder.resources
          .filter(layoutResource => !selectedPage.resources.find(pageResource => pageResource.id === layoutResource.id))
          .forEach(missingLayoutResource => {
            selectedPage.resources.push(missingLayoutResource);
          });

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
          draft.dataChanged = false;
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
   * Event handler for add content version click
   */
  private onAddContentVersionClick = () => {
    const { contentVersions } = this.state;
    const { name, rooms } = contentVersions[0];
    const availableLanguages = this.getAvailableLanguages();

    if (availableLanguages.length < 1) {
      return;
    }

    this.setState({
      addLanguageDialogOpen: true,
      newContentVersion: {
        name: name,
        rooms: rooms,
        language: availableLanguages[0]
      }
    });
  }

  /**
   * Event handler for new content version language change
   *
   * @param event React change event
   */
  private onNewContentVersionLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      newContentVersion: {
        ...this.state.newContentVersion,
        language: event.target.value
      } as ContentVersion
    });
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
      pages,
      timelineTabIndex
    } = this.state;

    if (!selectedDevice) {
      return;
    }

    const isIdlePage = timelineTabIndex === 0;
    const layoutId = layouts && layouts.length ? layouts[0].id : null;
    const deviceId = selectedDevice.id;
    const temp = ResourceUtils.getResourcesFromLayoutData(layouts[0].data);

    if (!layoutId || !deviceId || !selectedContentVersion) {
      return;
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
      orderNumber: isIdlePage ?
        0 :
        filteredPages.length,
      enterTransitions: [],
      exitTransitions: []
    };

    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const createdPage = await exhibitionPagesApi.createExhibitionPage({
      exhibitionId: exhibitionId,
      exhibitionPage: newPage
    });

    this.setState(
      produce((draft: State) => {
        draft.pages.push(createdPage);
        draft.selectedPage = createdPage;
        draft.tabResourceIndex = undefined;
      })
    );

    if (isIdlePage) {
      const deviceIndex = devices.findIndex(device => device.id === selectedDevice.id);

      if (deviceIndex < 0) {
        return;
      }

      const updatedDevice = await exhibitionDevicesApi.updateExhibitionDevice({
        exhibitionId: exhibitionId,
        deviceId: selectedDevice.id!,
        exhibitionDevice: {
          ...selectedDevice,
          idlePageId: createdPage.id
        }
      });

      this.setState(
        produce((draft: State) => {
          draft.devices[deviceIndex] = updatedDevice;
        })
      );
    }
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

        this.setState({
          pages: newPages,
          dataChanged: false
        });
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
      const {
        selectedPage,
        selectedContentVersion,
        selectedDevice,
        pages,
        timelineTabIndex
      } = this.state;

      if (!selectedContentVersion || !selectedPage || !selectedPage.id || !selectedDevice) {
        return;
      }

      const isIdlePage = !!selectedDevice.idlePageId && timelineTabIndex === 0;
      if (isIdlePage) {
        const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
        await exhibitionDevicesApi.updateExhibitionDevice({
          exhibitionId: exhibitionId,
          deviceId: selectedDevice.id!,
          exhibitionDevice: {
            ...selectedDevice,
            idlePageId: undefined
          },
        });
      }

      const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
      await exhibitionPagesApi.deleteExhibitionPage({ exhibitionId, pageId: selectedPage.id });

      if (isIdlePage) {
        this.setState({ pages: pages.filter(page => page.id !== selectedPage.id) });
      } else {
        const devicePages = this.getDevicePages(pages, selectedDevice, selectedContentVersion.id);
        const updatedDevicePages = this.getUpdatedDevicePagesOrder(devicePages, selectedPage.id);
        const updatedPages = pages
          .filter(page => page.id !== selectedPage.id)
          .map(page => updatedDevicePages.find(devicePage => devicePage.id === page.id) ?? page);

        this.setState({ pages: updatedPages });
      }

      this.setState({
        selectedPage: undefined,
        selectedTriggerIndex: undefined
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: e });
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
   * Event handler for close or cancel click in dialog
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addLanguageDialogOpen: false,
      deleteDialogOpen: false
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
   * Returns available languages based on languages used in content versions
   */
  private getAvailableLanguages = () => {
    return Object.values(LanguageOptions).filter(option =>
      this.state.contentVersions.every(contentVersion => contentVersion.language !== option)
    );
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

  /**
   * Returns whether idle page editor is active or not
   */
  private idlePageEditorActive = (): boolean => {
    return this.state.selectedTabIndex === 0;
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