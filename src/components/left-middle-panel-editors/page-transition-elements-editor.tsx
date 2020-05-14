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
class PageTransitionsElementsEditor extends React.Component<Props, State> {

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
          text={ strings.exhibition.pageSettingsEditor.dialog.addElementPair }
          color="secondary"
          icon={ <AddIcon /> }
          onClick={ () => this.onAddElementPairClick() }
        />
      );
    }

    return (<>
      <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.elementPairs }</Typography>
      <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
        { this.getElementPairs() }
      </Grid>
      <GenericButton
        text={ strings.exhibition.pageSettingsEditor.dialog.addElementPair }
        color="secondary"
        icon={ <AddIcon /> }
        onClick={ () => this.onAddElementPairClick() }
      />
   </>);
  }

  /**
   * Get element pair elements
   */
  private getElementPairs() {
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

    return selectedTransition.options.morph.views.map((element, index) => {
      return (<>
        <Grid item xs={ 5 }>
          { this.renderSourceSelect(element, index, sourcePageLayout) }
        </Grid>
        <Grid item xs={ 5 }>
          { this.renderTargetSelect(element, index, targetLayouts) }
        </Grid>
        <Grid item xs={ 2 }>
          <IconButton color="primary" onClick={ () => this.onDeleteElementPair(index) }>
            <DeleteIcon />
          </IconButton>
        </Grid>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
      </>);
    });
  }

  /**
   * Render source select
   * @param element exhibition page transition options morph view
   * @param index view index
   * @param sourcePageLayout source page layout
   */
  private renderSourceSelect = (element: ExhibitionPageTransitionOptionsMorphView, index: number, sourcePageLayout: PageLayout) => {

    return (<>
      <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.startOfTransition }</Typography>
      <Select
        fullWidth
        label={ element.sourceId }
        id="sourceId"
        onChange={ e => this.handleResourceSelectChange(e, index) }
        name="sourceId"
        value={ element.sourceId }
      >
        { this.getSourceLayoutElements(sourcePageLayout) }
      </Select>
    </>);
  }

  /**
   * Render target select
   * @param element exhibition page transition options morph view
   * @param index view index
   * @param sourcePageLayout list of target page layouts
   */
  private renderTargetSelect = (element: ExhibitionPageTransitionOptionsMorphView, index: number, targetLayouts: PageLayout[]) => {
    const { selectedTransition } = this.props;
    return (<>
      <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.endOfTransition }</Typography>
      <Select
        fullWidth
        label={ element.targetId }
        id="targetId"
        onChange={ e => this.handleResourceSelectChange(e, index) }
        name="targetId"
        value={ selectedTransition.targetLayoutId + ":" + element.targetId }
      >
        { this.getTargetLayoutElements(targetLayouts) }
      </Select>
    </>);
  }

  /**
   * Select change event handler
   * @param event change event
   */
  private handleResourceSelectChange = (event: React.ChangeEvent<{ name?: string | undefined; value: any }>, index: number) => {
    const { selectedTransition } = this.props;

    const key = event.target.name as string;
    const value = event.target.value as string;

    const transitionToUpdate = selectedTransition;
    if (!transitionToUpdate || !transitionToUpdate.options || !transitionToUpdate.options.morph || !transitionToUpdate.options.morph.views) {
      return;
    }

    if (value.includes(":")) {
      const split = value.split(":");
      const targetLayoutId = split[0];
      const targetElement = split[1];
      transitionToUpdate.targetLayoutId = targetLayoutId;
      transitionToUpdate.options.morph.views[index] = { ...transitionToUpdate.options.morph.views[index], [key] : targetElement};
      this.props.onTransitionUpdate(transitionToUpdate);
      return;
    }

    transitionToUpdate.options.morph.views[index] = { ...transitionToUpdate.options.morph.views[index], [key] : value};
    this.props.onTransitionUpdate(transitionToUpdate);
  }

  /**
   * On add element pair click handler
   */
  private onAddElementPairClick = () => {
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
   * On delete element pair handler
   * @param index element pair to delete
   */
  private onDeleteElementPair = (index: number) => {
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
  private getTargetLayoutElements = (layouts: PageLayout[]) => {
    return layouts.map(layout => {
      return layout.data.children.map(element => {
        const value = layout.id + ":" + element.id;
        return <MenuItem value={ value }>{ layout.name + " : " + element.id }</MenuItem>;
      });
    });
  }

  /**
   * Generate source layout select menu items
   */
  private getSourceLayoutElements = (layout: PageLayout) => {
    return layout.data.children.map(element => {
      return <MenuItem value={ element.id }>{ element.id }</MenuItem>;
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PageTransitionsElementsEditor));