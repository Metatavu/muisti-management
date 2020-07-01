import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, TextField, Select, MenuItem, InputLabel } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { PageLayout, ScreenOrientation, PageLayoutViewPropertyType, DeviceModel } from "../../generated/client";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import Api from "../../api/api";
import { setLayouts, setSelectedLayout } from "../../actions/layouts";
import GenericDialog from "../generic/generic-dialog";
import theme from "../../styles/theme";
import produce from "immer";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  layouts: PageLayout[];
  deviceModels: DeviceModel[];
  setLayouts: typeof setLayouts;
  setSelectedLayout: typeof setSelectedLayout;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  addNewDialogOpen: boolean;
  newLayout: Partial<PageLayout>;
}

/**
 * Component for layouts screen
 */
class LayoutsScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      addNewDialogOpen: false,
      newLayout: {}
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={ keycloak }
          history={ history }
          title={ strings.layout.title }
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

    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ strings.layout.title }
        breadcrumbs={ [] }
        actionBarButtons={ this.getActionButtons() }
        noBackButton
      >
        { this.renderLayoutCardsList() }
        { this.renderAddNewDialog() }
      </BasicLayout>
    );
  }

  /**
   * Renders layouts as card list
   */
  private renderLayoutCardsList = () => {
    const { layouts } = this.props;
    if (layouts.length < 1) {
      return null;
    }
    
    const cards = layouts.map(layout => {
      const layoutId = layout.id;
      if (!layoutId) {
        return null;
      }

      const cardMenuOptions = this.getCardMenuOptions(layout);

      return (
        <CardItem
          key={ layout.id }
          title={ layout.name }
          onClick={ () => this.onCardClick(layoutId) }
          menuOptions={ cardMenuOptions }
          status={ "" }
        />
      );
    });

    return (
      <CardList title={ "" }>
        { cards }
      </CardList>
    );
  }

  /**
   * Renders add new dialog
   */
  private renderAddNewDialog = () => {
    const { deviceModels } = this.props;
    const { newLayout, addNewDialogOpen } = this.state;
    return (
      <GenericDialog
        error={ !newLayout.name }
        open={ addNewDialogOpen }
        title={ strings.layout.addNew }
        positiveButtonText={ strings.generic.add }
        cancelButtonText={ strings.generic.cancel }
        onCancel={ this.toggleAddNewDialog }
        onClose={ this.toggleAddNewDialog }
        onConfirm={ this.createNewLayout }
      >
        <TextField
          fullWidth
          variant="outlined"
          label={ strings.generic.name }
          name="name"
          value={ newLayout.name }
          onChange={ this.onNewLayoutChange }
        />
        <InputLabel id="screenOrientation-label" style={{ marginTop: theme.spacing(2) }}>
          { strings.layout.settings.deviceModelId }
        </InputLabel>
        <Select
          fullWidth
          variant="filled"
          style={{ marginTop: theme.spacing(2) }}
          label={ strings.dashboard.devices.dialog.model }
          name="modelId"
          value={ newLayout.modelId || "" }
          onChange={ this.onNewLayoutChange }
        >
          { deviceModels.map(model => 
            <MenuItem key={ model.id } value={ model.id }>
              { `${model.manufacturer} ${model.model}` }
            </MenuItem>
          )}
        </Select>
      </GenericDialog>
    );
  }

  /**
   * Gets card menu options
   *
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (layout: PageLayout): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.setStatus,
      action: this.setStatus
    }, {
      name: strings.exhibitions.cardMenu.delete,
      action: () => this.deleteLayout(layout)
    }];
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.layout.addNew, action: this.toggleAddNewDialog }
    ] as ActionButton[];
  }

  /**
   * Creates new layout
   * 
   * @param layout layout
   */
  private createNewLayout = async () => {
    const { accessToken, setLayouts, layouts } = this.props;
    const { newLayout } = this.state;
    if (!newLayout.name || !newLayout.modelId) {
      return;
    }

    const pageLayout: PageLayout = {
      name: newLayout.name,
      screenOrientation: ScreenOrientation.Landscape,
      modelId: newLayout.modelId,
      data: {
        id: "newFrameLayout",
        widget: "FrameLayout",
        properties: [{
          name: "layout_width",
          value: "match_parent",
          type: PageLayoutViewPropertyType.String
        }, {
          name: "layout_height",
          value: "match_parent",
          type: PageLayoutViewPropertyType.String
        }, {
          name: "background",
          value: "#000000",
          type: PageLayoutViewPropertyType.String
        }],
        children: []
      }
    };
    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    const createdLayout = await layoutsApi.createPageLayout({ pageLayout });
    layouts.push(createdLayout);
    setLayouts(layouts);
  }

  /**
   * Event handler for card click
   * 
   * @param layoutId layout id
   */
  private onCardClick = (layoutId: string) => {
    const { layouts } = this.props;
    const { pathname } = this.props.history.location;
    const layout = layouts.find(layout => layout.id === layoutId);
    if (!layout) {
      return;
    }

    this.props.setSelectedLayout(layout);
    this.props.history.push(`${pathname}/${layoutId}`);
  }

  /**
   * Toggles add new layout dialog
   */
  private toggleAddNewDialog = () => {
    this.setState({
      addNewDialogOpen: !this.state.addNewDialogOpen
    });
  }

  /**
   * Event handler for new layout change
   * 
   * @param event event
   */
  private onNewLayoutChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { newLayout } = this.state;
    const { name, value } = event.target;
    if (!name) {
      return;
    }
    this.setState({ newLayout: { ...newLayout, [name]: value } });
  }

  /**
   * Event handler for set status
   */
  private setStatus = () => {
    alert(strings.comingSoon);
    return;
  }

  /**
   * Deletes layout
   * 
   * @param layout layout
   */
  private deleteLayout = async (layout: PageLayout) => {
    const { accessToken, layouts } = this.props;
    const pageLayoutId = layout.id;
    if (!pageLayoutId) {
      return;
    }

    const confirmMessage = strings.formatString(strings.layout.confirmDelete, layout.name);
    if (!window.confirm(confirmMessage as string)) {
      return;
    }

    const layoutsApi = Api.getPageLayoutsApi(accessToken);
    await layoutsApi.deletePageLayout({ pageLayoutId });

    const updatedLayouts = produce(layouts, draft => {
      const layoutIndex = draft.findIndex(layout => layout.id === pageLayoutId);
      if (layoutIndex > -1) {
        draft.splice(layoutIndex, 1);
      }
    });

    this.props.setLayouts(updatedLayouts);
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
    layouts: state.layouts.layouts,
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
    setLayouts: (layouts: PageLayout[]) => dispatch(setLayouts(layouts)),
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutsScreen));
