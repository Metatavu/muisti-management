import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { Exhibition } from "../../generated/client";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../layouts/basic-layout";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
}

/**
 * Component state
 */
interface State {
  loading: boolean;
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
      loading: false
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
      </BasicLayout>
    );
  }

  /**
   * Renders exhibitions in production as card list
   */
  private renderProductionCardsList = () => {
    const { exhibitions } = this.props;
    const cardMenuOptions = this.getCardMenuOptions();
    const cards = exhibitions.map(exhibition => {
      const exhibitionId = exhibition.id;
      if (!exhibitionId) {
        return null;
      }

      return (
        <CardItem
          key={ exhibition.id }
          title={ exhibition.name }
          onClick={ () => this.onCardClick(exhibitionId) }
          cardMenuOptions={ cardMenuOptions }
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
   * Get card menu options
   *
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (): ActionButton[] => {
    return [{
      name: strings.exhibitions.cardMenu.setStatus,
      action: this.setStatus
    }];
  }

  /**
   * Get action buttons
   * 
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [
      { name: strings.dashboard.newExhibitionButton, action: () => null }
    ] as ActionButton[];
  }

  /**
   * Event handler for card click
   */
  private onCardClick = (exhibitionId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/${exhibitionId}/content`);
  }

  /**
   * Set status handler
   */
  private setStatus = () => {
    alert(strings.comingSoon);
    return;
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
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionsScreen));
