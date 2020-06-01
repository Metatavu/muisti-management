import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
// eslint-disable-next-line max-len
import { PageLayout } from "../../generated/client";
import { AccessToken, ActionButton } from '../../types';
import strings from "../../localization/strings";
import CardList from "../generic/card/card-list";
import CardItem from "../generic/card/card-item";
import BasicLayout from "../generic/basic-layout";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  layouts: PageLayout[];
}

/**
 * Component state
 */
interface State {
  loading: boolean;
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
        title={ strings.layout.title }
        breadcrumbs={ [] }
        actionBarButtons={ actionBarButtons }
      >
        <div className={ classes.cardView }>
          { this.renderLayoutCardsList() }
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders layouts as card list
   */
  private renderLayoutCardsList = () => {
    const { layouts } = this.props;
    const cardMenuOptions = this.getCardMenuOptions();
    const cards = layouts.map(exhibition => {
      const layoutId = exhibition.id;
      if (!layoutId) {
        return null;
      }

      return (
        <CardItem
          key={ exhibition.id }
          title={ exhibition.name }
          onClick={ () => this.onCardClick(layoutId) }
          cardMenuOptions={ cardMenuOptions }
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
      { name: "add layout", action: () => null }
    ] as ActionButton[];
  }

  /**
   * Event handler for card click
   */
  private onCardClick = (layoutId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/${layoutId}`);
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
    layouts: state.layouts.layouts
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LayoutsScreen));
