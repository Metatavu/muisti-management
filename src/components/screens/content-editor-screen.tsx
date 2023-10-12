import { setSelectedExhibition } from "../../actions/exhibitions";
import Api from "../../api/api";
import {
  ContentVersion,
  Device,
  DeviceModel,
  Exhibition,
  ExhibitionDevice,
  ExhibitionPage,
  ExhibitionPageEventTrigger,
  ExhibitionPageEventTriggerFromJSON,
  ExhibitionPageResource,
  ExhibitionPageResourceFromJSON,
  ExhibitionPageResourceType,
  ExhibitionPageTransition,
  LayoutType,
  PageLayout,
  PageLayoutView,
  PageLayoutViewHtml,
  PageLayoutWidgetType,
  VisitorVariable
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/content-editor-screen";
import theme from "../../styles/theme";
import {
  AccessToken,
  ActionButton,
  ConfirmDialogData,
  HtmlComponentType,
  LanguageOptions,
  PreviewDeviceData,
  TreeObject
} from "../../types";
import DisplayMetrics from "../../types/display-metrics";
import AndroidUtils from "../../utils/android-utils";
import { parseStringToJsonObject } from "../../utils/content-editor-utils";
import HtmlResourceUtils from "../../utils/html-resource-utils";
import LanguageUtils from "../../utils/language-utils";
import ResourceUtils from "../../utils/resource-utils";
import {
  ExhibitionPageTab,
  ExhibitionPageTabHolder,
  TabStructure
} from "../content-editor/constants";
import ContentScreenContentAccordion from "../content-editor/content-accordion";
import EventTriggerEditor from "../content-editor/event-trigger-editor";
import ResourceEditor from "../content-editor/resource-editor";
import TabEditor from "../content-editor/tab-editor";
import TimelineDevicesList from "../content-editor/timeline-devices-list";
import TimelineEditor from "../content-editor/timeline-editor";
import TransitionsEditor from "../content-editor/transitions-editor";
import CodeEditor from "../editor/code-editor";
import EditorView from "../editor/editor-view";
import ConfirmDialog from "../generic/confirm-dialog";
import GenericDialog from "../generic/generic-dialog";
import PanZoom from "../generic/pan-zoom";
import BasicLayout from "../layouts/basic-layout";
import ElementContentsPane from "../layouts/element-contents-pane";
import ElementPropertiesPane from "../layouts/element-properties-pane";
import ElementTimelinePane from "../layouts/element-timeline-pane";
import PagePreview from "../preview/page-preview";
import PagePreviewHtml from "../preview/page-preview-html";
import { default as ExpandMoreIcon } from "@mui/icons-material/ChevronRight";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import produce from "immer";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { DropResult } from "react-beautiful-dnd";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { v4 as uuid } from "uuid";

type View = "CODE" | "VISUAL";

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
  deviceModels: DeviceModel[];
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  contentVersions: ContentVersion[];
  contentVersion?: ContentVersion;
  exhibitionDevices: ExhibitionDevice[];
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
  devices: Device[];
  selectedTreeObject?: TreeObject;
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
      exhibitionDevices: [],
      previewDevicesData: [],
      pages: [],
      devices: [],
      visitorVariables: [],
      layouts: [],
      contentVersions: [],
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
  };

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
  };

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    const {
      contentVersion,
      selectedResource,
      selectedTriggerIndex,
      selectedTabIndex,
      dataChanged,
      timelineTabIndex
    } = this.state;

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={keycloak}
          history={history}
          title={""}
          breadcrumbs={[]}
          actionBarButtons={[]}
          noBackButton
        >
          <div className={classes.loader}>
            <CircularProgress size={50} color="secondary" />
          </div>
        </BasicLayout>
      );
    }

    const propertiesTitle = selectedResource
      ? strings.contentEditor.editor.resourceProperties
      : selectedTriggerIndex !== undefined
      ? strings.contentEditor.editor.eventTriggers.title
      : strings.contentEditor.editor.tabs.title;

    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={contentVersion?.name || ""}
        breadcrumbs={[]}
        actionBarButtons={this.getActionButtons()}
        noBackButton
        dataChanged={dataChanged}
        openDataChangedPrompt={true}
      >
        <div className={classes.editorLayout}>
          <EditorView>{this.renderEditor()}</EditorView>

          <ElementTimelinePane>
            <Tabs
              classes={{
                root: classes.contentTabs,
                indicator: classes.tabIndicator
              }}
              onChange={this.setTabIndex}
              value={timelineTabIndex}
            >
              <Tab value={0} label={strings.contentEditor.editor.editorTabs.noVisitor} />
              <Tab value={1} label={strings.contentEditor.editor.editorTabs.visitorPresent} />
            </Tabs>
            <div className={classes.timelineContent}>
              {timelineTabIndex === 0 && this.renderIdlePageEditor()}
              {timelineTabIndex === 1 && this.renderTimeline()}
            </div>
          </ElementTimelinePane>

          <ElementContentsPane>{this.renderElementContentsPaneContent()}</ElementContentsPane>

          <ElementPropertiesPane
            open={
              !!selectedResource ||
              selectedTriggerIndex !== undefined ||
              selectedTabIndex !== undefined
            }
            title={propertiesTitle}
            onCloseClick={this.onPropertiesClose}
          >
            {this.renderProperties()}
          </ElementPropertiesPane>
        </div>
        {this.renderAddContentVersionDialog()}
        {this.renderConfirmDeleteDialog()}
      </BasicLayout>
    );
  };

  /**
   * Render add new content language version dialog
   */
  private renderAddContentVersionDialog = () => {
    const { addLanguageDialogOpen, newContentVersion } = this.state;
    const languageOptions = this.getAvailableLanguages();

    return (
      <GenericDialog
        cancelButtonText={strings.genericDialog.cancel}
        positiveButtonText={strings.genericDialog.add}
        title={strings.contentEditor.editor.addLanguageDialog.title}
        onConfirm={this.addContentVersion}
        onCancel={this.onCloseOrCancelClick}
        open={addLanguageDialogOpen}
        error={false}
        onClose={this.onCloseOrCancelClick}
      >
        <Box width={320}>
          <TextField
            select
            name="language"
            label={strings.contentVersion.language}
            value={newContentVersion?.language || ""}
            onChange={this.onNewContentVersionLanguageChange}
          >
            {languageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </GenericDialog>
    );
  };

  /**
   * Render confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { confirmDialogData, deleteDialogOpen } = this.state;

    return <ConfirmDialog open={deleteDialogOpen} confirmDialogData={confirmDialogData} />;
  };

  /**
   * Sets tab index
   *
   * @param event event object
   * @param newIndex new tab index value
   */
  private setTabIndex = (_event: React.ChangeEvent<{}>, newIndex: number) => {
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
  };

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
  };

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
        json={this.toJsonCode(selectedPage)}
        onChange={(json: string) => this.applyCodeEditorChanges(json)}
      />
    );
  };

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
      exhibitionDevices,
      devices
    } = this.state;

    let totalContentWidth = 0;
    let totalContentHeight = 0;

    const previews = previewDevicesData.map((previewData, deviceIndex) => {
      const devicePages = pages.filter(
        (page) =>
          page.deviceId === previewData.device.id &&
          page.contentVersionId === selectedContentVersion?.id
      );

      const previewPage = devicePages.find((page) => page.id === previewData.page?.id);
      const previewLayout = layouts.find((layout) => layout.id === previewPage?.layoutId);
      if (!previewPage || !previewLayout) {
        return null;
      }

      const exhibitionDevice = exhibitionDevices.find(
        (exhibitionDevice) => exhibitionDevice.id === previewPage.deviceId
      );

      // Find device model of the device attached to exhibition device
      // As a fallback if that's not found (no device yet attached), use the device model of the preview layout
      const device = devices.find((device) => device.id === exhibitionDevice?.deviceId);
      const deviceModel =
        deviceModels.find((model) => model.id === device?.deviceModelId) ??
        deviceModels.find((model) => model.id === previewLayout.modelId);

      if (!deviceModel) {
        return null;
      }

      if (previewLayout.layoutType === LayoutType.Android) {
        const displayMetrics = AndroidUtils.getDisplayMetrics(deviceModel);

        totalContentWidth += displayMetrics.widthPixels;
        if (deviceIndex < previewDevicesData.length - 1) {
          totalContentWidth += 50;
        }

        if (totalContentHeight < displayMetrics.heightPixels) {
          totalContentHeight = displayMetrics.heightPixels;
        }

        return this.renderAndroidPreview(
          deviceModel,
          previewLayout,
          previewPage,
          previewData,
          displayMetrics
        );
      } else {
        return this.renderHtmlPreview(previewData.device, deviceModel, previewLayout, previewPage);
      }
    });

    return (
      <div className={classes.visualEditorContainer}>
        <PanZoom
          minScale={0.1}
          fitContent={true}
          contentWidth={totalContentWidth}
          contentHeight={totalContentHeight}
        >
          <Stack direction="row" spacing={5}>
            {previews}
          </Stack>
        </PanZoom>
      </div>
    );
  };

  /**
   * Renders HTML layout preview
   *
   * @param deviceModel device model
   * @param previewLayout preview layout
   * @param previewPage preview page
   */
  private renderHtmlPreview = (
    device: ExhibitionDevice,
    deviceModel: DeviceModel,
    previewLayout: PageLayout,
    previewPage: ExhibitionPage
  ) => {
    const layoutHtml = (previewLayout.data as PageLayoutViewHtml).html;
    const { displayMetrics, screenOrientation: deviceOrientation } = deviceModel;

    return (
      <div key={previewPage.id} style={{ position: "relative" }}>
        <Typography
          sx={{
            position: "absolute",
            top: -20,
            opacity: 0.6
          }}
        >
          {device.name} - {previewPage.name}
        </Typography>
        <PagePreviewHtml
          displayMetrics={displayMetrics}
          deviceOrientation={deviceOrientation}
          screenOrientation={previewLayout.screenOrientation}
          layoutHtml={layoutHtml}
          resources={previewPage.resources}
        />
      </div>
    );
  };

  /**
   * Renders android layout preview
   *
   * @param deviceModel device model
   * @param previewLayout preview layout
   * @param previewPage preview page
   * @param previewData preview data
   * @param displayMetrics Android display metrics
   */
  private renderAndroidPreview = (
    deviceModel: DeviceModel,
    previewLayout: PageLayout,
    previewPage: ExhibitionPage,
    previewData: PreviewDeviceData,
    displayMetrics: DisplayMetrics
  ) => {
    const { classes } = this.props;
    const { selectedLayoutView, tabMap } = this.state;

    const view = previewLayout.data as PageLayoutView;

    const resources = previewPage.resources;
    const scale = 1;

    return (
      <div key={previewData.device.id} className={classes.previewDeviceContainer}>
        <Typography variant="h1" style={{ fontSize: 72 }}>
          {`${previewData.device?.name} - ${previewPage.name}`}
        </Typography>
        <PagePreview
          screenOrientation={previewLayout.screenOrientation}
          deviceOrientation={deviceModel?.screenOrientation}
          device={previewData.device}
          page={previewPage}
          view={view}
          selectedView={selectedLayoutView}
          resources={resources}
          displayMetrics={displayMetrics}
          scale={scale}
          onViewClick={this.onLayoutViewClick}
          onTabClick={this.onPreviewTabClick}
          tabMap={tabMap}
        />
      </div>
    );
  };

  /**
   * Renders timeline content
   */
  private renderTimeline = () => {
    const { classes } = this.props;
    const {
      selectedContentVersion,
      exhibitionDevices,
      previewDevicesData,
      selectedDevice,
      pages,
      selectedPage
    } = this.state;

    if (!selectedContentVersion) {
      return null;
    }

    return (
      <Box className={classes.timelineContentVersion}>
        <Box className={classes.timelineContentVersionTitle}>
          <Typography variant="body2" className={classes.selected}>
            {selectedContentVersion.language}
          </Typography>
        </Box>
        <Box className={classes.timelineContentVersionContent}>
          <TimelineDevicesList
            contentVersion={selectedContentVersion}
            selectedContentVersion={selectedContentVersion}
            devices={exhibitionDevices}
            selectedDevice={selectedDevice}
            onClick={this.onDeviceClick}
          />
          <Divider orientation="vertical" flexItem className={classes.timelineDivider} />
          <TimelineEditor
            contentVersion={selectedContentVersion}
            devices={exhibitionDevices}
            previewDevicesData={previewDevicesData}
            pages={pages}
            pageType="active"
            selectedContentVersion={selectedContentVersion}
            selectedDevice={selectedDevice}
            selectedPage={selectedPage}
            onClick={this.onPageClick}
            onDragEnd={this.onPageDragEnd}
          />
        </Box>
      </Box>
    );
  };

  /**
   * Renders idle page editor
   */
  private renderIdlePageEditor = () => {
    const { classes } = this.props;
    const {
      exhibitionDevices: devices,
      pages,
      previewDevicesData,
      selectedDevice,
      selectedPage
    } = this.state;

    return (
      <div className={classes.idlePageEditor}>
        <TimelineDevicesList
          selectedDevice={selectedDevice}
          onClick={this.onDeviceClick}
          devices={devices}
        />
        <Divider orientation="vertical" flexItem className={classes.timelineDivider} />
        <TimelineEditor
          devices={devices}
          previewDevicesData={previewDevicesData}
          pages={pages}
          pageType="idle"
          selectedDevice={selectedDevice}
          selectedPage={selectedPage}
          onClick={this.onPageClick}
          onDragEnd={this.onPageDragEnd}
        />
      </div>
    );
  };

  /**
   * Renders element contents pane content
   */
  private renderElementContentsPaneContent = () => {
    const { selectedPage, selectedDevice } = this.state;
    if (selectedPage) {
      return (
        <>
          {this.renderContentAccordion()}
          {this.renderTransitionAccordion()}
        </>
      );
    }

    if (selectedDevice) {
      return (
        <div style={{ padding: theme.spacing(2) }}>
          <TextField
            fullWidth
            label={strings.generic.name}
            name="name"
            value={selectedDevice.name}
            onChange={this.onDeviceDataChange}
            style={{ marginTop: theme.spacing(1) }}
          />
        </div>
      );
    }
  };

  /**
   * Render content accordion
   */
  private renderContentAccordion = () => {
    const {
      exhibitionDevices: devices,
      layouts,
      selectedPage,
      propertiesExpanded,
      resourceWidgetIdList,
      selectedTabIndex,
      tabResourceIndex,
      selectedTriggerIndex,
      selectedResource,
      selectedLayoutView,
      tabMap
    } = this.state;

    if (!selectedPage) {
      return null;
    }

    const selectedPageLayout = this.getPageLayout(selectedPage);
    if (!selectedPageLayout) {
      return null;
    }

    return (
      <ContentScreenContentAccordion
        expanded={propertiesExpanded}
        selectedPageLayout={selectedPageLayout}
        devices={devices}
        layouts={layouts}
        selectedPage={selectedPage}
        resourceWidgetIdList={resourceWidgetIdList}
        selectedTabIndex={selectedTabIndex}
        tabResourceIndex={tabResourceIndex}
        selectedTriggerIndex={selectedTriggerIndex}
        selectedResource={selectedResource}
        selectedLayoutView={selectedLayoutView}
        tabMap={tabMap}
        androidTabStructure={this.getAndroidTabStructure()}
        onExpandedChange={(expanded) => {
          this.setState({ propertiesExpanded: expanded });
        }}
        onPageDeviceChange={this.onPageDeviceChange}
        onPageLayoutChange={this.onPageLayoutChange}
        onPageNameChange={this.onPageNameChange}
        setSelectResource={this.handleResourceSelect}
        setSelectedTriggerIndex={(selectedTriggerIndex) => this.setState({ selectedTriggerIndex })}
        setSelectedTabIndex={(selectedTabIndex) => this.setState({ selectedTabIndex })}
        setSelectedLayoutView={(selectedLayoutView) => this.setState({ selectedLayoutView })}
        onAddEventTrigger={this.onAddEventTrigger}
        onDeleteEventTrigger={this.onDeleteEventTrigger}
        onDeleteAndroidTab={this.onDeleteAndroidTab}
        onAddAndroidTab={this.onAddAndroidTab}
      />
    );
  };

  /**
   * Handles resource select
   *
   * @param selectedResource selected resource
   * @param treeObject tree object
   */
  private handleResourceSelect = (
    selectedResource?: ExhibitionPageResource,
    treeObject?: TreeObject
  ) => {
    this.setState({ selectedResource: selectedResource, selectedTreeObject: treeObject });
  };

  /**
   * Render transition accordion
   */
  private renderTransitionAccordion = () => {
    const { exhibitionDevices: devices, pages, selectedPage } = this.state;
    if (!selectedPage) {
      return null;
    }

    return (
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h3">{strings.contentEditor.editor.transitions.title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TransitionsEditor
            selectedPage={selectedPage}
            devices={devices}
            pages={pages}
            onPageTransitionChange={this.onTransitionChange}
          />
        </AccordionDetails>
      </Accordion>
    );
  };

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
          resource={selectedResource}
          component={this.state.selectedTreeObject}
          onUpdate={this.onUpdateResource}
          visitorVariables={visitorVariables}
        />
      );
    }

    if (selectedTriggerIndex !== undefined) {
      const foundTrigger = selectedPage.eventTriggers[selectedTriggerIndex];
      const availableLanguages = LanguageUtils.getAvailableLanguages(contentVersions);

      return (
        <EventTriggerEditor
          selectedEventTrigger={foundTrigger}
          view={this.getPageLayout(selectedPage)?.data}
          pages={pages}
          availableLanguages={availableLanguages}
          visitorVariables={visitorVariables}
          onSave={this.updateEventTrigger}
        />
      );
    }

    if (
      tabResourceIndex !== undefined &&
      selectedTabIndex !== undefined &&
      selectedPage.resources[tabResourceIndex] !== undefined
    ) {
      const data = selectedPage.resources[tabResourceIndex].data;
      const parsed = parseStringToJsonObject<typeof data, TabStructure>(data);
      if (!parsed || !parsed.tabs) {
        return null;
      }

      const foundTab = parsed.tabs[selectedTabIndex];

      return <TabEditor accessToken={accessToken} selectedTab={foundTab} onSave={this.updateTab} />;
    }
  };

  /**
   * Updates event trigger
   *
   * @param eventTrigger event trigger
   */
  private updateEventTrigger = (eventTrigger: ExhibitionPageEventTrigger) => {
    this.setState(
      produce((draft: State) => {
        const { selectedTriggerIndex } = draft;
        if (
          selectedTriggerIndex === undefined ||
          !draft.selectedPage ||
          draft.selectedPage.eventTriggers.length < selectedTriggerIndex
        ) {
          return;
        }

        draft.selectedPage.eventTriggers[selectedTriggerIndex] = eventTrigger;
        draft.dataChanged = true;
      })
    );
  };

  /**
   * Get tab structure from resources
   */
  private getAndroidTabStructure = (contentContainerId?: string) => {
    const { tabResourceIndex, selectedPage } = this.state;

    if (tabResourceIndex !== undefined && selectedPage && selectedPage.resources.length > 0) {
      const data = selectedPage.resources[tabResourceIndex].data;

      const parsed = parseStringToJsonObject<typeof data, TabStructure>(data);
      return { contentContainerId: contentContainerId, ...parsed } as TabStructure;
    }
  };

  /**
   * Updates tab
   *
   * @param updatedTab updated tab
   */
  private updateTab = (updatedTab: ExhibitionPageTab) => {
    this.setState(
      produce((draft: State) => {
        const { tabResourceIndex, selectedTabIndex, selectedPage, selectedLayoutView, tabMap } =
          draft;
        if (
          tabResourceIndex === undefined ||
          selectedTabIndex === undefined ||
          !selectedLayoutView ||
          !tabMap ||
          !selectedPage
        ) {
          return;
        }

        const tabHolder = tabMap.get(selectedLayoutView.id);
        const tabData = this.getAndroidTabStructure(tabHolder?.tabComponent.contentContainerId);
        if (tabData?.tabs) {
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
  };

  /**
   * Event handler for page device change
   *
   * @param deviceId new device id
   */
  private onPageDeviceChange = (deviceId: string | undefined) => {
    const { selectedPage } = this.state;

    if (!selectedPage || !deviceId) {
      return;
    }

    this.setState({
      selectedPage: { ...selectedPage, deviceId: deviceId },
      dataChanged: true
    });
  };

  /**
   * Event handler for page name change
   *
   * @param name new page name
   */
  private onPageNameChange = (name: string | undefined) => {
    const { selectedPage } = this.state;
    if (!selectedPage || !name) {
      return;
    }

    this.setState({
      selectedPage: { ...selectedPage, name: name },
      dataChanged: true
    });
  };

  /**
   * Event handler for layout change
   *
   * @param layoutId new layout id
   */
  private onPageLayoutChange = (layoutId: string | undefined) => {
    const { selectedPage, layouts } = this.state;
    if (!selectedPage) {
      return;
    }

    const selectedLayout = layouts.find((layout) => layout.id === layoutId);
    if (!selectedLayout || !layoutId) {
      return;
    }

    if (selectedLayout.layoutType === LayoutType.Android) {
      const resourceHolder = ResourceUtils.getResourcesFromLayoutData(
        selectedLayout.data as PageLayoutView
      );

      this.setState(
        produce((draft: State) => {
          draft.selectedPage!.layoutId = layoutId;
          draft.selectedPage!.resources = resourceHolder.resources;
          draft.resourceWidgetIdList = resourceHolder.widgetIds;
          draft.dataChanged = true;
        })
      );
    } else {
      this.setState({
        selectedPage: {
          ...selectedPage,
          layoutId: layoutId,
          resources: HtmlResourceUtils.getDefaultResources(selectedLayout)
        },
        dataChanged: true
      });
    }
  };

  /**
   * Event handler for resource change
   *
   * @param updatedResource updated page resource
   */
  private onUpdateResource = (updatedResource: ExhibitionPageResource, component?: TreeObject) => {
    this.setState(
      produce((draft: State) => {
        if (!draft.selectedPage) {
          return;
        }

        const resourceIndex = draft.selectedPage.resources.findIndex(
          (resource) => resource.id === updatedResource.id
        );
        // At the moment layout components resource is background-image and in css format and it needs to be changed to url('') format
        const resource =
          component?.type === HtmlComponentType.LAYOUT
            ? {
                ...updatedResource,
                data: updatedResource.data ? `url('${updatedResource.data}')` : ""
              }
            : updatedResource;
        if (resourceIndex > -1) {
          draft.selectedPage.resources[resourceIndex] = resource;
          draft.selectedResource = updatedResource;
          draft.dataChanged = true;
        }
      })
    );
  };

  /**
   * Event handler for transition change
   *
   * @param transitions transition list to be updated
   * @param transitionType transition type to update
   */
  private onTransitionChange = (
    transitions: ExhibitionPageTransition[],
    transitionType: string
  ) => {
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
  };

  /**
   * Fetches component data
   */
  private fetchComponentData = async () => {
    const { accessToken, exhibitionId, roomId, contentVersionId } = this.props;

    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const exhibitionDevicesApi = Api.getExhibitionDevicesApi(accessToken);
    const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);
    const devicesApi = Api.getDevicesApi(accessToken);

    const [
      initialContentVersion,
      contentVersionsInRoom,
      contentVersion,
      layouts,
      visitorVariables,
      devices
    ] = await Promise.all([
      contentVersionsApi.findContentVersion({ exhibitionId, contentVersionId }),
      contentVersionsApi.listContentVersions({ exhibitionId, roomId }),
      contentVersionsApi.findContentVersion({ exhibitionId, contentVersionId }),
      layoutsApi.listPageLayouts({}),
      visitorVariablesApi.listVisitorVariables({ exhibitionId: exhibitionId }),
      devicesApi.listDevices({})
    ]);

    /**
     * Devices from device group
     */
    const deviceGroupId = contentVersion.deviceGroupId;
    const exhibitionDevices = await exhibitionDevicesApi.listExhibitionDevices({
      exhibitionId,
      exhibitionGroupId: deviceGroupId
    });

    /**
     * Content versions for different languages.
     * Identified by having the same name but different language than
     * initial content version selected before navigating to content editor.
     */
    const contentVersions: ContentVersion[] = [];
    contentVersionsInRoom.forEach((contentVersionInRoom) => {
      const sameName = contentVersionInRoom.name === initialContentVersion.name;
      const newLanguage = contentVersions.every(
        (version) => version.language !== contentVersionInRoom.language
      );
      if (sameName && newLanguage) {
        contentVersions.push(contentVersionInRoom);
      }
    });

    const devicePages = await Promise.all(
      exhibitionDevices.map((exhibitionDevice) =>
        exhibitionPagesApi.listExhibitionPages({
          exhibitionId,
          exhibitionDeviceId: exhibitionDevice.id,
          contentVersionId: contentVersion.id
        })
      )
    );

    const pages: ExhibitionPage[] = devicePages.flat();
    const selectedContentVersion = contentVersion;
    const selectedDevice = exhibitionDevices[0];
    const previewDevicesData = this.getPreviewDevicesData(
      selectedContentVersion,
      exhibitionDevices,
      pages
    );
    const selectedPage = pages.find(
      (page) =>
        page.deviceId === selectedDevice.id &&
        page.contentVersionId === selectedContentVersion.id &&
        page.orderNumber === 0
    );

    if (selectedPage) {
      this.updateResources(layouts, selectedPage);
    }

    this.setState({
      contentVersions,
      exhibitionDevices,
      previewDevicesData,
      pages,
      visitorVariables: visitorVariables,
      layouts,
      selectedContentVersion,
      selectedDevice,
      devices
    });
  };

  /**
   * Get preview devices data for given content version
   *
   * @param contentVersion content version
   * @param devices devices
   * @param pages pages
   * @returns preview devices
   */
  private getPreviewDevicesData = (
    contentVersion: ContentVersion,
    devices: ExhibitionDevice[],
    pages: ExhibitionPage[]
  ): PreviewDeviceData[] => {
    return devices.map((device): PreviewDeviceData => {
      const page = pages.find(
        (page) =>
          page.contentVersionId === contentVersion.id &&
          page.deviceId === device.id &&
          page.orderNumber === 0
      );

      return { device, page };
    });
  };

  /**
   * Gets languages from contentVersions
   *
   * @returns list of strings
   */
  private getAvailableLocales = () => {
    const { contentVersions } = this.state;
    const availableLocales: string[] = [];

    contentVersions.forEach((version) => {
      const language = version.language;

      if (!availableLocales.includes(language)) {
        availableLocales.push(language);
      }
    });

    return availableLocales;
  };

  /**
   * Gets select locale options from available locales
   *
   * @returns list of options
   */
  private getSelectLocaleOptions = () => {
    const availableLocales = this.getAvailableLocales();

    return availableLocales.map((locale) => ({
      value: locale,
      label: locale
    }));
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { selectedContentVersion, selectedDevice, selectedPage, view, dataChanged } = this.state;

    const actionButtons: ActionButton[] = [
      {
        name: strings.contentEditor.changeLocale,
        action: () => {},
        selectAction: this.onLocaleChange,
        options: this.getSelectLocaleOptions(),
        value: selectedContentVersion?.language as LanguageOptions,
        disabled: !!(this.getAvailableLocales().length === 1)
      },
      {
        name:
          view === "CODE"
            ? strings.exhibitionLayouts.editView.switchToVisualButton
            : strings.exhibitionLayouts.editView.switchToCodeButton,
        action: this.onSwitchViewClick
      }
    ];

    if (!selectedContentVersion && !this.idlePageEditorActive()) {
      actionButtons.push({
        name: strings.exhibition.addLanguageVersion,
        action: this.onAddContentVersionClick,
        disabled: this.getAvailableLanguages().length < 1
      });
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
      actionButtons.push(
        {
          name: strings.contentEditor.editor.savePage,
          action: this.onPageSave,
          disabled: !dataChanged
        },
        {
          name: strings.contentEditor.delete.deleteTitle,
          action: this.onDeletePageClick
        }
      );
    }
    return actionButtons;
  };

  /**
   * Updates the selected content version and associated data
   *
   * @param event select change event
   */
  private onLocaleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> =
    async ({ target }) => {
      const { accessToken, exhibitionId } = this.props;
      const { selectedDevice, exhibitionDevices: devices, layouts, contentVersions } = this.state;
      const { value } = target;

      const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);

      const selectedContentVersion = contentVersions.filter(
        (contentVersion) => contentVersion.language === value
      )[0];

      if (!selectedContentVersion || !selectedDevice) return;

      const devicePages = await Promise.all(
        devices.map((device) =>
          exhibitionPagesApi.listExhibitionPages({
            exhibitionId,
            exhibitionDeviceId: device.id,
            contentVersionId: selectedContentVersion.id
          })
        )
      );

      const pages: ExhibitionPage[] = devicePages.flat();
      const previewDevicesData = this.getPreviewDevicesData(selectedContentVersion, devices, pages);
      const selectedPage = pages.find(
        (page) =>
          page.deviceId === selectedDevice.id &&
          page.contentVersionId === selectedContentVersion.id &&
          page.orderNumber === 0
      );

      if (selectedPage) {
        this.updateResources(layouts, selectedPage);
      }

      this.setState({
        previewDevicesData,
        selectedContentVersion,
        pages
      });
    };

  /**
   * Adds new content version
   */
  private addContentVersion = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { newContentVersion, contentVersions } = this.state;

    if (!newContentVersion) {
      return;
    }

    try {
      const contentVersionsApi = Api.getContentVersionsApi(accessToken);
      const createdContentVersion = await contentVersionsApi.createContentVersion({
        exhibitionId: exhibitionId,
        contentVersion: newContentVersion
      });

      this.setState({
        contentVersions: [...contentVersions, createdContentVersion]
      });
    } catch (error) {
      console.error(`Could not add new language.\nError: ${error}`);
    }

    this.setState({
      addLanguageDialogOpen: false
    });
  };

  /**
   * Event handler for device change
   *
   * @param event event
   */
  private onDeviceDataChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => {
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
  };

  /**
   * Serializes exhibition page into JSON code
   *
   * @param page exhibition page
   * @returns exhibition page as JSON string
   */
  private toJsonCode = (page: Partial<ExhibitionPage>): string => {
    const { resources, eventTriggers } = page;
    return JSON.stringify({ resources, eventTriggers }, null, 2);
  };

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
  };

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
      result.eventTriggers = (parsedCode.eventTriggers || []).map(
        ExhibitionPageEventTriggerFromJSON
      );
      result.resources = (parsedCode.resources || []).map(ExhibitionPageResourceFromJSON);
    } catch (error: any) {
      this.setState({ error });
    }

    return result;
  };

  /**
   * Event handler for switch view button click
   */
  private onSwitchViewClick = () => {
    this.setState(
      produce((draft: State) => {
        draft.view = draft.view === "CODE" ? "VISUAL" : "CODE";
      })
    );
  };

  /**
   * Event handler for device click
   *
   * @param selectedContentVersion selected content version
   * @param selectedDevice selected device
   */
  private onDeviceClick =
    (selectedDevice: ExhibitionDevice, selectedContentVersion?: ContentVersion) => () => {
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
    };

  /**
   * Event handler for page click
   * @param selectedPage selected page
   * @param selectedContentVersion possible selected content version
   */
  private onPageClick =
    (selectedPage: ExhibitionPage, selectedContentVersion?: ContentVersion) => () => {
      const {
        exhibitionDevices: devices,
        previewDevicesData,
        timelineTabIndex,
        contentVersions
      } = this.state;
      const isIdlePage = timelineTabIndex === 0;
      const selectedDevice = devices.find((device) => device.id === selectedPage.deviceId);
      const previewDeviceIndex = previewDevicesData.findIndex(
        (previewData) => previewData.device.id === selectedDevice?.id
      );
      if (previewDeviceIndex > -1) {
        this.setState(
          produce((draft: State) => {
            draft.previewDevicesData[previewDeviceIndex].page = selectedPage;
          })
        );
      }

      this.setState({
        selectedContentVersion: isIdlePage ? contentVersions[0] : selectedContentVersion,
        selectedDevice,
        selectedPage,
        selectedResource: undefined,
        selectedTriggerIndex: undefined,
        tabResourceIndex: undefined,
        selectedTabIndex: undefined
      });
    };

  /**
   * Event handler for layout view click
   *
   * @param view page layout view
   */
  private onLayoutViewClick = (
    device: ExhibitionDevice,
    page: ExhibitionPage,
    view: PageLayoutView
  ) => {
    this.setState({
      selectedDevice: device,
      selectedPage: page,
      selectedLayoutView: view,
      propertiesExpanded: true
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

        const newTabHolder = { ...tabToUpdate, activeTabIndex: newIndex };
        draft.tabMap.set(viewId, newTabHolder);
      })
    );
  };

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
  private getCorrespondingSelectedPage = (
    contentVersion: ContentVersion
  ): ExhibitionPage | undefined => {
    const { selectedDevice, selectedPage, pages } = this.state;
    return pages.find(
      (page) =>
        page.contentVersionId === contentVersion.id &&
        page.deviceId === selectedDevice?.id &&
        page.orderNumber === selectedPage?.orderNumber
    );
  };

  /**
   * Event handler for page drag end
   *
   * @param device device
   * @param contentVersionId possible content version id
   * @param result drop result
   */
  private onPageDragEnd =
    (device: ExhibitionDevice, contentVersionId?: string) => (result: DropResult) => {
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
    };

  /**
   * Updates page order numbers
   *
   * @param newIndex new index
   * @param movedPageId moved pages uuid
   * @param device device where page belongs to
   * @param contentVersionId possible id of content version where page belongs to
   */
  private updateOrderNumbers = (
    newIndex: number,
    movedPageId: string,
    device: ExhibitionDevice,
    contentVersionId?: string
  ) => {
    const { pages } = this.state;

    const movedPage = pages.find((page) => page.id === movedPageId);
    if (!movedPage) {
      return;
    }

    const devicePages = this.getDevicePages(pages, device, contentVersionId);
    const updatedPages = this.getUpdatedDevicePagesOrder(devicePages, movedPageId, newIndex);

    this.doPageOrderUpdate(updatedPages);
  };

  /**
   * Filters device pages from all pages and sorts them by order number
   *
   * @param pages pages
   * @param device device
   * @param contentVersionId possible content version ID
   * @returns filtered and sorted device pages
   */
  private getDevicePages = (
    pages: ExhibitionPage[],
    device: ExhibitionDevice,
    contentVersionId?: string
  ) => {
    return pages
      .filter(
        (page) =>
          page.deviceId === device.id &&
          (page.contentVersionId === contentVersionId || page.id === device.idlePageId)
      )
      .sort((a, b) => a.orderNumber - b.orderNumber);
  };

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
    const pageIndex = devicePages.findIndex((page) => page.id === movedPageId);
    if (pageIndex > -1) {
      const [page] = devicePages.splice(pageIndex, 1);
      if (newIndex !== undefined) {
        devicePages.splice(newIndex, 0, page);
      }
    }

    return devicePages.map((devicePage, index) => ({
      ...devicePage,
      orderNumber: index
    }));
  };

  /**
   * Do page order update to API and state
   *
   * @param pagesToUpdate list of pages that needs to be updated
   */
  private doPageOrderUpdate = async (pagesToUpdate: ExhibitionPage[]) => {
    const { accessToken, exhibitionId } = this.props;
    const originalPages = [...this.state.pages];

    this.setState({
      loading: true
    });

    this.setState(
      produce((draft: State) => {
        pagesToUpdate.forEach((pageToUpdate) => {
          const pageIndex = draft.pages.findIndex((page) => page.id === pageToUpdate.id);
          if (pageIndex > -1) {
            draft.pages[pageIndex] = pageToUpdate;
          }

          const previewDeviceIndex = draft.previewDevicesData.findIndex(
            (data) => data.page?.id === pageToUpdate.id
          );
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

      const originalPage = originalPages.find((page) => page.id === pageToUpdate.id);
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
  };

  /**
   * Returns page layout view for given page or null if not found
   *
   * @returns page layout view or null
   */
  private getPageLayout = (page: ExhibitionPage | undefined) => {
    const { layouts } = this.state;
    if (!page) {
      return null;
    }

    return layouts.find((layout) => layout.id === page.layoutId) || null;
  };

  /**
   * Update page resources and id mappings
   *
   * @param layouts list of layouts
   * @param selectedPage selected page
   */
  private updateResources = (layouts: PageLayout[], selectedPage: ExhibitionPage) => {
    const pageLayout = layouts.find((layout) => layout.id === selectedPage.layoutId);
    if (!pageLayout) {
      return;
    }

    if (pageLayout.layoutType === LayoutType.Html && pageLayout.defaultResources) {
      const updatedResources: ExhibitionPageResource[] = selectedPage.resources.filter((resource) =>
        pageLayout.defaultResources?.some((defaultResource) => defaultResource.id === resource.id)
      );

      for (const defaultResource of pageLayout.defaultResources) {
        const foundResource = selectedPage.resources.find((res) => res.id === defaultResource.id);
        if (!foundResource) {
          updatedResources.push(defaultResource);
        }
      }
      const updatedSelectedPage = {
        ...selectedPage,
        resources: updatedResources
      };

      this.setState((prevState) => ({
        selectedPage: updatedSelectedPage,
        pages: prevState.pages.map((page) =>
          page.id === selectedPage.id ? updatedSelectedPage : page
        )
      }));

      return null;
    } else {
      const layoutData = pageLayout.data as PageLayoutView;

      this.setState(
        produce((draft: State) => {
          const resourceHolder = ResourceUtils.getResourcesFromLayoutData(layoutData);

          draft.selectedPage = selectedPage;
          draft.selectedLayoutView = undefined;

          resourceHolder.resources
            .filter(
              (layoutResource) =>
                !selectedPage.resources.find(
                  (pageResource) => pageResource.id === layoutResource.id
                )
            )
            .forEach((missingLayoutResource) => {
              selectedPage.resources.push(missingLayoutResource);
            });

          const tempTriggers = [
            ...draft.selectedPage.eventTriggers
          ] as ExhibitionPageEventTrigger[];
          tempTriggers.forEach((trigger) => {
            if (!trigger.id) {
              trigger.id = uuid();
            }
            if (!trigger.name) {
              trigger.name = "Name";
            }
          });

          draft.selectedPage.resources.forEach((resource, index) => {
            const resourceWidgetType = resourceHolder.resourceToWidgetType.get(resource.id);
            if (
              resourceWidgetType &&
              resourceWidgetType === PageLayoutWidgetType.MaterialTabLayout
            ) {
              draft.tabResourceIndex = index;
              return;
            }
          });

          resourceHolder.tabPropertyIdToTabResourceId.forEach((value, key) => {
            const tabIndex = draft.selectedPage?.resources.findIndex(
              (resource) => resource.id === value.tabResourceId
            );
            if (tabIndex !== undefined && tabIndex > -1 && draft.selectedPage) {
              const tabComponent = ResourceUtils.getResourcesForTabComponent(
                draft.selectedPage.resources,
                tabIndex,
                value.tabContentContainerId
              );
              draft.tabMap.set(key, {
                activeTabIndex: 0,
                tabComponent: tabComponent
              });
            }
          });

          draft.selectedPage.eventTriggers = tempTriggers;
          draft.resourceWidgetIdList = resourceHolder.widgetIds;
        })
      );
    }
  };

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
          const deviceIndex = draft.exhibitionDevices.findIndex(
            (device) => device.id === selectedDevice.id
          );
          if (deviceIndex > -1) {
            draft.exhibitionDevices[deviceIndex] = updatedDevice;
          }
          draft.dataChanged = false;
        })
      );
    } catch (e: any) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  };

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
  };

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
  };

  /**
   * Event handler for add page click
   */
  private onAddPageClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const {
      layouts,
      selectedContentVersion,
      selectedDevice,
      exhibitionDevices: devices,
      pages,
      timelineTabIndex
    } = this.state;

    if (!selectedDevice) {
      return;
    }

    const htmlLayouts = layouts.filter((layout) => layout.layoutType === LayoutType.Html);
    const isIdlePage = timelineTabIndex === 0;
    const defaultLayout = htmlLayouts[0];
    const deviceId = selectedDevice.id;

    if (!defaultLayout || !deviceId || !selectedContentVersion || !selectedContentVersion.id) {
      return;
    }

    const filteredPages = pages.filter(
      (page) => page.deviceId === deviceId && page.contentVersionId === selectedContentVersion.id
    );

    const newPage: ExhibitionPage = {
      layoutId: defaultLayout.id!!,
      deviceId: deviceId,
      contentVersionId: selectedContentVersion.id,
      name: strings.exhibition.newPage,
      eventTriggers: [],
      resources: HtmlResourceUtils.getDefaultResources(defaultLayout),
      orderNumber: isIdlePage ? 0 : filteredPages.length,
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
      const deviceIndex = devices.findIndex((device) => device.id === selectedDevice.id);

      if (deviceIndex < 0) {
        return;
      }

      const updatedDevice = await exhibitionDevicesApi.updateExhibitionDevice({
        exhibitionId: exhibitionId,
        deviceId: selectedDevice.id,
        exhibitionDevice: {
          ...selectedDevice,
          idlePageId: createdPage.id
        }
      });

      this.setState(
        produce((draft: State) => {
          draft.exhibitionDevices[deviceIndex] = updatedDevice;
        })
      );
    }
  };

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

      const newPages = produce(pages, (draft) => {
        const pageIndex = draft.findIndex((page) => page.id === updatedPage.id);
        if (pageIndex > -1) {
          draft[pageIndex] = updatedPage;
        }
      });

      this.setState({
        pages: newPages,
        dataChanged: false
      });
    } catch (e: any) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  };

  /**
   * Event handler for page delete
   */
  private onDeletePageClick = async () => {
    try {
      const { accessToken, exhibitionId } = this.props;
      const { selectedPage, selectedContentVersion, selectedDevice, pages, timelineTabIndex } =
        this.state;

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
          }
        });
      }

      const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);
      await exhibitionPagesApi.deleteExhibitionPage({ exhibitionId, pageId: selectedPage.id });

      if (isIdlePage) {
        this.setState({ pages: pages.filter((page) => page.id !== selectedPage.id) });
      } else {
        const devicePages = this.getDevicePages(pages, selectedDevice, selectedContentVersion.id);
        const updatedDevicePages = this.getUpdatedDevicePagesOrder(devicePages, selectedPage.id);
        const updatedPages = pages
          .filter((page) => page.id !== selectedPage.id)
          .map(
            (page) => updatedDevicePages.find((devicePage) => devicePage.id === page.id) ?? page
          );

        this.setState({ pages: updatedPages });
      }

      this.setState({
        selectedPage: undefined,
        selectedTriggerIndex: undefined
      });
    } catch (e: any) {
      console.error(e);
      this.setState({ error: e });
    }
  };

  /**
   * On properties panel close
   */
  private onPropertiesClose = () => {
    this.setState({
      selectedResource: undefined,
      selectedTabIndex: undefined,
      selectedTriggerIndex: undefined
    });
  };

  /**
   * Event handler for close or cancel click in dialog
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addLanguageDialogOpen: false,
      deleteDialogOpen: false
    });
  };

  /**
   * Returns available languages based on languages used in content versions
   */
  private getAvailableLanguages = () => {
    return Object.values(LanguageOptions).filter((option) =>
      this.state.contentVersions.every((contentVersion) => contentVersion.language !== option)
    );
  };

  /**
   * Checks if selected page has changed
   *
   * @param previousPage previous selected page
   * @param currentPage current selected page
   * @returns true if selected page has changed, otherwise false
   */
  private isPageChanged = (
    previousPage?: ExhibitionPage,
    currentPage?: ExhibitionPage
  ): boolean => {
    return previousPage?.id !== currentPage?.id;
  };

  /**
   * Checks if page layout has changed
   *
   * @param previousPage previous selected page
   * @param currentPage current selected page
   * @returns true if layout has changed, otherwise false
   */
  private isLayoutChanged = (previousPage?: ExhibitionPage, currentPage?: ExhibitionPage) => {
    return previousPage?.layoutId !== currentPage?.layoutId;
  };

  /**
   * Returns whether idle page editor is active or not
   */
  private idlePageEditorActive = (): boolean => {
    return this.state.selectedTabIndex === 0;
  };

  /**
   * Event handler for new event trigger
   *
   * @param page page
   * @param newTrigger new event trigger
   */
  private onAddEventTrigger = (page: ExhibitionPage, newTrigger: ExhibitionPageEventTrigger) => {
    this.setState(
      produce((draft: State) => {
        draft.selectedPage = page;
        draft.selectedPage.eventTriggers.push(newTrigger);
        draft.selectedTriggerIndex = draft.selectedPage.eventTriggers.length - 1;
      })
    );
  };

  /**
   * Event handler for delete event trigger
   *
   * @param page page
   * @param triggerIndex trigger index to be deleted
   */
  private onDeleteEventTrigger = (page: ExhibitionPage, triggerIndex: number) => {
    this.setState(
      produce((draft: State) => {
        draft.selectedPage = page;
        draft.selectedPage.eventTriggers.splice(triggerIndex, 1);
        draft.selectedTriggerIndex = undefined;
      })
    );
  };

  /**
   * Event handler for Android view table delete
   *
   * @param page page
   * @param tabIndex tab index
   * @param tabResourceIndex tab resource index
   * @param selectedLayoutView selected layout view
   */
  private onDeleteAndroidTab = (
    page: ExhibitionPage,
    tabIndex: number,
    tabResourceIndex: number,
    selectedLayoutView: PageLayoutView
  ) => {
    const { tabMap } = this.state;

    this.setState(
      produce((draft: State) => {
        draft.selectedPage = page;

        const tabData = this.getAndroidTabStructure();

        if (tabData?.tabs) {
          const tabHolder = tabMap.get(selectedLayoutView.id);

          if (tabHolder) {
            const updateTabHolder = produce(tabHolder, (draft) => {
              draft.tabComponent.tabs.splice(tabIndex, 1);
            });

            draft.tabMap.set(selectedLayoutView.id, updateTabHolder);
            draft.selectedPage.resources[tabResourceIndex].data = JSON.stringify(
              updateTabHolder.tabComponent
            );
          }
        }
        draft.selectedTabIndex = undefined;
      })
    );
  };

  /**
   * Event handler for Android view tab add
   *
   * @param newTab new tab
   * @param layoutView layout view
   * @param page page
   * @param tabResourceIndex tab resource index
   */
  private onAddAndroidTab = (
    newTab: ExhibitionPageTab,
    layoutView: PageLayoutView,
    page: ExhibitionPage,
    tabResourceIndex: number
  ) => {
    const { tabMap } = this.state;

    const currentTabStructure = this.getAndroidTabStructure();
    if (!currentTabStructure) {
      return;
    }

    const newTabStructure = produce(currentTabStructure, (draft) => {
      if (!draft.tabs) {
        draft.tabs = [];
      }
      draft.tabs.push(newTab);
      if (!draft.contentContainerId && layoutView) {
        draft.contentContainerId = tabMap.get(layoutView.id)?.tabComponent.contentContainerId;
      }
    });

    this.setState(
      produce((draft: State) => {
        draft.selectedPage = page;
        draft.selectedPage.resources[tabResourceIndex].data = JSON.stringify(newTabStructure);
      })
    );
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
    exhibition: state.exhibitions.selectedExhibition as Exhibition,
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

export default withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(ContentEditorScreen)
);
