import {
  ExhibitionDevice,
  ExhibitionPage,
  ExhibitionPageEventTrigger,
  ExhibitionPageResource,
  LayoutType,
  PageLayout,
  PageLayoutView,
  PageLayoutViewHtml,
  PageLayoutWidgetType
} from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/content-editor-screen";
import theme from "../../styles/theme";
import { TreeObject } from "../../types";
import HtmlResourceUtils from "../../utils/html-resource-utils";
import LocalizationUtils from "../../utils/localization-utils";
import { constructTree } from "../layout/utils/tree-html-data-utils";
import CommonSettingsEditor from "./common-settings-editor";
import {
  ExhibitionPageTab,
  ExhibitionPageTabHolder,
  ExhibitionPageTabProperty,
  TabStructure,
  allowedWidgetTypes
} from "./constants";
import LayoutViewResourcesList from "./layout-view-resources-list";
import { default as ExpandMoreIcon } from "@mui/icons-material/ChevronRight";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  Tooltip,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { v4 as uuid } from "uuid";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  expanded: boolean;
  selectedPageLayout: PageLayout;
  devices: ExhibitionDevice[];
  layouts: PageLayout[];
  selectedPage: ExhibitionPage;
  resourceWidgetIdList?: Map<string, string[]>;
  selectedTabIndex?: number;
  tabResourceIndex?: number;
  selectedTriggerIndex?: number;
  selectedResource?: ExhibitionPageResource;
  selectedLayoutView?: PageLayoutView;
  tabMap: Map<string, ExhibitionPageTabHolder>;
  androidTabStructure?: TabStructure;
  onExpandedChange: (expanded: boolean) => void;
  onPageDeviceChange: (deviceId: string) => void;
  onPageLayoutChange: (layoutId: string) => void;
  onPageNameChange: (text: string) => void;
  setSelectResource: (resource: ExhibitionPageResource | undefined) => void;
  setSelectedTriggerIndex: (index: number | undefined) => void;
  setSelectedTabIndex: (index: number | undefined) => void;
  setSelectedLayoutView: (view: PageLayoutView | undefined) => void;
  onAddEventTrigger: (page: ExhibitionPage, newTrigger: ExhibitionPageEventTrigger) => void;
  onDeleteEventTrigger: (page: ExhibitionPage, triggerIndex: number) => void;
  onDeleteAndroidTab: (
    page: ExhibitionPage,
    tabIndex: number,
    tabResourceIndex: number,
    selectedLayoutView: PageLayoutView
  ) => void;
  onAddAndroidTab: (
    newTab: ExhibitionPageTab,
    layoutView: PageLayoutView,
    page: ExhibitionPage,
    tabResourceIndex: number
  ) => void;
}

/**
 * Component for content editor content accordion
 */
const ContentEditorContentAccordion: React.FC<Props> = ({
  expanded,
  selectedPageLayout,
  devices,
  layouts,
  selectedPage,
  resourceWidgetIdList,
  selectedTabIndex,
  tabResourceIndex,
  selectedResource,
  selectedLayoutView,
  classes,
  tabMap,
  androidTabStructure,
  onExpandedChange,
  onPageDeviceChange,
  onPageLayoutChange,
  onPageNameChange,
  setSelectResource,
  setSelectedTriggerIndex,
  setSelectedTabIndex,
  setSelectedLayoutView,
  onAddEventTrigger,
  onDeleteEventTrigger,
  onDeleteAndroidTab,
  onAddAndroidTab
}) => {
  /**
   * Event handler for trigger click
   *
   * @param triggerIndex trigger index within selected pages triggers
   */
  const onTriggerClick = (triggerIndex: number) => () => {
    setSelectedTabIndex(undefined);
    setSelectResource(undefined);
    setSelectedTriggerIndex(triggerIndex);
  };

  /**
   * Event handler for add event trigger
   *
   * @param pageLayoutViewId page layout view id
   * @param event react mouse event
   */
  const onAddEventTriggerClick =
    (pageLayoutViewId: string) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (!selectedPage) {
        return;
      }

      event.stopPropagation();

      const newTrigger: ExhibitionPageEventTrigger = {
        clickViewId: pageLayoutViewId,
        id: uuid(),
        name: "New trigger"
      };

      onAddEventTrigger(selectedPage, newTrigger);
    };

  /**
   * Event handler for delete trigger click
   *
   * @param triggerIndex trigger index within selected pages triggers
   */
  const onDeleteTriggerClick = (triggerIndex: number) => () => {
    if (!selectedPage) {
      return;
    }

    onDeleteEventTrigger(selectedPage, triggerIndex);
  };

  /**
   * Event handler for resource click
   *
   * @param resource resource
   */
  const onResourceClick = (resource: ExhibitionPageResource) => () => {
    setSelectResource(resource);
    setSelectedTriggerIndex(undefined);
    setSelectedTabIndex(undefined);
  };

  /**
   * Get Android layout element resources
   *
   * @param idList list of element id
   * @param selectedPage selected page
   */
  const getAndroidResources = (idList: string[], selectedPage: ExhibitionPage) => {
    const resources = idList.reduce((filtered: ExhibitionPageResource[], elementId: string) => {
      const resourceIndex = selectedPage.resources.findIndex(
        (resource) => resource.id === elementId
      );

      if (resourceIndex > -1) {
        filtered.push(selectedPage.resources[resourceIndex]);
      }

      return filtered;
    }, []);

    return resources;
  };

  /**
   * Event handler for Android layout tab resource click
   *
   * @param tabIndex clicked tab index
   */
  const onAndroidTabClick = (tabIndex: number) => () => {
    setSelectResource(undefined);
    setSelectedTriggerIndex(undefined);
    setSelectedTabIndex(tabIndex);
  };

  /**
   * Event handler for Android layout delete tab click
   *
   * @param tabIndex tab index to be deleted
   */
  const onDeleteAndroidTabClick =
    (tabIndex: number) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();

      if (tabResourceIndex === undefined || !selectedLayoutView || !tabMap || !selectedPage) {
        return;
      }

      onDeleteAndroidTab(selectedPage, tabIndex, tabResourceIndex, selectedLayoutView);
    };

  /**
   * Render Android layout tab list
   */
  const renderAndroidTabList = () => {
    if (!androidTabStructure || !androidTabStructure.tabs) {
      return null;
    }

    const tabs = androidTabStructure.tabs;

    const tabItems = tabs.map((tab, tabIndex) => {
      return (
        <ListItem
          className={classes.borderedListItem}
          key={tabIndex}
          button
          onClick={onAndroidTabClick(tabIndex)}
          selected={selectedTabIndex === tabIndex}
        >
          <Typography style={{ marginLeft: theme.spacing(1) }} variant="h6">
            {tab.label}
          </Typography>
          <ListItemSecondaryAction>
            <Button size="small" aria-label="delete" onClick={onDeleteAndroidTabClick(tabIndex)}>
              {strings.generic.delete}
            </Button>
          </ListItemSecondaryAction>
          <ExpandMoreIcon htmlColor="#888" />
        </ListItem>
      );
    });

    return (
      <List disablePadding style={{ marginBottom: theme.spacing(1) }}>
        {tabItems}
      </List>
    );
  };

  /**
   * Get Android layout event trigger items
   *
   * @param selectedPage selected page
   * @param pageLayoutView page layout view
   */
  const getAndroidEventTriggerItems = (
    selectedPage: ExhibitionPage,
    pageLayoutView: PageLayoutView
  ) => {
    const triggerList = selectedPage.eventTriggers.filter(
      (trigger) => trigger.clickViewId === pageLayoutView.id
    );

    if (triggerList.length < 1) {
      return;
    }

    return triggerList.map((trigger, index) => {
      const pageEventTriggerIndex = selectedPage.eventTriggers.findIndex(
        (pageTrigger) => pageTrigger.id === trigger.id
      );

      return (
        <List key={trigger.id} disablePadding style={{ marginBottom: theme.spacing(1) }}>
          <ListItem
            className={classes.borderedListItem}
            key={index}
            button
            onClick={onTriggerClick(pageEventTriggerIndex)}
          >
            <Typography style={{ marginLeft: theme.spacing(1) }} variant="h6">
              {trigger.name}
            </Typography>
            <ListItemSecondaryAction className={classes.borderedListItemSecondaryAction}>
              <Button
                variant="text"
                size="small"
                aria-label="delete"
                onClick={onDeleteTriggerClick(pageEventTriggerIndex)}
              >
                {strings.generic.delete}
              </Button>
              <ChevronRightIcon htmlColor="#888" />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      );
    });
  };

  /**
   * Event Android layout handler for expand element
   *
   * @param view page layout view
   * @param event React change event
   * @param expanded is element expanded
   */
  const onExpandAndroidElement =
    (view: PageLayoutView) => (_event: React.ChangeEvent<{}>, expanded: boolean) => {
      setSelectedLayoutView(expanded ? view : undefined);
    };

  /**
   * Render individual resources inside accordion element for Android layout
   *
   * @param selectedPage selected page
   * @param pageLayoutView page layout view
   * @param idList list resource ids
   */
  const renderAndroidResources = (
    selectedPage: ExhibitionPage,
    pageLayoutView: PageLayoutView,
    idList: string[]
  ) => {
    const resources = getAndroidResources(idList, selectedPage);
    const eventTriggerItems = getAndroidEventTriggerItems(selectedPage, pageLayoutView);

    return (
      <Accordion
        key={pageLayoutView.id}
        className={classes.resource}
        expanded={selectedLayoutView?.id === pageLayoutView.id}
        onChange={onExpandAndroidElement(pageLayoutView)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.resourceItem}>
          <Typography variant="h5">{pageLayoutView.name || ""}</Typography>
          <Button variant="text" onClick={onAddEventTriggerClick(pageLayoutView.id)}>
            {strings.contentEditor.editor.eventTriggers.add}
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <LayoutViewResourcesList
            resources={resources}
            selectedResource={selectedResource}
            onClick={onResourceClick}
          />
          {eventTriggerItems && (
            <div style={{ marginLeft: theme.spacing(4) }}>
              <Typography style={{ padding: theme.spacing(1) }} variant="h5">
                {strings.contentEditor.editor.eventTriggers.title}
              </Typography>
              {eventTriggerItems}
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  /**
   * Event handler for Android layout add tab
   *
   * @param event react mouse event
   */
  const onAddAndroidTabClick = () => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    event.stopPropagation();

    if (!selectedPage || tabResourceIndex === undefined || !selectedLayoutView) {
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
      properties: [newProperty],
      resources: []
    };

    onAddAndroidTab(newTab, selectedLayoutView, selectedPage, tabResourceIndex);
  };

  /**
   * Render tabs for Android layout
   *
   * @param pageLayoutView page layout view
   */
  const renderAndroidTabs = (pageLayoutView: PageLayoutView) => {
    const tabs = renderAndroidTabList();

    return (
      <Accordion
        key={pageLayoutView.name}
        className={classes.resource}
        expanded={selectedLayoutView?.id === pageLayoutView.id}
        onChange={onExpandAndroidElement(pageLayoutView)}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.resourceItem}>
          <Typography style={{ padding: theme.spacing(1) }} variant="h5">
            {pageLayoutView.name || ""}
          </Typography>
          <Button variant="text" onClick={onAddAndroidTabClick()}>
            {strings.contentEditor.editor.tabs.add}
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ marginLeft: theme.spacing(4) }}>
            <Typography style={{ padding: theme.spacing(1) }} variant="h5">
              {!androidTabStructure ||
              !androidTabStructure.tabs ||
              androidTabStructure.tabs.length === 0
                ? strings.contentEditor.editor.tabs.noTabs
                : strings.contentEditor.editor.tabs.title}
            </Typography>
            <AccordionDetails>{tabs}</AccordionDetails>
          </div>
        </AccordionDetails>
      </Accordion>
    );
  };

  /**
   * Render single page layout view element for accordion listing for Android layout
   *
   * @param elementList JSX element list
   * @param pageLayoutViews list of page layout views
   */
  const renderAndroidViews = (elementList: JSX.Element[], pageLayoutViews: PageLayoutView[]) => {
    if (!resourceWidgetIdList) {
      return null;
    }

    pageLayoutViews.forEach((pageLayoutView) => {
      if (allowedWidgetTypes.includes(pageLayoutView.widget)) {
        if (pageLayoutView.widget === PageLayoutWidgetType.TouchableOpacity) {
          elementList.push(renderAndroidResources(selectedPage, pageLayoutView, []));
        }

        const idList = resourceWidgetIdList.get(pageLayoutView.id);
        if (!idList) {
          return;
        }
        if (pageLayoutView.widget === PageLayoutWidgetType.MaterialTabLayout) {
          elementList.push(renderAndroidTabs(pageLayoutView));
        } else {
          elementList.push(renderAndroidResources(selectedPage, pageLayoutView, idList));
        }
      }

      if (pageLayoutView.children.length > 0) {
        renderAndroidViews(elementList, pageLayoutView.children);
      }
    });

    return elementList;
  };

  /**
   * Returns list of HTML components as flat list
   *
   * @param parentComponent parent component
   * @returns child components as flat list
   */
  const getHtmlComponentList = (parentComponent: TreeObject): TreeObject[] => {
    const result: TreeObject[] = [parentComponent];

    parentComponent.children.forEach((child) => {
      result.push(...getHtmlComponentList(child));
    });

    return result;
  };

  /**
   * Renders HTML layout component editor
   *
   * @param component component
   */
  const renderHtmlLayoutComponent = (component: TreeObject) => {
    const componentResourceIds = HtmlResourceUtils.getTreeObjectResourceIds(component);

    const resources = selectedPage.resources.filter((resource) =>
      componentResourceIds.includes(resource.id)
    );

    if (resources.length < 1) return;

    const eventTriggerItems = null;

    return (
      <Accordion key={component.id} className={classes.resource}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.resourceItem}>
          <Typography variant="h5">{component.name || ""}</Typography>
          <Typography variant="caption">
            {LocalizationUtils.getLocalizedComponentType(component.type)}
          </Typography>
          <Button variant="text" disabled onClick={onAddEventTriggerClick(component.id)}>
            {strings.contentEditor.editor.eventTriggers.add}
          </Button>
        </AccordionSummary>
        <AccordionDetails>
          <LayoutViewResourcesList
            resources={resources}
            selectedResource={selectedResource}
            onClick={onResourceClick}
          />
          {eventTriggerItems && (
            <div style={{ marginLeft: theme.spacing(4) }}>
              <Typography style={{ padding: theme.spacing(1) }} variant="h5">
                {strings.contentEditor.editor.eventTriggers.title}
              </Typography>
              {eventTriggerItems}
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  /**
   * Renders page elements
   */
  const renderPageElements = () => {
    if (selectedPageLayout.layoutType === LayoutType.Android) {
      const elementList: JSX.Element[] = [];
      return renderAndroidViews(elementList, [selectedPageLayout.data as PageLayoutView]);
    } else {
      const componentTree = constructTree((selectedPageLayout.data as PageLayoutViewHtml).html);
      const componentList: TreeObject[] = [];

      componentTree.forEach((rootComponent) => {
        componentList.push(...getHtmlComponentList(rootComponent));
      });

      return componentList.map(renderHtmlLayoutComponent);
    }
  };

  return (
    <Accordion expanded={expanded} onChange={(_e, expanded) => onExpandedChange(expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h3">{strings.contentEditor.editor.properties}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <CommonSettingsEditor
          devices={devices}
          layouts={layouts}
          pageData={selectedPage}
          onDeviceChange={onPageDeviceChange}
          onNameChange={onPageNameChange}
          onLayoutChange={onPageLayoutChange}
        />
      </AccordionDetails>
      {renderPageElements()}
    </Accordion>
  );
};

export default withStyles(styles)(ContentEditorContentAccordion);
