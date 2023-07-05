import { ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/components/generic/basic-layout";
import { ActionButton, BreadcrumbData } from "../../types";
import ErrorDialog from "../generic/error-dialog";
import TopBar from "../generic/top-bar";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { Beforeunload } from "react-beforeunload";
import { Prompt } from "react-router-dom";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  title: string;
  keycloak: KeycloakInstance;
  history: History;
  breadcrumbs: BreadcrumbData[];
  actionBarButtons?: ActionButton[];
  noBackButton?: boolean;
  error?: string | Error;
  devices?: ExhibitionDevice[];
  dataChanged?: boolean;
  openDataChangedPrompt?: boolean;
  hideHeader?: boolean;
  setSelectedDevice?: (deviceId: string) => ExhibitionDevice | undefined;
  clearError?: () => void;
  children?: React.ReactNode;
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
}

/**
 * Component for basic application layout
 */
class BasicLayout extends React.Component<Props, State> {
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
   * Render basic layout
   */
  public render() {
    const {
      classes,
      history,
      title,
      breadcrumbs,
      actionBarButtons,
      noBackButton,
      keycloak,
      dataChanged,
      openDataChangedPrompt,
      hideHeader,
      children
    } = this.props;
    return (
      <div className={classes.root}>
        <TopBar
          history={history}
          keycloak={keycloak}
          breadcrumbs={breadcrumbs}
          actionBarButtons={actionBarButtons}
          noBackButton={noBackButton}
          title={title}
          hideHeader={hideHeader}
        />
        <div className={classes.content}>{this.props.children}</div>
        {this.renderErrorDialog()}
        {dataChanged && <Prompt when={dataChanged} message={strings.generic.unsaved} />}
        {openDataChangedPrompt && <Beforeunload onBeforeunload={() => ""} />}
      </div>
    );
  }

  /**
   * Renders error dialog
   */
  private renderErrorDialog = () => {
    if (this.props.error && this.props.clearError) {
      return <ErrorDialog error={this.props.error} onClose={this.props.clearError} />;
    }

    return null;
  };
}

export default withStyles(styles)(BasicLayout);
