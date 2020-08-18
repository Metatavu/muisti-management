import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedExhibition } from "../../actions/exhibitions";

import { History } from "history";
import styles from "../../styles/content-editor-screen";
import { WithStyles, withStyles, CircularProgress, Accordion, AccordionSummary, Typography, AccordionDetails, Button, TableContainer, Table, TableHead, TableRow, TableCell, TableSortLabel, TableBody, TextField } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { AccessToken, ActionButton } from '../../types';
import BasicLayout from "../layouts/basic-layout";
import Api from "../../api/api";
import { ContentVersion, ExhibitionRoom, GroupContentVersion, ExhibitionDevice, ExhibitionPage, Exhibition, ExhibitionPageEventTriggerFromJSON, ExhibitionPageResourceFromJSON, DeviceModel, PageLayout, PageLayoutView, PageLayoutWidgetType } from "../../generated/client";
import EditorView from "../editor/editor-view";
import ElementTimelinePane from "../layouts/element-timeline-pane";
import ElementSettingsPane from "../layouts/element-settings-pane";
import ElementContentsPane from "../layouts/element-contents-pane";
import ElementPropertiesPane from "../layouts/element-properties-pane";
import PagePreview from "../preview/page-preview";
import produce from "immer";
import CodeEditor from "../editor/code-editor";
import AndroidUtils from "../../utils/android-utils";
import PanZoom from "../generic/pan-zoom";
import strings from "../../localization/strings";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FolderClosedIcon from "@material-ui/icons/FolderOutlined";
import FolderOpenIcon from "@material-ui/icons/FolderOpenOutlined";
import theme from "../../styles/theme";
import ResourceUtils from "../../utils/resource-utils";
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
  layouts: PageLayout[];
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  room?: ExhibitionRoom;
  contentVersion?: ContentVersion;
  groupContentVersion?: GroupContentVersion;
  devices: ExhibitionDevice[];
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

          {/* <ElementSettingsPane
            width={ 380 }
            title={ "" }
            open={ false }
          >

          </ElementSettingsPane> */}

          <ElementContentsPane
            title={ strings.contentEditor.editor.content }
          >
            { this.renderContentAccordion() }
          </ElementContentsPane>

          <ElementPropertiesPane>
            <h1>{ strings.contentEditor.editor.properties }</h1>
          </ElementPropertiesPane>
        </div>
      </BasicLayout>
    );
  }

  private renderContentAccordion = () => {

    const pageElements = this.constructPageElements();

    return(
      <Accordion>
        <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
          <Typography variant="h3">{ strings.contentEditor.editor.properties }</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography style={{ marginLeft: theme.spacing(1) }} variant="h5">{ strings.contentEditor.editor.pageName }</Typography>
        </AccordionDetails>
          { pageElements }
      </Accordion>
    );
  }

  /**
   * Construct page elements
   */
  private constructPageElements = () => {
    const { classes } = this.props;
    const { selectedPage, pageLayout, selectedDevice } = this.state;

    if (!selectedPage || !pageLayout) {
      return null;
    }

    const folderOpen = true;
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
      if (
        pageLayoutView.widget === PageLayoutWidgetType.TextView ||
        pageLayoutView.widget === PageLayoutWidgetType.Button ||
        pageLayoutView.widget === PageLayoutWidgetType.FlowTextView ||
        pageLayoutView.widget === PageLayoutWidgetType.ImageView ||
        pageLayoutView.widget === PageLayoutWidgetType.MediaView
      ) {
        const id = resourceWidgetIdList.get(pageLayoutView.id);
        const resourceIndex = selectedPage.resources.findIndex(resource => resource.id === id);

        if (resourceIndex < 0) {
          return;
        }

        elementList.push(
          <Accordion>
            <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
              <Typography style={{ marginLeft: theme.spacing(1) }} variant="h5">{ pageLayoutView.name || "" }</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                value={ selectedPage.resources[resourceIndex].data || "" }
              />
            </AccordionDetails>
          </Accordion>
        );
      }

      if (pageLayoutView.children.length > 0) {
        this.constructSingleElement(elementList, pageLayoutView.children);
      }
    });

    return elementList;
  }

  private onElementClick = (resourceId?: string) => () => {
    console.log(resourceId);
  }

  /**
   * Fetches component data
   */
  private fetchComponentData = async () => {
    const { accessToken, exhibitionId, roomId, contentVersionId, groupContentVersionId, layouts } = this.props;

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

    const selectedDevice = devices.find(device => device.id === pages[0].deviceId);
    const selectedPage = pages[0];
    console.log(pages);
    const pageLayout = layouts.find(layout => layout.id === selectedPage.layoutId);

    if (!pageLayout) {
      return;
    }

    if (selectedPage.resources.length < 1) {
      const custom = ResourceUtils.getResourcesFromLayoutData(pageLayout.data);
      selectedPage.resources = custom.resources;
    }

    const widgetIds = ResourceUtils.getResourceIdsFromLayoutData(pageLayout.data).widgetIds;

    this.setState({
      room,
      contentVersion,
      groupContentVersion,
      devices,
      pages,
      selectedPage,
      selectedDevice,
      pageLayout,
      resourceWidgetIdList: widgetIds
    });

  }

  /**
   * Renders element timeline
   */
  private renderTimeline = () => { // To do
    return null;
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
    return [{
      name: this.state.view === "CODE" ?
        strings.exhibitionLayouts.editView.switchToVisualButton :
        strings.exhibitionLayouts.editView.switchToCodeButton,
      action: this.onSwitchViewClick
    }] as ActionButton[];
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
    layouts: state.layouts.layouts,
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
