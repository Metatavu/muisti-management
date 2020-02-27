import * as React from "react";
import { v4 as uuidv4 } from 'uuid';

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, Typography, Link } from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { Exhibition, ExhibitionPageLayout } from "../../generated/client";
import BasicLayout from "../generic/basic-layout";
import ViewSelectionBar from "../editor-panes/view-selection-bar";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken } from '../../types';
import { setExhibition } from "../../actions/exhibition";
import Api from "../../api/api";
import { Link as RouterLink } from 'react-router-dom';
import ExhibitionSettingsLayoutEditView from "./exhibition-settings-layout-edit-view";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History,
  keycloak: KeycloakInstance,
  accessToken: AccessToken,
  exhibitionId: string,
  exhibition?: Exhibition,
  setExhibition: typeof setExhibition
}

/**
 * Component state
 */
interface State {
  error?: Error,
  loading: boolean,
  layoutsOpen: boolean,
  layouts: ExhibitionPageLayout[],
  editLayout?: ExhibitionPageLayout
}

/**
 * Component for exhibition view
 */
export class ExhibitionDeviceGroupView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      layoutsOpen: false,
      layouts: []
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    const { exhibition, exhibitionId, accessToken } = this.props;

    this.setState({
      loading: true
    });

    try {
      if (!exhibition || exhibitionId === exhibition.id) {
        const exhibitionsApi = Api.getExhibitionsApi(accessToken);
        this.props.setExhibition(await exhibitionsApi.findExhibition({ exhibitionId: exhibitionId }));
      } 
      
      const exhibitionPageLayoutsApi = Api.getExhibitionPageLayoutsApi(accessToken);
      const layouts = await exhibitionPageLayoutsApi.listExhibitionPageLayouts({
        exhibitionId: exhibitionId
      });

      this.setState({
        layouts: layouts
      });

    } catch (e) {
      this.setState({
        error: e
      });
    }

    this.setState({
      loading: false
    });
  }

  /**
   * Component render method
   */
  public render = () => {
    const { classes, exhibition, history } = this.props;

    if (!exhibition || !exhibition.id || this.state.loading ) {
      return (
        <CircularProgress></CircularProgress>
      );
    }

    const locationPath = history.location.pathname;

    return (
      <BasicLayout title={ exhibition.name } onBackButtonClick={() => this.onBackButtonClick() } keycloak={ this.props.keycloak } error={ this.state.error } clearError={ () => this.setState({ error: undefined }) }>
        <div className={ classes.editorLayout }>
          <ViewSelectionBar exhibitionId={ exhibition.id } locationPath={ locationPath } />
          <ElementNavigationPane title="Asetukset">
            { this.renderNavigation() }
          </ElementNavigationPane>
          <EditorView>
            { this.renderEditorView() }
          </EditorView>
          <ElementSettingsPane title="Jokin" />
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders editor view
   */
  private renderNavigation = () => {
    const items = [
      <Link style={{ display: "block" }} onClick={ this.onLayoutClick }> Layout </Link>
    ];

    if (this.state.layoutsOpen) {
      items.push(<Link style={{ display: "block" }} onClick={ this.onAddLayoutClick }> + Add layout </Link>);

      this.state.layouts.forEach(layout => {
        items.push(<Link style={{ display: "block" }} onClick={ () => this.onEditLayoutClick(layout) }> { layout.name } </Link>);
      });
    }

    return items;
  }

  /**
   * Renders editor view
   */
  private renderEditorView = () => {
    if (this.state.layoutsOpen && this.state.editLayout) {
      return (
        <ExhibitionSettingsLayoutEditView key={ this.state.editLayout.id! } 
          layout={ this.state.editLayout } 
          onSave={ this.onLayoutSave }/>
      )
    }

    return (
      <Typography>Olen näyttelyn asetussivu</Typography>
    );
  }

  /**
   * Handle back
   */
  private onBackButtonClick = () => {
    this.props.history.push(`/`);
  }

  /**
   * Event handler for layout click
   */
  private onLayoutClick = () => {
    this.setState({
      layoutsOpen: true
    });
  }

  /**
   * Event handler for layout save 
   * 
   * @param layout layout
   */
  private onLayoutSave = async (layout: ExhibitionPageLayout) => {
    try {
      const exhibitionPageLayoutsApi = Api.getExhibitionPageLayoutsApi(this.props.accessToken);
      
      const updatedLayout = await exhibitionPageLayoutsApi.updateExhibitionPageLayout({
        exhibitionId: this.props.exhibitionId,
        pageLayoutId: layout.id!!,
        exhibitionPageLayout: layout
      });

      const layouts = this.state.layouts.filter(layout => layout.id != updatedLayout.id);

      this.setState({
        layouts: [ ... layouts, layout ]
      });
    } catch (e) {
      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for add layout click
   */
  private onAddLayoutClick = async () => {
    try {
      const exhibitionPageLayoutsApi = Api.getExhibitionPageLayoutsApi(this.props.accessToken);
      
      const layout = await exhibitionPageLayoutsApi.createExhibitionPageLayout({
        exhibitionId: this.props.exhibitionId,
        exhibitionPageLayout: {
          name: "New",
          data: {
            id: uuidv4(),
            children: [],
            properties: [],
            widget: "LinearLayout"
          }
        }
      });

      this.setState({
        layouts: [ ... this.state.layouts, layout ]
      });
    } catch (e) {
      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for edit layout link click
   * 
   * @param layout layout
   */
  private onEditLayoutClick = (layout: ExhibitionPageLayout) => {
    this.setState({
      editLayout: layout
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
    exhibition: state.exhibition.exhibition as Exhibition
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setExhibition: (exhibition: Exhibition) => dispatch(setExhibition(exhibition))
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionDeviceGroupView));