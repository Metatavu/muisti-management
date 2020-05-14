import * as React from "react";
import { ExhibitionPage, PageLayout, ExhibitionPageTransition, ExhibitionPageTransitionOptionsMorphView } from "../../generated/client";
import { WithStyles, withStyles, MenuItem, Select, Typography, Grid, Divider, IconButton } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import strings from "../../localization/strings";
import GenericButton from "../generic/generic-button";
import AddIcon from "@material-ui/icons/AddSharp";
import DeleteIcon from '@material-ui/icons/Delete';
import theme from "../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  exhibitionPage: ExhibitionPage;
  exhibitionPages: ExhibitionPage[];
  selectedTransition: ExhibitionPageTransition;
  layouts: PageLayout[];

  /**
   * On transition update handler
   * @param transitionToUpdate transition to update
   */
  onTransitionUpdate: (transitionToUpdate: ExhibitionPageTransition) => void;
}

/**
 * Interface representing component state
 */
interface State { }

/**
 * Component for page settings editor
 */
class PageTransitionsViewsEditor extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      this.renderTransitionAnimationOptions()
    );
  }

  /**
   * Render transition animation options
   */
  private renderTransitionAnimationOptions() {
    const { selectedTransition } = this.props;

    if (!selectedTransition) {
      return (
        <GenericButton
          text={ strings.exhibition.pageSettingsEditor.dialog.addViewPair }
          color="secondary"
          icon={ <AddIcon /> }
          onClick={ () => this.onAddViewPairClick() }
        />
      );
    }

    return (<>
      <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.viewPairs }</Typography>
      <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
        { this.getViewPairs() }
      </Grid>
      <GenericButton
        text={ strings.exhibition.pageSettingsEditor.dialog.addViewPair }
        color="secondary"
        icon={ <AddIcon /> }
        onClick={ () => this.onAddViewPairClick() }
      />
    </>);
  }

  /**
   * Get view pair views
   */
  private getViewPairs() {
    const { selectedTransition } = this.props;

    const sourcePageLayout = this.findSourceLayout();
    const targetLayouts = this.findTargetLayouts();
    if (!selectedTransition ||
      !selectedTransition.options ||
      !selectedTransition.options.morph ||
      !selectedTransition.options.morph.views ||
      !sourcePageLayout) {
        return <div/>;
    }

    return selectedTransition.options.morph.views.map((view, index) => {
      return (<>
        <Grid item xs={ 5 }>
          { this.renderSourceSelect(view, index, sourcePageLayout) }
        </Grid>
        <Grid item xs={ 5 }>
          { this.renderTargetSelect(view, index, targetLayouts) }
        </Grid>
        <Grid item xs={ 2 }>
          <IconButton color="primary" onClick={ () => this.onDeleteViewPair(index) }>
            <DeleteIcon />
          </IconButton>
        </Grid>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
      </>);
    });
  }

  /**
   * Render source select
   * @param view exhibition page transition options morph view
   * @param index view index
   * @param sourcePageLayout source page layout
   */
  private renderSourceSelect = (view: ExhibitionPageTransitionOptionsMorphView, index: number, sourcePageLayout: PageLayout) => {

    return (<>
      <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.startOfTransition }</Typography>
      <Select
        fullWidth
        label={ view.sourceId }
        id="sourceId"
        onChange={ this.handleViewSelectChange(index) }
        name="sourceId"
        value={ view.sourceId }
      >
        { this.getSourceLayoutViews(sourcePageLayout) }
      </Select>
    </>);
  }

  /**
   * Render target select
   * @param view exhibition page transition options morph view
   * @param index view index
   * @param sourcePageLayout list of target page layouts
   */
  private renderTargetSelect = (view: ExhibitionPageTransitionOptionsMorphView, index: number, targetLayouts: PageLayout[]) => {
    const { selectedTransition } = this.props;
    return (<>
      <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.endOfTransition }</Typography>
      <Select
        fullWidth
        label={ view.targetId }
        id="targetId"
        onChange={ this.handleViewSelectChange(index) }
        name="targetId"
        value={ `${selectedTransition.targetLayoutId}:${view.targetId}` }
      >
        { this.getTargetLayoutViews(targetLayouts) }
      </Select>
    </>);
  }

  /**
   * Select view change event handler
   * @param index view index
   */
  private handleViewSelectChange = (index: number) => (event: React.ChangeEvent<{ name?: string | undefined; value: any }>) => {
    const { selectedTransition } = this.props;

    const key = event.target.name as string;
    const value = event.target.value as string;

    const transitionToUpdate = selectedTransition;
    if (!transitionToUpdate || !transitionToUpdate.options || !transitionToUpdate.options.morph || !transitionToUpdate.options.morph.views) {
      return;
    }

    if (value.includes(":")) {
      const valuePair = value.split(":");
      const targetLayoutId = valuePair[0];
      const targetView = valuePair[1];
      transitionToUpdate.targetLayoutId = targetLayoutId;
      transitionToUpdate.options.morph.views[index] = { ...transitionToUpdate.options.morph.views[index], [key] : targetView};
      this.props.onTransitionUpdate(transitionToUpdate);
    } else {
      transitionToUpdate.options.morph.views[index] = { ...transitionToUpdate.options.morph.views[index], [key] : value};
      this.props.onTransitionUpdate(transitionToUpdate); 
    }
  }

  /**
   * On add view pair click handler
   */
  private onAddViewPairClick = () => {
    const { selectedTransition } = this.props;

    const transitionToUpdate = selectedTransition;

    if (!transitionToUpdate.options) {
      transitionToUpdate.options = {
        morph: {
          views : [
            {
              sourceId: "",
              targetId: ""
            }
          ]
        }
      };
      this.props.onTransitionUpdate(transitionToUpdate);
      return;
    }

    if (!transitionToUpdate.options.morph) {
      return;
    }
    transitionToUpdate.options.morph.views.push({ sourceId: "", targetId: "" });
    this.props.onTransitionUpdate(transitionToUpdate);
  }

  /**
   * On delete view pair handler
   * @param index view pair to delete
   */
  private onDeleteViewPair = (index: number) => {
    const { selectedTransition } = this.props;

    const transitionToUpdate = selectedTransition;

    if (!transitionToUpdate || !transitionToUpdate.options || !transitionToUpdate.options.morph || !transitionToUpdate.options.morph.views) {
      return;
    }

    transitionToUpdate.options.morph.views.splice(index, 1);
    this.props.onTransitionUpdate(transitionToUpdate);
  }

  /**
   * Generate target layout select menu items
   */
  private getTargetLayoutViews = (layouts: PageLayout[]) => {
    return layouts.map(layout => {
      return layout.data.children.map(view => {
        return <MenuItem value={ `${layout.id}:${view.id}` }>{ layout.name + " : " + view.id }</MenuItem>;
      });
    });
  }

  /**
   * Generate source layout select menu items
   */
  private getSourceLayoutViews = (layout: PageLayout) => {
    return layout.data.children.map(view => {
      return <MenuItem value={ view.id }>{ view.id }</MenuItem>;
    });
  }

  /**
   * Find source layouts
   * @returns found page layout or undefined
   */
  private findSourceLayout = (): PageLayout | undefined => {
    const { layouts, exhibitionPage } = this.props;
    return layouts.find(layout => layout.id === exhibitionPage.layoutId);
  }

  /**
   * Find all possible target layouts
   * @returns list of page layouts
   */
  private findTargetLayouts = (): PageLayout[] => {
    const { layouts, exhibitionPages } = this.props;

    const layoutList: PageLayout[] = [];

    layouts.forEach(layout => {
      exhibitionPages.forEach(page => {
        if (page.layoutId === layout.id && !layoutList.includes(layout)) {
          layoutList.push(layout);
        }
      });
    });

    return layoutList;
  }
}
/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    layouts: state.layouts.layouts
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PageTransitionsViewsEditor));