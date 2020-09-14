import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, TextField } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition } from "../../generated/client";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";
import GenericDialog from "../generic/generic-dialog";
import Api from "../../api/api";
import { setExhibitions } from "../../actions/exhibitions";
import produce from "immer";
import ConfirmDialog from "../generic/confirm-dialog";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  setExhibitions: typeof setExhibitions;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  addDialogOpen: boolean;
  deleteDialogOpen: boolean;
  selectedExhibition?: Exhibition;
}

/**
 * Component for exhibitions screen
 */
export class ExhibitionsScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      addDialogOpen: false,
      deleteDialogOpen: false
    };
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, history, keycloak } = this.props;
    if (this.state.loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    const actionBarButtons = this.getActionButtons();
    return (
      <BasicLayout
        keycloak={ keycloak }
        history={ history }
        title={ strings.exhibitions.listTitle }
        breadcrumbs={ [] }
        actionBarButtons={ actionBarButtons }
        noBackButton
      >
        { this.renderProductionCardsList() }
        { this.renderAddDialog() }
        { this.renderConfirmDeleteDialog() }
      </BasicLayout>
    );
  }

  /**
   * Renders exhibitions in production as card list
   */
  private renderProductionCardsList = () => {
    const { exhibitions } = this.props;
    const cards = exhibitions.map(exhibition => {
      const cardMenuOptions = this.getCardMenuOptions(exhibition);
      const exhibitionId = exhibition.id;
      if (!exhibitionId) {
        return null;
      }

      return (
        <CardItem
          size="large"
          key={ exhibition.id }
          title={ exhibition.name }
          onClick={ () => this.onCardClick(exhibitionId) }
          menuOptions={ cardMenuOptions }
          status={ strings.exhibitions.status.ready }
        />
      );
    });

    return (
      <CardList title={ strings.exhibitions.inProduction }>
        { cards }
      </CardList>
    );
  }

  /**
   * Renders add exhibition dialog
   */
  private renderAddDialog = () => {
    const { selectedExhibition } = this.state;
    if (selectedExhibition) {
      return (
        <GenericDialog
          cancelButtonText={ strings.genericDialog.cancel }
          positiveButtonText={ strings.genericDialog.save }
          title={ strings.exhibitions.createExhibitionDialog.title }
          error={ false }
          onConfirm={ this.onDialogSaveClick }
          onCancel={ this.onCloseOrCancelClick }
          open={ this.state.addDialogOpen }
          onClose={ this.onCloseOrCancelClick }
        >
          <TextField
            fullWidth
            variant="outlined"
            label={ strings.generic.name }
            name="name"
            value={ selectedExhibition.name }
            onChange={ this.onExhibitionDataChange }
          />
        </GenericDialog>
      );
    }
  }

  /**
   * Renders delete confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    const { selectedExhibition } = this.state;
    if (selectedExhibition) {
      const description = strings.formatString(
        strings.exhibitions.deleteExhibitionDialog.description,
        selectedExhibition.name) as string;
      return (
        <ConfirmDialog
          open={ this.state.deleteDialogOpen }
          title={ strings.exhibitions.deleteExhibitionDialog.title }
          text={ description }
          onClose={ this.onCloseOrCancelClick }
          onCancel={ this.onCloseOrCancelClick }
          onConfirm={ () => this.deleteExhibition(selectedExhibition) }
          positiveButtonText={ strings.confirmDialog.delete }
          cancelButtonText={ strings.confirmDialog.cancel }
        />
      );
    }
  }

  /**
   * Gets card menu options for exhibition card
   *
   * @param exhibition exhibition
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (exhibition: Exhibition): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.delete,
      action: () => this.onDeleteExhibitionClick(exhibition)
    }];
  }

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    return [
      { name: strings.dashboard.newExhibitionButton, action: this.onNewExhibitionClick }
    ];
  }

  /**
   * Event handler for card click
   */
  private onCardClick = (exhibitionId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/${exhibitionId}/content`);
  }

  /**
   * Event handler for new exhibition click
   */
  private onNewExhibitionClick = () => {
    const newExhibition: Exhibition = { name: "" };

    this.setState({
      addDialogOpen: true,
      selectedExhibition: newExhibition
    });
  }

  /**
   * Event handler for exhibition data change
   * 
   * @param event event
   */
  private onExhibitionDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedExhibition } = this.state;
    const { name, value } = event.target;
    if (!selectedExhibition || !name) {
      return;
    }

    this.setState(
      produce((draft: State) => {
        draft.selectedExhibition = { ...draft.selectedExhibition!, [name]: value }
      })
    );
  }

  /**
   * Event handler for exhibition delete click
   * 
   * @param selectedExhibition exhibition
   */
  private onDeleteExhibitionClick = (selectedExhibition: Exhibition) => {
    this.setState({
      selectedExhibition,
      deleteDialogOpen: true
    });
  }

  /**
   * Event handler for dialog save click
   */
  private onDialogSaveClick = async () => {
    const { accessToken, exhibitions } = this.props;
    const { selectedExhibition } = this.state;
    if (!accessToken || !selectedExhibition) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const newExhibition = await exhibitionsApi.createExhibition({
      exhibition: selectedExhibition
    });

    this.props.setExhibitions(
      produce(exhibitions, draft => {
        draft.push(newExhibition)
      })
    );

    this.setState({
      addDialogOpen: false,
      selectedExhibition: undefined
    });
  }

  /**
   * Event handler for close or cancel click
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addDialogOpen: false,
      deleteDialogOpen: false,
      selectedExhibition: undefined
    });
  }

  /**
   * Deletes exhibition
   * 
   * @param selectedExhibition exhibition
   */
  private deleteExhibition = async (selectedExhibition: Exhibition) => {
    const { accessToken, exhibitions } = this.props;
    const exhibitionId = selectedExhibition.id;
    if (!accessToken || !exhibitionId) {
      return;
    }

    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    await exhibitionsApi.deleteExhibition({ exhibitionId });

    this.props.setExhibitions(
      produce(exhibitions, draft => {
        const exhibitionIndex = exhibitions.findIndex(exhibition => exhibition.id === selectedExhibition.id)
        if (exhibitionIndex > -1) {
          draft.splice(exhibitionIndex, 1)
        }
      })
    );

    this.setState({
      deleteDialogOpen: false,
      selectedExhibition: undefined
    });
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
    exhibitions: state.exhibitions.exhibitions
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setExhibitions: (exhibitions: Exhibition[]) => dispatch(setExhibitions(exhibitions))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionsScreen));
