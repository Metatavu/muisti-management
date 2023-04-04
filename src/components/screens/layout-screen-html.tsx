import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import Api from "../../api/api";
import { History } from "history";
import styles from "../../styles/components/layout-screen/layout-editor-view";
import {
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { KeycloakInstance } from "keycloak-js";
import { PageLayout, Exhibition, DeviceModel, ScreenOrientation, SubLayout, LayoutType, PageLayoutViewHtml } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, LayoutEditorView } from "../../types";
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import LayoutTreeMenuHtml from "../layout/layout-tree-menu-html";
import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { StreamLanguage } from "@codemirror/language";
import codemirror from "codemirror";

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
const LayoutScreenHTML: React.FC<Props> = ({
  history,
  keycloak,
  deviceModels,
  layout,
  layouts,
  layoutId,
  accessToken,
  classes
}) => {
  // TODO: can remove name, screen orientation, htmlCode and device model id to access from the foundLayout
  const [ name, setName ] = useState("");
  const [ deviceModelId, setDeviceModelId ] = useState("");
  const [ screenOrientation, setScreenOrientation ] = useState<ScreenOrientation>(ScreenOrientation.Portrait);
  const [ view, setView ] = useState<LayoutEditorView>(LayoutEditorView.VISUAL);
  const [ dataChanged, setDataChanged ] = useState(false);
  const [ foundLayout, setFoundLayout ] = useState(layout);
  const [ error, setError ] = useState<Error | undefined>(undefined);
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    fetchLayout();
  }, []);

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

  /**
   * Event handler for name input change
   *
   * @param event event
   */
  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    setDataChanged(true);
  };

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   */
  const onScreenOrientationChange = (event: SelectChangeEvent<ScreenOrientation>) => {
    setScreenOrientation(event.target.value as ScreenOrientation);
    setDataChanged(true);
  };

  /**
   * Event handler for device model select change
   *
   * @param event event
   */
  const onDeviceModelChange = (event: SelectChangeEvent<string>) => {
    setDeviceModelId(event.target.value as string);
    setDataChanged(true);
  };

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
        action: () => onSaveClick(),
        disabled : !dataChanged
      },
    ]
  );

  /**
   * Event handler for save button click
   */
  const onSaveClick = () => {
    const newLayout: PageLayout = {
      ...foundLayout,
      name: name,
      data: {
        html: htmlCode
      },
      modelId: deviceModelId,
      screenOrientation: screenOrientation,
      layoutType: LayoutType.Html
    };

    onLayoutSave(newLayout);
  };

  /**
   * Event handler for layout save
   *
   * @param layout layout
   */
  const onLayoutSave = async (layout: PageLayout) => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);
      const pageLayoutId = layout.id!;

      const updatedLayout = await pageLayoutsApi.updatePageLayout({
        pageLayoutId: pageLayoutId,
        pageLayout: layout
      });

      const updatedLayouts = layouts.filter(item => item.id !== updatedLayout.id);
      setLayouts([ ...updatedLayouts, layout ]);

      // TODO: Will update html state here
      setDataChanged(false);
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };

  // TODO: should be a string
  const onCodeChange = React.useCallback((value: string, viewUpdate) => {
    console.log('value:', value);
    console.log("html code", foundLayout.data);
    setFoundLayout({ ...foundLayout!, data: { html: value } });
  }, []);

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
            value={ deviceModelId }
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
            value={ screenOrientation }
            onChange={ onScreenOrientationChange }
            >
            <MenuItem value={ ScreenOrientation.Portrait }>{ strings.layout.settings.portrait }</MenuItem>
            <MenuItem value={ ScreenOrientation.Landscape }>{ strings.layout.settings.landscape }</MenuItem>
          </Select>
        </FormControl>
      </div>
    );
  }

  /**
   * Renders code editor view
   */
  const renderCodeEditor = () => (
    <div className={ classes.editors }>
      <div className={ classes.editorContainer }>
        <Typography style={{ margin: 8 }}>{ strings.exhibitionLayouts.editView.html }</Typography>
          <CodeMirror
            value={ foundLayout?.data.html }
            height="200px"
            extensions={ [ html() ] }
            onChange={ onCodeChange }
          />
      </div>
    </div>
  );

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
      title={ foundLayout?.name! }
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
                value={ name }
                onChange={ onNameChange }
              />
              { renderDeviceModelSelect() }
              { renderScreenOrientationSelect() }
              { foundLayout &&
                <LayoutTreeMenuHtml
                  htmlString={ (foundLayout.data as PageLayoutViewHtml).html }
                />}
            </div>
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