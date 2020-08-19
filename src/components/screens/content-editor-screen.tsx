import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/content-editor-screen";
import { WithStyles, withStyles, CircularProgress, Divider, Accordion, AccordionSummary, Typography, AccordionDetails } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken, ActionButton } from '../../types';
import BasicLayout from "../layouts/basic-layout";
import Api from "../../api/api";
import { GroupContentVersion, ExhibitionDevice, ExhibitionPage, Exhibition, ExhibitionPageEventTriggerFromJSON, ExhibitionPageResourceFromJSON, DeviceModel, PageLayout, PageLayoutView, PageLayoutWidgetType, ExhibitionPageResource, ExhibitionPageTransition } from "../../generated/client";
import EditorView from "../editor/editor-view";
import ElementTimelinePane from "../layouts/element-timeline-pane";
import ElementContentsPane from "../layouts/element-contents-pane";
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
  resourceWidgetIdList?: Map<string, string>;
}

/**
 * Component for content editor screen
 */
class ContentEditorScreen extends React.Component<Props, State> {

  /**
   * All widget types that can have editable resources
   */
  private allowedWidgetTypes = [
    PageLayoutWidgetType.Button,
    PageLayoutWidgetType.FlowTextView,
    PageLayoutWidgetType.ImageView,
    PageLayoutWidgetType.MediaView,
    PageLayoutWidgetType.PlayerView,
    PageLayoutWidgetType.TextView
  ];

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
    const { groupContentVersion, devices } = this.state;
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
            { this.renderContentAccordion() }
            { this.renderTransitionAccordion() }
            { this.renderEventTriggerAccordion() }
          </ElementContentsPane>

        </div>
      </BasicLayout>
    );
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
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
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
    const { allowedWidgetTypes } = this;
    const { selectedPage, resourceWidgetIdList } = this.state;
    if (!selectedPage || !resourceWidgetIdList) {
      return;
    }

    pageLayoutViews.forEach(pageLayoutView => {
      if (allowedWidgetTypes.includes(pageLayoutView.widget)) {
        const id = resourceWidgetIdList.get(pageLayoutView.id);
        const resourceIndex = selectedPage.resources.findIndex(resource => resource.id === id);

        if (resourceIndex < 0) {
          return;
        }

        elementList.push(this.renderResourcesEditor(selectedPage, pageLayoutView, resourceIndex));
      }

      if (pageLayoutView.children.length > 0) {
        this.constructSingleElement(elementList, pageLayoutView.children);
      }
    });

    return elementList;
  }

  /**
   * Render individual resource editors inside accordion element
   *
   * @param selectedPage selected page
   * @param pageLayoutView page layout view
   * @param resourceIndex resource index
   */
  private renderResourcesEditor = (selectedPage: ExhibitionPage, pageLayoutView: PageLayoutView, resourceIndex: number) => {
    const resource = selectedPage.resources[resourceIndex];

    return (
      <Accordion key={ resourceIndex }>
        <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
          <Typography style={{ marginLeft: theme.spacing(1) }} variant="h5">
            { pageLayoutView.name || "" }
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <ResourceEditor
            resource={ resource }
            resourceIndex={ resourceIndex }
            onUpdate={ this.onUpdateResource }
          />
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
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </AccordionDetails>
      </Accordion>
    );
  }

  /**
   * Render event trigger accordion
   */
  private renderEventTriggerAccordion = () => {
    const { pageLayout } = this.state;

    if (!pageLayout) {
      return null;
    }

    return(
      <Accordion>
        <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
          <Typography variant="h3">{ strings.contentEditor.editor.eventTriggers.title }</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {/* TODO: Move & modify event trigger editor to new layout */}
          {/* <EventTriggerEditor
            pages={ pages }
            layout={ pageLayout }
            pageData={ selectedPage }
            onChange={ this.onPageDataChange }
            onLayoutChange={ this.onLayoutChange }
          /> */}
          <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
        </AccordionDetails>
      </Accordion>
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
      produce((draft: State) => {
        draft.selectedPage!.exitTransitions = transitions;
      });
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

    const pages: ExhibitionPage[] = devicePages.flat();
    const selectedDevice = devices[0];

    const selectedPage = pages.find(page => page.deviceId === selectedDevice.id);

    if (selectedPage) {
      this.updateResources(layouts, selectedPage);
    }

    this.setState({
      groupContentVersion,
      devices,
      pages,
      layouts,
      selectedDevice,
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
          selectedPage={ selectedPage }
          onClick={ this.onPageClick }
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
  private getActionButtons = () => {
    return [
      {
        name: this.state.view === "CODE" ?
        strings.exhibitionLayouts.editView.switchToVisualButton :
        strings.exhibitionLayouts.editView.switchToCodeButton,
        action: this.onSwitchViewClick
      }, {
        name: strings.generic.save,
        action: this.onPageSave
      }
    ] as ActionButton[];
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
      selectedPage
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
        
        if (draft.selectedPage.resources.length < 1) {
          draft.selectedPage.resources = resourceHolder.resources;
        }
        
        draft.resourceWidgetIdList = resourceHolder.widgetIds;
        draft.pageLayout = pageLayout;
      })
    )
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
