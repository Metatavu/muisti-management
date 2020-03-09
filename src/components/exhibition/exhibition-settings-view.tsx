import * as React from "react";
import { v4 as uuidv4 } from 'uuid';

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";

import { History } from "history";
import styles from "../../styles/exhibition-view";
import { WithStyles, withStyles, CircularProgress, Typography, Button} from "@material-ui/core";
import { KeycloakInstance } from "keycloak-js";
import { Exhibition, PageLayout, ExhibitionPage } from "../../generated/client";
import BasicLayout from "../generic/basic-layout";
import ViewSelectionBar from "../editor-panes/view-selection-bar";
import ElementSettingsPane from "../editor-panes/element-settings-pane";
import ElementNavigationPane from "../editor-panes/element-navigation-pane";
import EditorView from "../editor/editor-view";
import { AccessToken } from '../../types';
import { setExhibition } from "../../actions/exhibition";
import Api from "../../api/api";
import ExhibitionSettingsLayoutEditView from "./exhibition-settings-layout-edit-view";
import ExhibitionSettingsPageEditView from "./exhibition-settings-page-edit-view";
import AddIcon from "@material-ui/icons/AddSharp";
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

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
  layouts: PageLayout[],
  pages: ExhibitionPage[],
  editLayout?: PageLayout,
  editPage?: ExhibitionPage
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
      layouts: [],
      pages: []
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
      
      const pageLayoutsApi = Api.getPageLayoutsApi(accessToken);
      const exhibitionPagesApi = Api.getExhibitionPagesApi(accessToken);

      const [ layouts, pages ] = await Promise.all([
        pageLayoutsApi.listPageLayouts(),
        exhibitionPagesApi.listExhibitionPages({
          exhibitionId: exhibitionId
        })
      ]);

      this.setState({
        layouts: layouts,
        pages: pages 
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
          <ElementSettingsPane title="Ominaisuudet" />
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders editor view
   */
  private renderNavigation = () => {
    return (
      <div>
        <TreeView defaultCollapseIcon={ <ExpandMoreIcon /> } defaultExpandIcon={ <ChevronRightIcon /> }>
          { this.renderLayoutsNavigation() }
          { this.renderPagesNavigation() }
        </TreeView>

        <Button variant="outlined" color="primary"  onClick={ this.onAddLayoutClick } startIcon={ <AddIcon />  }>Add layout </Button>
        <Button variant="outlined" color="primary"  onClick={ this.onAddPageClick } startIcon={ <AddIcon />  }>Add page </Button>
      </div>
    );
  }

  /**
   * Renders layouts navigation
   */
  private renderLayoutsNavigation = () => {
    const items = this.state.layouts.map(layout => {
      return <TreeItem nodeId={ layout.id! } label={ layout.name } onClick={ () => this.onEditLayoutClick(layout) } />;
    });

    return (
      <TreeItem nodeId="layouts" label="Layout">
        { items }
      </TreeItem>
    );
  }

  /**
   * Renders pages navigation
   */
  private renderPagesNavigation = () => {
    const items = this.state.pages.map(page => {
      return <TreeItem nodeId={ page.id! } label={ page.name } onClick={ () => this.onEditPageClick(page) } />;
    });

    return (
      <TreeItem nodeId="pages" label="Page">
        { items }
      </TreeItem>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditorView = () => {
    if (this.state.editLayout) {
      return (
        <ExhibitionSettingsLayoutEditView 
          key={ this.state.editLayout.id || "new-layout" } 
          layout={ this.state.editLayout } 
          onSave={ this.onLayoutSave }
          onDelete={ this.onLayoutDelete }/>
      )
    }

    if (this.state.editPage) {
      return (
        <ExhibitionSettingsPageEditView 
          key={ this.state.editPage.id || "new-page" }
          layouts={ this.state.layouts } 
          page={ this.state.editPage }
          onSave={ this.onPageSave }/>
      );
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
   * Event handler for layout delete 
   * 
   * @param layout layout
   */
  private onLayoutDelete = async (layout: PageLayout) => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(this.props.accessToken);
      const pageLayoutId = layout.id!!;
      
      await pageLayoutsApi.deletePageLayout({
        pageLayoutId: pageLayoutId
      });

      this.setState({
        editLayout: undefined,
        layouts: this.state.layouts.filter(layout => layout.id !== pageLayoutId)
      });
    } catch (e) {
      console.error(e);

      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for layout save 
   * 
   * @param layout layout
   */
  private onLayoutSave = async (layout: PageLayout) => {
    try {
      const pageLayoutsApi = Api.getPageLayoutsApi(this.props.accessToken);
      
      const updatedLayout = await pageLayoutsApi.updatePageLayout({
        pageLayoutId: layout.id!!,
        pageLayout: layout
      });

      const layouts = this.state.layouts.filter(layout => layout.id !== updatedLayout.id);

      this.setState({
        layouts: [ ...layouts, layout ]
      });
    } catch (e) {
      console.error(e);

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
      const pageLayoutsApi = Api.getPageLayoutsApi(this.props.accessToken);
      
      const layout = await pageLayoutsApi.createPageLayout({
        pageLayout: {
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
        layouts: [ ...this.state.layouts, layout ]
      });
    } catch (e) {
      this.setState({
        error: e
      });
    }
  }

  /**
   * Event handler for add page click
   */
  private onAddPageClick = () => {
    this.setState({
      editPage: undefined,
      editLayout: undefined
    });

    const layoutId = this.state.layouts && this.state.layouts.length ? this.state.layouts[0].id : null;

    if (!layoutId) {
      return null;
    }

    const newPage: ExhibitionPage = {
      layoutId: layoutId,
      name: "New Page",
      eventTriggers: [],
      resources: []
    }

    this.setState({
      editPage: newPage,
      editLayout: undefined
    });
  }

  /**
   * Event handler for page save
   * 
   * @param page page
   */
  private onPageSave = async (page: ExhibitionPage) => {
    try {
      const exhibitionPagesApi = Api.getExhibitionPagesApi(this.props.accessToken);
      
      if (page.id) {
        const updatedPage = await exhibitionPagesApi.updateExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          pageId: page.id,
          exhibitionPage: page
        });

        const pages = this.state.pages.filter(page => page.id !== updatedPage.id);

        this.setState({
          pages: [ ...pages, updatedPage ]
        });

      } else {
        const createdPage = await exhibitionPagesApi.createExhibitionPage({
          exhibitionId: this.props.exhibitionId,
          exhibitionPage: page
        });

        this.setState({
          pages: [ ...this.state.pages, createdPage ]
        });
      }
    } catch (e) {
      console.error(e);

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
  private onEditLayoutClick = (layout: PageLayout) => {
    this.setState({
      editLayout: layout,
      editPage: undefined
    });
  }

  /**
   * Event handler for edit layout link click
   * 
   * @param layout layout
   */
  private onEditPageClick = (page: ExhibitionPage) => {
    this.setState({
      editLayout: undefined,
      editPage: page
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