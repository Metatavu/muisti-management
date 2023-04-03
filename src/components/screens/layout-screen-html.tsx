import { useEffect, useState } from "react";
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
} from "@mui/material";
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import { KeycloakInstance } from "keycloak-js";
import { PageLayout, Exhibition, DeviceModel, ScreenOrientation, SubLayout, LayoutType, PageLayoutViewHtml } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton, LayoutEditorView } from '../../types';
import strings from "../../localization/strings";
import theme from "../../styles/theme";
import LayoutTreeMenuHtml from "../layout/layout-tree-menu-html";
import { useParams } from "react-router-dom";
import Api from "../../api/api";

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

      const pageLayout = await pageLayoutsApi.findPageLayout({ pageLayoutId: "layoutId" });

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
  }

  /**
   * Event handler for screen orientation select change
   *
   * @param event event
   */
  const onScreenOrientationChange = (event: SelectChangeEvent<ScreenOrientation>) => {
    setScreenOrientation(event.target.value as ScreenOrientation);
    setDataChanged(true);
  }

  /**
   * Event handler for device model select change
   *
   * @param event event
   */
  const onDeviceModelChange = (event: SelectChangeEvent<string>) => {
    setDeviceModelId(event.target.value as string);
    setDataChanged(true);
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
        action: () => onSaveClick(),
        disabled : !dataChanged
      },
    ]
  );

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
   * Event handler for save button click
   */
  const onSaveClick = () => {
    const newLayout: PageLayout = {
      ...layout,
      name: name,
      data: {
        // TODO: HTML data to be implemented
        html: strings.comingSoon
      },
      modelId: deviceModelId,
      screenOrientation: screenOrientation,
      layoutType: LayoutType.Html
    };

    onLayoutSave(newLayout);
  }

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
              <LayoutTreeMenuHtml
              htmlString={ (foundLayout.data as PageLayoutViewHtml).html }
            />
          </div>
          </ElementNavigationPane>
          <EditorView>
            {/* TODO:  Editor view will be used in future  */}
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