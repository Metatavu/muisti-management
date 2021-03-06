import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, TextField, Select, MenuItem, InputLabel, FormControlLabel, Switch, FormControl } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { PageLayout, ScreenOrientation, PageLayoutViewPropertyType, DeviceModel, PageLayoutWidgetType, SubLayout, ExhibitionPage, Exhibition } from "../../generated/client";
import { AccessToken, ActionButton, ConfirmDialogData, DeleteDataHolder } from '../../types';
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import Api from "../../api/api";
import { setLayouts, setSelectedLayout } from "../../actions/layouts";
import { setSubLayouts, setSelectedSubLayout } from "../../actions/subLayouts";
import GenericDialog from "../generic/generic-dialog";
import theme from "../../styles/theme";
import produce from "immer";
import { v4 as uuid } from "uuid";
import ConfirmDialog from "../generic/confirm-dialog";
import DeleteUtils from "../../utils/delete-utils";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  layouts: PageLayout[];
  subLayouts: SubLayout[];
  deviceModels: DeviceModel[];
  setLayouts: typeof setLayouts;
  setSelectedLayout: typeof setSelectedLayout;
  setSubLayouts: typeof setSubLayouts;
  setSelectedSubLayout: typeof setSelectedSubLayout;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  addNewDialogOpen: boolean;
  newLayout: Partial<PageLayout>;
  newSubLayout: Partial<SubLayout>;
  createSubLayout: boolean;
  deleteDialogOpen: boolean;
  confirmDialogData: ConfirmDialogData;
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
      newLayout: {},
      newSubLayout: {},
      createSubLayout: false,
      deleteDialogOpen: false,
      confirmDialogData: this.defaultDeleteData
    };
  }

  /**
   * Event handler for clear dialog
   */
  private clearDialog = () => {
    this.setState({
      deleteDialogOpen: false,
      confirmDialogData: this.defaultDeleteData
    });
  }

  /**
   * Default values for delete dialog
   */
  private defaultDeleteData: ConfirmDialogData = {
    title: strings.layout.delete.deleteTitle,
    text: strings.layout.delete.deleteText,
    cancelButtonText: strings.confirmDialog.cancel,
    positiveButtonText: strings.confirmDialog.delete,
    deletePossible: true,
    onCancel: this.clearDialog,
    onClose: this.clearDialog,
  };

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
        { this.renderConfirmDialog() }
      </BasicLayout>
    );
  }

  /**
   * Renders layouts as card list
   */
  private renderLayoutCardsList = () => {
    const { layouts, subLayouts } = this.props;
    if (layouts.length < 1 && subLayouts.length < 1) {
      return null;
    }

    const layoutCards = layouts.map(layout => {
      const layoutId = layout.id;
      if (!layoutId) {
        return null;
      }

      const cardMenuOptions = this.getLayoutCardMenuOptions(layout);

      return (
        <CardItem
          key={ layout.id }
          title={ layout.name }
          onClick={ () => this.onLayoutCardClick(layoutId) }
          menuOptions={ cardMenuOptions }
        />
      );
    });

    const subLayoutCards = subLayouts.map(subLayout => {
      const subLayoutId = subLayout.id;
      if (!subLayoutId) {
        return null;
      }

      const cardMenuOptions = this.getSubLayoutCardMenuOptions(subLayout);

      return (
        <CardItem
          key={ subLayout.id }
          title={ `${strings.subLayout.name} - ${subLayout.name}` }
          onClick={ () => this.onSubLayoutCardClick(subLayoutId) }
          menuOptions={ cardMenuOptions }
        />
      );
    });

    return (
      <div style={{ width: "100%", overflowY: "auto" }}>
        <CardList autoHeight>
          { layoutCards }
        </CardList>

        <CardList
          autoHeight
          title={ strings.subLayout.title }
          subtitle={ strings.subLayout.description }
        >
          { subLayoutCards }
        </CardList>
      </div>
    );
  }

  /**
   * Renders add new dialog
   */
  private renderAddNewDialog = () => {
    const { newLayout, newSubLayout, addNewDialogOpen, createSubLayout } = this.state;

    return (
      <GenericDialog
        error={ !newLayout.name && !newSubLayout.name }
        open={ addNewDialogOpen }
        title={ createSubLayout ? strings.subLayout.addNew : strings.layout.addNew }
        positiveButtonText={ strings.generic.add }
        cancelButtonText={ strings.generic.cancel }
        onCancel={ this.toggleAddNewDialog }
        onClose={ this.toggleAddNewDialog }
        onConfirm={ createSubLayout ? this.createNewSubLayout : this.createNewLayout }
      >
        <TextField
          fullWidth
          variant="outlined"
          label={ strings.generic.name }
          name="name"
          value={ createSubLayout ? newSubLayout.name : newLayout.name }
          onChange={ this.onNewLayoutChange }
        />
        <FormControlLabel
          style={{ marginTop: theme.spacing(2) }}
          control={
            <Switch
              checked={ createSubLayout }
              onChange={ this.onSubLayoutSwitchChange }
              color="secondary"
              name="sublayout"
              inputProps={{ 'aria-label': 'primary checkbox' }}
              />
            }
          label={ strings.layout.makeAsSubLayout }
        />

        { !createSubLayout &&
          this.renderDeviceModelSelect()
        }

      </GenericDialog>
    );
  }

  /**
   * Renders confirmation dialog
   */
  private renderConfirmDialog = () => {
    const { deleteDialogOpen, confirmDialogData } = this.state;

    return (
      <ConfirmDialog
        open={ deleteDialogOpen }
        confirmDialogData={ confirmDialogData }
      />
    );
  }

  /**
   * Render device modal select
   */
  private renderDeviceModelSelect = () => {
    const { deviceModels } = this.props;
    const { newLayout } = this.state;

    return (
      <FormControl variant="outlined">
        <InputLabel id="screenOrientation-label" style={{ marginTop: theme.spacing(2) }}>
          { strings.layout.settings.deviceModelId }
        </InputLabel>
        <Select
          fullWidth
          style={{ marginTop: theme.spacing(2) }}
          label={ strings.device.dialog.model }
          labelId="screenOrientation-label"
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
    </FormControl>
    );
  }

  /**
   * Gets layout card menu options
   *
   * @param layout page layout
   * @returns layout card menu options as action button array
   */
  private getLayoutCardMenuOptions = (pageLayout: PageLayout): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.delete,
      action: () => this.onDeletePageLayoutClick(pageLayout)
    }];
  }

  /**
   * Gets sub layout card menu options
   *
   * @param subLayout sub layout
   * @returns sub layout card menu options as action button array
   */
  private getSubLayoutCardMenuOptions = (subLayout: SubLayout): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.delete,
      action: () => this.onDeleteSubLayoutClick(subLayout)
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
   * Event handler for page layout delete click
   *
   * @param pageLayout page layout to delete
   */
  private onDeletePageLayoutClick = async (pageLayout: PageLayout) => {
    const { accessToken } = this.props;

    if (!pageLayout.id) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const pagesApi = Api.getExhibitionPagesApi(accessToken);

    const allExhibitions = await exhibitionsApi.listExhibitions();

    const pages: ExhibitionPage[] = [];
    const exhibitions: Exhibition[] = [];

    for (const exhibition of allExhibitions) {
      const exhibitionPages = await pagesApi.listExhibitionPages({
        exhibitionId: exhibition.id!,
        pageLayoutId: pageLayout.id
      });

      if (exhibitionPages.length > 0) {
        pages.push(...exhibitionPages);
        exhibitions.push(exhibition);
      }
    }

    const tempDeleteData = { ...this.state.confirmDialogData } as ConfirmDialogData;
    tempDeleteData.title = strings.layout.delete.deleteTitle;
    tempDeleteData.text = strings.layout.delete.deleteText;
    tempDeleteData.onConfirm = () => this.deleteLayout(pageLayout);

    if (pages.length > 0) {
      tempDeleteData.deletePossible = false;
      tempDeleteData.contentTitle = strings.layout.delete.contentTitle;

      const holder: DeleteDataHolder[] = [];

      holder.push({ objects: pages, localizedMessage: strings.deleteContent.pages });
      holder.push({ objects: exhibitions, localizedMessage: strings.deleteContent.exhibitions });
      tempDeleteData.contentSpecificMessages = DeleteUtils.constructContentDeleteMessages(holder);
    }

    this.setState({
      deleteDialogOpen: true,
      confirmDialogData: tempDeleteData
    });
  }

  /**
   * Event handler for sub layout delete click
   *
   * @param pageLayout sub layout to delete
   */
  private onDeleteSubLayoutClick = async (subLayout: SubLayout) => {
    if (!subLayout.id) {
      return;
    }

    const tempDeleteData = { ...this.state.confirmDialogData } as ConfirmDialogData;

    tempDeleteData.title = strings.subLayout.delete.deleteTitle;
    tempDeleteData.text = strings.subLayout.delete.deleteText;
    tempDeleteData.onConfirm = () => this.deleteSubLayout(subLayout);

    this.setState({
      deleteDialogOpen: true,
      confirmDialogData: tempDeleteData
    });
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
        id: uuid(),
        name: "",
        widget: PageLayoutWidgetType.FrameLayout,
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
    this.setState({
      addNewDialogOpen: false
    });
  }

  /**
   * Creates new sub layout
   */
  private createNewSubLayout = async () => {
    const { accessToken, setSubLayouts, subLayouts } = this.props;
    const { newSubLayout } = this.state;
    if (!newSubLayout.name) {
      return;
    }

    const subLayout: SubLayout = {
      name: newSubLayout.name,
      data: {
        id: uuid(),
        name: "",
        widget: PageLayoutWidgetType.FrameLayout,
        properties: [{
          name: "layout_width",
          value: "match_parent",
          type: PageLayoutViewPropertyType.String,
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

    const subLayoutsApi = Api.getSubLayoutsApi(accessToken);
    const createdSubLayout = await subLayoutsApi.createSubLayout({ subLayout });
    subLayouts.push(createdSubLayout);
    setSubLayouts(subLayouts);

    this.setState({
      addNewDialogOpen: false
    });
  }

  /**
   * Event handler for layout card click
   *
   * @param layoutId layout id
   */
  private onLayoutCardClick = (layoutId: string) => {
    const { layouts } = this.props;
    const { pathname } = this.props.history.location;
    const foundLayout = layouts.find(layout => layout.id === layoutId);

    if (!foundLayout) {
      return;
    }

    this.props.setSelectedLayout(foundLayout);
    this.props.history.push(`${pathname}/${layoutId}`);
  }

  /**
   * Event handler for sub layout card click
   *
   * @param subLayoutId sub layout id
   */
  private onSubLayoutCardClick = (subLayoutId: string) => {
    const { subLayouts } = this.props;
    const { pathname } = this.props.history.location;
    const foundSubLayout = subLayouts.find(subLayout => subLayout.id === subLayoutId);

    if (!foundSubLayout) {
      return;
    }

    this.props.setSelectedSubLayout(foundSubLayout);
    this.props.history.push(`${pathname}/sub/${subLayoutId}`);
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
   * On Sub layout switch change handler
   *
   * @param event react event
   * @param checked is switch checked
   */
  private onSubLayoutSwitchChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean)  => {
    this.setState({
      createSubLayout: checked
    });
  }

  /**
   * Event handler for new layout change
   *
   * @param event event
   */
  private onNewLayoutChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => {
    const { newLayout, newSubLayout, createSubLayout } = this.state;
    const { name, value } = event.target;
    if (!name) {
      return;
    }
    if (createSubLayout) {
      this.setState({
        newSubLayout: { ...newSubLayout, [name]: value }
      });
    } else {
      this.setState({
        newLayout: { ...newLayout, [name]: value }
      });
    }
  }

  /**
   * Deletes layout
   *
   * @param layout layout
   */
  private deleteLayout = async (pageLayout: PageLayout) => {
    const { accessToken, layouts } = this.props;
    const pageLayoutId = pageLayout.id;

    if (!pageLayoutId) {
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

    this.clearDialog();
    this.props.setLayouts(updatedLayouts);
  }

  /**
   * Deletes sub layout
   *
   * @param layout layout
   */
  private deleteSubLayout = async (subLayout: SubLayout) => {
    const { accessToken, subLayouts } = this.props;
    const subLayoutId = subLayout.id;
    if (!subLayoutId) {
      return;
    }

    const layoutsApi = Api.getSubLayoutsApi(accessToken);
    await layoutsApi.deleteSubLayout({ subLayoutId });

    const updatedSubLayouts = produce(subLayouts, draft => {
      const subLayoutIndex = draft.findIndex(layout => layout.id === subLayoutId);
      if (subLayoutIndex > -1) {
        draft.splice(subLayoutIndex, 1);
      }
    });

    this.clearDialog();
    this.props.setSubLayouts(updatedSubLayouts);
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
    subLayouts: state.subLayouts.subLayouts,
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
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
    setSubLayouts: (subLayouts: SubLayout[]) => dispatch(setSubLayouts(subLayouts)),
    setSelectedSubLayout: (subLayout: SubLayout) => dispatch(setSelectedSubLayout(subLayout))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutsScreen));