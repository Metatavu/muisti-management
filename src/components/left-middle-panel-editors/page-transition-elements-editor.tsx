import * as React from "react";
import { ExhibitionPage, ExhibitionPageResource, AnimationOption } from "../../generated/client";
import { WithStyles, withStyles, MenuItem, Select, Typography, Grid, Divider, IconButton } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux"
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
  selectedTargetPageId: string;
  animationOptions?: AnimationOption[];

  /**
   * On animation option change handler
   * @param animationOptions list of animation options
   */
  onAnimationOptionChange: (animationOptions: AnimationOption[]) => void;
}

/**
 * Interface for storing animation options
 */
interface AnimationOptionPairsHolder {
  startPageId: string;
  startPageResource: string;
  endPageId: string;
  endPageResource: string;
}

/**
 * Interface representing component state
 */
interface State {
  selectedTargetPage?: any;
  animationOptionPairs: AnimationOptionPairsHolder[];
}

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
      animationOptionPairs : [],
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { animationOptions } = this.props;

    if (!animationOptions || !animationOptions[0]) {
      return;
    }

    const options = animationOptions[0];
    const tempList: AnimationOptionPairsHolder[] = [];
    this.updateOptionPairs(options, tempList);

    this.setState({
      animationOptionPairs : tempList
    });
  }

  /**
   * Component did update life cycle handler
   */
  public componentDidUpdate = (prevProps: Props) => {

    if (prevProps.animationOptions !== this.props.animationOptions) {
      const { animationOptions } = this.props;
      if (!animationOptions || !animationOptions[0]) {
        this.setState({
          animationOptionPairs : []
        });
        return;
      }

      const options = animationOptions[0];
      const tempList: AnimationOptionPairsHolder[] = [];
      this.updateOptionPairs(options, tempList);

      this.setState({
        animationOptionPairs : tempList
      });
    }

  }

  /**
   * Update option pairs handler
   * @param options animation option to update
   * @param tempList temporary list for storing animation option pairs data
   */
  private updateOptionPairs(options: AnimationOption, tempList: AnimationOptionPairsHolder[]) {
    options.values.map(element => {
      const split = element.split(":");
      /**
       * TODO: These fields should probably be in the spec.
       */
      const newDataHolder: AnimationOptionPairsHolder = {
        startPageId: split[0].split(",")[0],
        startPageResource: split[0].split(",")[1],
        endPageId: split[1].split(",")[0],
        endPageResource: split[1].split(",")[1],
      };
      tempList.push(newDataHolder);
    });
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
    const { exhibitionPage } = this.props;
    const { animationOptionPairs } = this.state;
    if (!animationOptionPairs) {
      return (
        <div/>
      );
    }
    const elementPairs = animationOptionPairs.map((element, index) => {

      return (<>
        <Grid item xs={ 5 }>
        <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.startOfTransition }</Typography>
          <Select
            fullWidth
            label={ element.startPageResource }
            id="startPageResource"
            onChange={ e => this.handleResourceSelectChange(e, index) }
            name="startPageResource"
            value={ element.startPageResource }
            >
              { this.getOptionsSelectItems(exhibitionPage.resources) }
          </Select>
        </Grid>
        <Grid item xs={ 5 }>
          <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.endOfTransition }</Typography>
          <Select
            fullWidth
            label={ element.endPageResource }
            id="endPageResource"
            onChange={ e => this.handleResourceSelectChange(e, index) }
            name="endPageResource"
            value={ element.endPageResource }
          >
            { this.getPossibleElements(this.getPages()) }
          </Select>
        </Grid>
        <Grid item xs={ 2 }>
          <IconButton
            color="primary"
            onClick={ () => this.onDeleteElementPair(index) }
          >
            <DeleteIcon />
          </IconButton>
        </Grid>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
      </>);
    });

    return (<>
      <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.elements }</Typography>
      <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
        { elementPairs }
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
   * Get exhibition pages for device
   */
  private getPages = (): ExhibitionPage[] => {
    const { exhibitionPages, selectedTargetPageId } = this.props;
    return exhibitionPages.filter(page => page.id === selectedTargetPageId);
  }

  /**
   * Select change event handler
   * @param event change event
   */
  private handleResourceSelectChange = (event: React.ChangeEvent<{ name?: string | undefined; value: any }>, index: number) => {
    const { animationOptionPairs } = this.state;

    const key = event.target.name;
    const value = event.target.value as string;

    if (!animationOptionPairs || !key || !animationOptionPairs[index]) {
      return;
    }

    const test = { ...animationOptionPairs[index], [key] : value }
    const newList = animationOptionPairs;
    newList.splice(index, 1, test);
    this.setState({
      animationOptionPairs : newList
    });
    this.updateAnimationOptions(newList);
  }

  /**
   * On add element pair click handler
   */
  private onAddElementPairClick = () => {
    const { animationOptionPairs } = this.state;
    if (!animationOptionPairs) {
      return;
    }

    const elementPairToAdd: AnimationOptionPairsHolder = {
      startPageId: this.props.exhibitionPage.id || "",
      startPageResource: "",
      endPageId: this.props.selectedTargetPageId || "",
      endPageResource: "",
    };

    const animationElementPairList = [ ...this.state.animationOptionPairs, elementPairToAdd ];
    this.createNewOption(animationElementPairList);
  }

  /**
   * On delete element pair handler
   * @param index element pair to delete
   */
  private onDeleteElementPair = (index: number) => {
    const { animationOptionPairs } = this.state;

    if (!animationOptionPairs || !animationOptionPairs[index]) {
      return;
    }

    const optionPairs = animationOptionPairs;
    optionPairs.splice(index, 1);

    this.updateAnimationOptions(optionPairs);
  }

  /**
   * Create new animation option handler
   * @param animationElementPairList list of element pairs
   */
  private createNewOption(animationElementPairList: AnimationOptionPairsHolder[]) {
    const optionsToUpdate: AnimationOption[] = [];
    const animationOption: AnimationOption = {
      name: "elements",
      values: []
    };
    animationElementPairList.map(item => {
      const value: string = item.startPageId + "," + item.startPageResource + ":" + item.endPageId + "," + item.endPageResource;
      animationOption.values.push(value);
    });
    optionsToUpdate.push(animationOption);
    this.props.onAnimationOptionChange(optionsToUpdate);

    this.setState({
      animationOptionPairs : animationElementPairList
    });
  }

  /**
   * Update animation options handler
   * @param optionPairs list of 
   */
  private updateAnimationOptions(animationElementPairList: AnimationOptionPairsHolder[]) {
    const { animationOptions } = this.props;
    if ( !animationOptions || !animationOptions[0]) {
      return;
    }
    const optionsToUpdate: AnimationOption[] = [];
    const animationOption = { ...animationOptions[0] };
    animationOption.values = [];
    animationElementPairList.map(item => {
      const temp: string = item.startPageId + "," + item.startPageResource + ":" + item.endPageId + "," + item.endPageResource;
      animationOption.values.push(temp);
    });
    optionsToUpdate.push(animationOption);
    this.props.onAnimationOptionChange(optionsToUpdate);

    this.setState({
      animationOptionPairs : animationElementPairList
    });
  }

  /**
   * Generate select items
   */
  private getOptionsSelectItems = (resources: ExhibitionPageResource[]) => {
    return resources.map(key => {
      return <MenuItem value={ key.id }>{ key.id }</MenuItem>;
    });
  }

  /**
   * Generate select items
   */
  private getPossibleElements = (pages: ExhibitionPage[]) => {
    return pages.map(page => {
      return page.resources.map(key => {
        return <MenuItem value={ key.id }>{ key.id }</MenuItem>;
      });
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