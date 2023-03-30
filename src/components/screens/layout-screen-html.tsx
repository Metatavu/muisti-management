import { useState } from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { setSelectedLayout, setLayouts } from "../../actions/layouts";
import { History } from "history";
import styles from "../../styles/components/layout-screen/layout-editor-view";
// eslint-disable-next-line max-len
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
// eslint-disable-next-line max-len
import { PageLayout, Exhibition, DeviceModel, ScreenOrientation, SubLayout } from "../../generated/client";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import theme from "../../styles/theme";

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
export const LayoutScreenHTML: React.FC<Props> = ({
  history,
  keycloak,
  deviceModels,
  layout,
  classes
}) => {
  const [ name, setName ] = useState("");
  const [ deviceModelId, setDeviceModelId ] = useState("");
  const [ screenOrientation, setScreenOrientation ] = useState<ScreenOrientation>(ScreenOrientation.Portrait);
  const [ view, setView ] = useState("VISUAL")
  const [ dataChanged, setDataChanged ] = useState(false);

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
          <InputLabel id="deviceModelId">{ strings.layout.settings.deviceModelId }</InputLabel>
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
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  const getActionButtons = (): ActionButton[] => (
    [
      {
        name: view === "CODE" ?
          strings.exhibitionLayouts.editView.switchToVisualButton :
          strings.exhibitionLayouts.editView.switchToCodeButton,
        action: () => view === "CODE" ? setView("VISUAL") : setView("CODE"),
      },
      {
        name: strings.exhibitionLayouts.editView.saveButton,
        action: () => alert(strings.comingSoon),
        disabled : !dataChanged
      },
    ]
  );

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

  if (!layout || !layout.id || deviceModels.length === 0) {
    return (
      <div className={ classes.loader }>
        <CircularProgress size={ 50 } color="secondary" />
      </div>
    );
  }

  return (
    <BasicLayout
      history={ history }
      title={ layout.name }
      breadcrumbs={ [] }
      actionBarButtons={ getActionButtons() }
      keycloak={ keycloak }
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