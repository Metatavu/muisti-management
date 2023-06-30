import { Exhibition } from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/exhibition-view";
import { AccessToken, ActionButton } from "../../types";
import CardItem from "../generic/card/card-item";
import CardList from "../generic/card/card-list";
import BasicLayout from "../layouts/basic-layout";
import { CircularProgress } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

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
 * Component for floorplans screen
 */
class FloorPlansScreen extends React.Component<Props, State> {
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
    const actionBarButtons = this.getActionButtons();

    if (this.state.loading) {
      return (
        <BasicLayout
          keycloak={keycloak}
          history={history}
          title={strings.spaces.title}
          breadcrumbs={[]}
          actionBarButtons={actionBarButtons}
          noBackButton
        >
          <div className={classes.loader}>
            <CircularProgress size={50} color="secondary"></CircularProgress>
          </div>
        </BasicLayout>
      );
    }

    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={strings.spaces.title}
        breadcrumbs={[]}
        actionBarButtons={actionBarButtons}
        noBackButton
      >
        {this.renderExhibitionCardsList()}
      </BasicLayout>
    );
  };

  /**
   * Renders exhibitions as card list
   */
  private renderExhibitionCardsList = () => {
    const { exhibitions } = this.props;
    const cards = exhibitions.map((exhibition) => {
      const exhibitionId = exhibition.id;
      if (!exhibitionId) {
        return null;
      }

      return (
        <CardItem
          key={exhibition.id}
          title={exhibition.name}
          onClick={() => this.onCardClick(exhibitionId)}
        />
      );
    });

    return (
      <CardList
        title={strings.floorPlan.exhibitions}
        subtitle={strings.floorPlan.exhibitionsDescription}
      >
        {cards}
      </CardList>
    );
  };

  /**
   * Gets card menu options
   *
   * @returns card menu options as action button array
   */
  private getCardMenuOptions = (): ActionButton[] => {
    return [
      {
        name: strings.exhibitions.cardMenu.setStatus,
        action: this.setStatus
      }
    ];
  };

  /**
   * Gets action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = () => {
    return [];
  };

  /**
   * Event handler for card click
   */
  private onCardClick = (exhibitionId: string) => {
    const { pathname } = this.props.history.location;
    this.props.history.push(`${pathname}/${exhibitionId}`);
  };

  /**
   * Event handler for set status
   */
  private setStatus = () => {
    alert(strings.comingSoon);
    return;
  };
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
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FloorPlansScreen));
