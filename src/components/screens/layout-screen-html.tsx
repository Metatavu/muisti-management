import { ChangeEvent, FC, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import Api from "../../api/api";
import { History } from "history";
import { pushNewPageLayoutViewToTree } from "../layout/utils/tree-data-utils";
import styles from "../../styles/components/layout-screen/layout-editor-view";
import {
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Box,
  FormHelperText,
  Grid,
  Typography,
  Divider,
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { KeycloakInstance } from "keycloak-js";
import { PageLayout, Exhibition, DeviceModel, ScreenOrientation, SubLayout, LayoutType, PageLayoutViewHtml, PageLayoutWidgetType, PageLayoutView } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, LayoutEditorView } from "../../types";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import LayoutTreeMenuHtml from "../layout/layout-tree-menu-html";
import GenericDialog from "../generic/generic-dialog";
import { ComponentType } from "../../types";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { html_beautify } from "js-beautify";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  deviceModels: DeviceModel[];
  layoutId: string;
  layout?: PageLayout;
  layouts: PageLayout[];
  subLayouts: SubLayout[];
  setLayouts: typeof setLayouts;
  setSelectedLayout: typeof setSelectedLayout;
}

/**
 * Component for html layout screen
 */
const LayoutScreenHTML: FC<Props> = ({
  history,
  keycloak,
  deviceModels,
  layout,
  layouts,
  layoutId,
  accessToken,
  classes,
  subLayouts
}) => {
  const [ view, setView ] = useState<LayoutEditorView>(LayoutEditorView.VISUAL);
  const [ dataChanged, setDataChanged ] = useState(false);
  const [ foundLayout, setFoundLayout ] = useState<PageLayout | undefined>(layout);
  const [ error, setError ] = useState<Error | undefined>(undefined);
  const [ loading, setLoading ] = useState(false);
  const [ addComponentDialogOpen, setAddComponentDialogOpen ] = useState(false);
  const [ newComponentType, setNewComponentType ] = useState<ComponentType | undefined>(undefined);
  const [ componentName, setComponentName ] = useState("");
  const [ newPageLayoutViewHtml, setNewPageLayoutViewHtml ] = useState<PageLayoutViewHtml | undefined>(undefined);
  const [ selectedSubLayoutId, setSelectedSubLayoutId ] = useState<string | undefined>(undefined);
  const [ newPageLayoutViewPath, setNewPageLayoutViewPath ] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchLayout();
  }, []);

  useEffect(() => setDataChanged(true), [foundLayout]);

  /**
   * Fetches PageLayout
   */
  const fetchLayout = async () => {
    setLoading(true);
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);

      const pageLayout = await pageLayoutsApi.findPageLayout({ pageLayoutId: layoutId });

      setFoundLayout(pageLayout);
    } catch (e) {
      console.error(e);
      setError(new Error(strings.errorDialog.layoutFetchNotFound));
    }
    setLoading(false);
  };

  if (!foundLayout) {
    const layoutError = new Error(strings.errorDialog.layoutFetchNotFound);

    return (
      <BasicLayout
        history={ history }
        title={ "" }
        breadcrumbs={ [] }
        keycloak={ keycloak }
        error={ layoutError }
        clearError={ () => history.goBack() }
      />
    )
  }

  /**
   * Event handler for layout name input change
   *
   * @param event event
   */
  const onLayoutNameChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setFoundLayout({
      ...foundLayout,
      name: value
    });
  };

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   */
  const onScreenOrientationChange = ({ target: { value } }: SelectChangeEvent<ScreenOrientation>) => {
    setFoundLayout({
      ...foundLayout,
      screenOrientation: value as ScreenOrientation
    });
  };

  /**
   * Event handler for device model select change
   *
   * @param event event
   */
  const onDeviceModelChange = ({ target: { value } } : SelectChangeEvent<string>) => {
    setFoundLayout({
      ...foundLayout,
      modelId: value
    });
  };

  /**
   * Event handler for layout component add
   *
   * @param layoutHtml layout view
   */
  const onHtmlLayoutComponentAdd = async (layoutHtml: PageLayout) => {
    if (!layout) return;

    const updatedLayout = { ...layout, data: layoutHtml };
    setFoundLayout(updatedLayout);
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  const getActionButtons = (): ActionButton[] => (
    [
      {
        name: view === LayoutEditorView.CODE ?
          strings.exhibitionLayouts.editView.switchToVisualButton :
          strings.exhibitionLayouts.editView.switchToCodeButton,
          action: () => view === LayoutEditorView.CODE ? setView(LayoutEditorView.VISUAL) : setView(LayoutEditorView.CODE),
      },
      {
        name: strings.exhibitionLayouts.editView.saveButton,
        action: onLayoutSave,
        disabled : !dataChanged
      },
    ]
  );

  /**
   * Event handler for layout save
   *
   * @param layout layout
   */
  const onLayoutSave = async () => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);

      const updatedLayout = await pageLayoutsApi.updatePageLayout({
        pageLayoutId: layoutId,
        pageLayout: foundLayout
      });

      const updatedLayouts = layouts.filter(item => item.id !== updatedLayout.id);
      setLayouts([ ...updatedLayouts, layout ]);
      setDataChanged(false);
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };

  /**
   * Handler for Code Editor onChange events
   */
  const onCodeChange = (value: string) => {
    setFoundLayout({ ...foundLayout, data: { html: value } });
  };

  /**
   * Renders editor view
   */
  const renderEditor = () => {
    switch (view) {
      case "CODE":
        return renderCodeEditor();
      // case "VISUAL":
      //   return renderVisualEditor();
      default:
        return null;
    }
  }

  /**
   * Renders device model select
   */
  const renderDeviceModelSelect = () => {
    const deviceModelSelectItems = deviceModels.map(model =>
      <MenuItem key={ model.id } value={ model.id }>{ `${ model.manufacturer } ${ model.model }` }</MenuItem>
    );

    return (
      <div className={ classes.select }>
        <FormControl variant="outlined">
          <InputLabel id="deviceModelId">
            { strings.layout.settings.deviceModelId }
          </InputLabel>
          <Select
            style={{ width: 200 }}
            title={ strings.helpTexts.layoutEditor.selectDevice }
            label={ strings.layout.settings.deviceModelId }
            labelId="deviceModelId"
            value={ foundLayout.modelId }
            onChange={ onDeviceModelChange }
            >
          { deviceModelSelectItems }
          </Select>
        </FormControl>
      </div>
    );
  }

  /**
   * Renders screen orientation select
   */
  const renderScreenOrientationSelect = () => {
    return (
      <div className={ classes.select }>
        <FormControl variant="outlined">
          <InputLabel id="screenOrientation">{ strings.layout.settings.screenOrientation }</InputLabel>
          <Select
            style={{ width: 200 }}
            title={ strings.helpTexts.layoutEditor.selectOrientation }
            label={ strings.layout.settings.screenOrientation }
            labelId="screenOrientation"
            value={ foundLayout.screenOrientation }
            onChange={ onScreenOrientationChange }
            >
            <MenuItem value={ ScreenOrientation.Portrait }>{ strings.layout.settings.portrait }</MenuItem>
            <MenuItem value={ ScreenOrientation.Landscape }>{ strings.layout.settings.landscape }</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  };

  /**
   * Renders code editor view
   */
  const renderCodeEditor = () => (
    <div className={ classes.editors }>
      <div className={ classes.editorContainer }>
        <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.html }</Typography>
          <CodeMirror
            value={ html_beautify(foundLayout.data.html, {
              indent_size: 2,
              inline: [],
              indent_empty_lines: true
            }) }
            height="500px"
            style={{ overflow: "auto" }}
            extensions={ [ html() ] }
            onChange={ onCodeChange }
          />
      </div>
    </div>
  );

  /**
   * Event handler for layout view property add click
   *
   * @param path path to the parent element where the new child item will be added
   */
  const onAddComponentClick = (path: string) => {
    setAddComponentDialogOpen(true);
    setNewPageLayoutViewPath(path);
  }

  /**
   * Event handler for dialog confirm click
   */
  const onConfirmClick = () => {
    if (!newPageLayoutViewHtml) return;
    // const updatedLayout = pushNewPageLayoutViewToTree(foundLayout, newPageLayoutViewHtml, newPageLayoutViewPath);
    setNewPageLayoutViewHtml(undefined);
    setAddComponentDialogOpen(false);
    setNewPageLayoutViewPath("");
  }

  /**
   * Event handler for dialog close or cancel click
   */
  const onCloseOrCancelClick = () => {
    setAddComponentDialogOpen(false);
    setNewPageLayoutViewHtml(undefined);
    setSelectedSubLayoutId(undefined);
    setNewPageLayoutViewPath("");
  }

  /**
   * Render dialog content based on editingSubLayout boolean
   */
  const renderDialogContent = () => {
    return renderLayoutDialog();
  }

  /**
   * Event handler for sub layout change event
   *
   * @param event React change event
   */
  const onSubLayoutChange = ({ target: { value } } : SelectChangeEvent<string>) => {
    const subLayoutId = value;

    if (!subLayoutId) {
      return;
    }

    const subLayout = subLayouts.find(layout => layout.id === subLayoutId);

    if (!subLayout) {
      return;
    }

    const pageLayoutViewHtml: PageLayoutViewHtml = {
      ...subLayout.data.html
    };

    setNewPageLayoutViewHtml(pageLayoutViewHtml);
    setSelectedSubLayoutId(subLayoutId);
  }

  /**
   * Render add layout component dialog
   */
  const renderLayoutDialog = () => {
    const componentItems = Object.keys(ComponentType).map(widget => {
      return (
        <MenuItem key={ widget } value={ widget }>{ widget }</MenuItem>
      );
    });
    const subLayoutItems = subLayouts.map(layout => {
      return (
        <MenuItem key={ layout.id } value={ layout.id }>{ layout.name }</MenuItem>
      );
    });
  
      return (
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={ 12 }>
            <FormControl variant="outlined">
              <InputLabel id="widget" style={{ marginBottom: theme.spacing(2) }}>
                { strings.layoutEditor.addLayoutViewDialog.widget }
              </InputLabel>
              <Select
                labelId="component"
                label={ strings.layoutEditor.addLayoutViewDialog.widget }
                name="component"
                value={ newComponentType ?? "" }
                onChange={ (event) => { setNewComponentType(event.target.value as ComponentType) } }>
                { componentItems }
              </Select>
              <FormHelperText>
                { strings.helpTexts.layoutEditor.buttonDescription }
              </FormHelperText>
            </FormControl>
          </Grid>
          <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
            <Typography variant="h6">
              { strings.layoutEditor.addLayoutViewDialog.or }
            </Typography>
          </div>
          <Grid item xs={ 12 }>
            <FormControl variant="outlined">
              <InputLabel id="subLayout" style={{ marginBottom: theme.spacing(2) }}>
                { strings.layoutEditor.addLayoutViewDialog.subLayout }
              </InputLabel>
              <Select
                labelId="subLayout"
                label={ strings.layoutEditor.addLayoutViewDialog.subLayout }
                name="subLayout"
                value={ (selectedSubLayoutId && newPageLayoutView) ? selectedSubLayoutId : "" }
                onChange={ onSubLayoutChange }
              >
                { subLayoutItems }
              </Select>
            </FormControl>
            <Box mt={ 2 }>
              <TextField
                helperText={ strings.helpTexts.layoutEditor.giveElementName }
                style={{ marginTop: theme.spacing(2) }}
                label={ strings.layoutEditor.addLayoutViewDialog.name }
                type="text"
                name="name"
                disabled={ foundLayout ? false : true }
                value={ componentName ?? "" }
                onChange={ (event) => { setComponentName(event.target.value) } }
              />
            </Box>
          </Grid>
        </Grid>
      );
    }

  if (loading) {
    return (
      <div className={ classes.loader }>
        <CircularProgress size={ 50 } color="secondary"/>
      </div>
    );
  }

  return (
    <BasicLayout
      history={ history }
      title={ foundLayout.name }
      breadcrumbs={ [] }
      actionBarButtons={ getActionButtons() }
      keycloak={ keycloak }
      error={ error }
      clearError={ () => setError(undefined) }
      openDataChangedPrompt={ true }
    >
        <div className={ classes.editorLayout }>
          <ElementNavigationPane width={ 320 } title={ strings.layout.title }>
            <div style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}>
              <TextField
                style={{ width: 200 }}
                label={ strings.layout.toolbar.name }
                value={ foundLayout.name }
                onChange={ onLayoutNameChange }
              />
              { renderDeviceModelSelect() }
              { renderScreenOrientationSelect() }
              { foundLayout &&
                <LayoutTreeMenuHtml
                  htmlString={ (foundLayout.data as PageLayoutViewHtml).html }
                  addHtmlComponent={ onHtmlLayoutComponentAdd }
                  onAddComponentClick={ onAddComponentClick }
                />}
            </div>
            <GenericDialog
              cancelButtonText={ strings.layoutEditor.addLayoutViewDialog.cancel }
              positiveButtonText={ strings.layoutEditor.addLayoutViewDialog.confirm }
              title={ strings.layoutEditor.addLayoutViewDialog.title }
              error={ false }
              onConfirm={ onConfirmClick }
              onCancel={ onCloseOrCancelClick }
              open={ addComponentDialogOpen }
              onClose={ onCloseOrCancelClick }
            >
              { renderDialogContent() }
            </GenericDialog>
          </ElementNavigationPane>
          <EditorView>
            { renderEditor() }
          </EditorView>
        </div>
    </BasicLayout>
  );
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
const mapStateToProps = (state: ReduxState) => {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken,
    layout: state.layouts.selectedLayout as PageLayout,
    layouts: state.layouts.layouts,
    subLayouts: state.subLayouts.subLayouts,
    exhibitions: state.exhibitions.exhibitions,
    deviceModels: state.devices.deviceModels
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
const mapDispatchToProps = (dispatch: Dispatch<ReduxActions>) => {
  return {
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
    setLayouts: (layouts: PageLayout[]) => dispatch(setLayouts(layouts))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutScreenHTML));