import * as React from "react";
import { ExhibitionPage, ExhibitionPageResource, ExhibitionPageEventTrigger, PageLayout, ExhibitionDevice, Transition, Animation, AnimationTimeInterpolation, AnimationOption } from "../../generated/client";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, Typography, List, ListItem, ListItemIcon, ListItemText, Grid, Divider } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux"
import strings from "../../localization/strings";
import GenericButton from "../generic/generic-button";
import AddIcon from "@material-ui/icons/AddSharp";
import DeleteIcon from '@material-ui/icons/Delete';
import EditorDialog from "../generic/editor-dialog";
import theme from "../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  exhibitionPage: ExhibitionPage;
  exhibitionDevices: ExhibitionDevice[];
  exhibitionPages: ExhibitionPage[];
  selectedTargetPageId: string;
  animationOptions?: AnimationOption[];
  onAnimationOptionChange: (animationOptions: AnimationOption[]) => void;
}

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

  private renderTransitionAnimationOptions() {
    const { exhibitionPage } = this.props;
    const { animationOptionPairs } = this.state;
    console.log(animationOptionPairs)
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
          <GenericButton
            color="secondary"
            icon={ <DeleteIcon /> }
            style={{ float: "right" }}
            onClick={ () => this.onDeleteOption(index) }
          />
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
        onClick={ () => this.onAddOptionParamClick() }
      />
   </>);
  }

  private getPages = (): ExhibitionPage[] => {
    const { exhibitionDevices, exhibitionPage, exhibitionPages, selectedTargetPageId } = this.props;

    const foundDevice = exhibitionDevices.find(device => device.id === exhibitionPage.deviceId);

    if (!foundDevice || !selectedTargetPageId) {
      return [];
    }

    const foundPages = exhibitionPages.filter(page => page.id === selectedTargetPageId);

    if (!foundPages) {
      return [];
    }

    return foundPages;
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

  private onAddOptionParamClick = () => {
    const { animationOptionPairs } = this.state;
    if (!animationOptionPairs) {
      return;
    }
    const optionToAdd: AnimationOptionPairsHolder = {
      startPageId: this.props.exhibitionPage.id || "",
      startPageResource: "",
      endPageId: this.props.selectedTargetPageId || "",
      endPageResource: "",
    } 
    const tempList = [ ...this.state.animationOptionPairs, optionToAdd ];
    this.setState({
      animationOptionPairs : tempList
    });

    const optionsToUpdate: AnimationOption[] = [];
    const asd: AnimationOption = {
      name: "elements",
      values: []
    }

    tempList.map(item => {
      const temp: string = item.startPageId + "," + item.startPageResource + ":" + item.endPageId + "," + item.endPageResource
      asd.values.push(temp);
    });
    optionsToUpdate.push(asd);

    this.props.onAnimationOptionChange(optionsToUpdate);
  }

  private onDeleteOption = (index: number) => {

    const { animationOptionPairs } = this.state;

    if (!animationOptionPairs || !animationOptionPairs[index]) {
      return;
    }

    const test = animationOptionPairs;
    test.splice(index, 1);
    this.setState({
      animationOptionPairs : test
    });

    this.updateAnimationOptions(test);
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


  private updateAnimationOptions(newList: AnimationOptionPairsHolder[]) {
    const { animationOptions } = this.props;
    if ( !animationOptions || !animationOptions[0]) {
      return;
    }
    const optionsToUpdate: AnimationOption[] = [];
    const asd = { ...animationOptions[0] };
    asd.values = [];
    newList.map(item => {
      const temp: string = item.startPageId + "," + item.startPageResource + ":" + item.endPageId + "," + item.endPageResource;
      asd.values.push(temp);
    });
    optionsToUpdate.push(asd);
    this.props.onAnimationOptionChange(optionsToUpdate);
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