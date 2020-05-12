import * as React from "react";
import { ExhibitionPage, ExhibitionPageResource, ExhibitionPageEventTrigger, PageLayout, ExhibitionDevice, Transition, Animation, AnimationTimeInterpolation, AnimationOption } from "../../generated/client";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, Typography, List, ListItem, ListItemIcon, ListItemText, Grid, Divider, ListItemSecondaryAction } from "@material-ui/core";
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
import PageTransitionElementsEditor from "../left-middle-panel-editors/page-transition-elements-editor";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  exhibitionPage: ExhibitionPage;
  exhibitionDevices: ExhibitionDevice[];
  exhibitionPages: ExhibitionPage[];

  /**
   * On page transition change handler
   * @param transitions list of transitions to update
   * @param transitionType transition type ("exit" or "enter")
   */
  onPageTransitionChange: (transitions: Transition[], transitionType: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
  transitionDialogOpen: boolean;
  selectedTransition?: Transition; 
  selectedTransitionType?: string;
  selectedTransitionIndex?: number;
  selectedAnimationOption?: AnimationOption;
  selectedTargetPageId?: string;
}

/**
 * Component for page settings editor
 */
class PageTransitionsEditor extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      transitionDialogOpen: false,
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { exhibitionPage } = this.props;
    return (
      <>
        <Typography variant="h3">{ strings.exhibition.pageSettingsEditor.enterTransitions }</Typography>
        { this.renderPageTransitions("enter", exhibitionPage.enterTransitions) }
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />

        <Typography variant="h3">{ strings.exhibition.pageSettingsEditor.exitTransitions }</Typography>
        { this.renderPageTransitions("exit", exhibitionPage.exitTransitions) }
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />

        { this.renderTransitionDialog() }
      </>
    );
  }

  /**
   * Render page transition list
   * @param transitionType transition type
   * @param transitions list of transitions
   */
  private renderPageTransitions(transitionType: string, transitions: Transition[]) {

    const transitionItems = transitions.map((transition, transitionIndex) => {
      return (<>
        <ListItem button onClick={ () => this.onTransitionClick(transitionType, transition, transitionIndex) }>
          <Typography variant="h6">{ transition.animation }</Typography>
          <ListItemSecondaryAction>
            <GenericButton
              color="secondary"
              icon={ <DeleteIcon /> }
              style={{ float: "right" }}
              onClick={ () => this.onDeleteTransitionClick(transitionType, transitionIndex) }
            />
          </ListItemSecondaryAction>
        </ListItem>

      </>);
    });
    return (<>
      <List component="nav" aria-labelledby="nested-list-subheader">
        { transitionItems }
      </List>
      <GenericButton
        text={ strings.exhibition.pageSettingsEditor.addTransition }
        color="secondary"
        icon={ <AddIcon /> }
        onClick={ () => this.onAddTransitionClick(transitionType) }
      />
    </>);
  }

  /**
   * Render add/modify transition dialog
   */
  private renderTransitionDialog = () => {
    const { transitionDialogOpen } = this.state;

    return (
      <EditorDialog
        open={ transitionDialogOpen }
        error={ false }
        title={ strings.exhibition.pageSettingsEditor.addTransition }
        onClose={ this.onTransitionDialogClose }
        onCancel={ this.onTransitionDialogClose }
        onConfirm={ this.onTransitionDialogConfirm }
        positiveButtonText={ strings.editorDialog.save }
        cancelButtonText={ strings.editorDialog.cancel }
      >
        { this.renderDialogContent() }
      </EditorDialog>
    );
  }

  /**
   * Render dialog content
   */
  private renderDialogContent = () => {
    const { selectedTransition } = this.state;
    return (<>
        <Grid container spacing={ 2 } style={{ marginBottom: theme.spacing(1) }}>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.animation }</Typography>
            <Select
              fullWidth
              labelId={ strings.exhibition.pageSettingsEditor.dialog.animation }
              id="transitionDialogAnimation"
              onChange={ this.handleSelectChange }
              name="animation"
              value={ selectedTransition?.animation }
            >
              { this.getSelectItems(Object.keys(Animation)) }
            </Select>
          </Grid>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.timeInterpolation }</Typography>
            <Select
              fullWidth
              labelId={ strings.exhibition.pageSettingsEditor.dialog.timeInterpolation }
              id="transitionDialogTimeInterpolation"
              onChange={ this.handleSelectChange }
              name="timeInterpolation"
              value={ selectedTransition?.timeInterpolation }
              >
                { this.getSelectItems(Object.keys(AnimationTimeInterpolation)) }
              </Select>
          </Grid>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.duration }</Typography>
            <TextField
              fullWidth
              type="number"
              name="duration"
              value={ selectedTransition?.duration }
              onChange={ this.handleSelectChange }
            />
          </Grid>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.exhibition.pageSettingsEditor.dialog.availablePages }</Typography>
            { selectedTransition?.animation !== Animation.Fade &&
              this.renderTransitionElementEditor()
            }
          </Grid>
        </Grid>
    </>);
  }

  private renderTransitionElementEditor = () => {
    const { exhibitionDevices, exhibitionPages, exhibitionPage } = this.props;
    const { selectedTargetPageId, selectedTransition } = this.state;

    return (<>
      { this.renderAvailablePages() }
      <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />
      <PageTransitionElementsEditor
        exhibitionDevices={ exhibitionDevices }
        exhibitionPages={ exhibitionPages }
        exhibitionPage={ exhibitionPage }
        selectedTargetPageId={ selectedTargetPageId || this.getTargetPageId() }
        animationOptions={ selectedTransition?.options }
        onAnimationOptionChange={ this.handleAnimationOptionChange }
      />
    </>);
  }

  private renderAvailablePages = () => {
    const { exhibitionDevices, exhibitionPage, exhibitionPages } = this.props;
    const { selectedTargetPageId } = this.state;

    const foundDevice = exhibitionDevices.find(device => device.id === exhibitionPage.deviceId);

    if (!foundDevice) {
      return;
    }

    const foundPages = exhibitionPages.filter(page => page.deviceId === foundDevice.id);

    if (!foundPages) {
      return;
    }

    return (
      <Select
        fullWidth
        label={ "" }
        id="transitionDialogTargetPage"
        onChange={ this.handleSelectedPage }
        name="targetTransitionPage"
        value={ selectedTargetPageId || this.getTargetPageId() }
        >
          { this.getPossiblePages(foundPages) }
      </Select>
    );

  }

  /**
   * On transition click event handler
   * @param type transition type
   * @param clickedTransition clicked transition from list
   * @param transitionIndex clicked transition list index
   */
  private onTransitionClick = (type: string, clickedTransition: Transition, transitionIndex: number) => {
    this.setState({
      selectedTransition: clickedTransition,
      transitionDialogOpen: true,
      selectedTransitionType: type,
      selectedTransitionIndex: transitionIndex
    });
  }

  private handleAnimationOptionChange = (animationOptions: AnimationOption[]) => {

    const { selectedTransition } = this.state;
    console.log(selectedTransition);
    if (!selectedTransition) {
      return;
    }

    const transitionToUpdate = { ...selectedTransition }
    transitionToUpdate.options = animationOptions;
    console.log(transitionToUpdate);
    this.setState({
      selectedTransition: transitionToUpdate
    });
  }

  /**
   * Add transition click event handler
   * @param type transition type
   */
  private onAddTransitionClick = (type: string) => {

    const newTransition: Transition = {
      animation: Animation.Fade,
      duration: 0,
      timeInterpolation: AnimationTimeInterpolation.Acceleratedecelerate,
      options: []
    };
    let index = 0;
    if (type === "enter") {
      index = this.props.exhibitionPage.enterTransitions.length
    }

    if (type === "exit") {
      index = this.props.exhibitionPage.exitTransitions.length
    }

    this.setState({
      selectedTransition: newTransition,
      transitionDialogOpen: true,
      selectedTransitionType: type,
      selectedTransitionIndex : index
    });
  }

  /**
   * Delete transition click even handler
   * @param type transition type
   * @param transitionIndex clicked transition list index
   */
  private onDeleteTransitionClick = (type: string, transitionIndex: number) => {
    const { exhibitionPage } = this.props;
    
    const pageToUpdate = { ...exhibitionPage };
    if (!pageToUpdate.exhibitionId || !pageToUpdate.id) {
      this.resetValues();
      return;
    }

    if (type === "enter") {
      pageToUpdate.enterTransitions.splice(transitionIndex, 1);
      this.props.onPageTransitionChange(pageToUpdate.enterTransitions, type);
    }
    if (type === "exit") {
      pageToUpdate.exitTransitions.splice(transitionIndex, 1);
      this.props.onPageTransitionChange(pageToUpdate.exitTransitions, type);
    }

    this.resetValues();
  }

  private getTargetPageId = (): string => {
    const { selectedTransition } = this.state;

    console.log(selectedTransition);
    if (selectedTransition && selectedTransition.options[0] && selectedTransition.options[0].values[0]) {
      const firstElementPair = selectedTransition.options[0].values[0].split(":");
      const id = firstElementPair[1].split(",")[0];
      this.setState({
        selectedTargetPageId : id
      });
      return id;
    }

    return "";

  }

  /**
   * Transition dialog close handler
   */
  private onTransitionDialogClose = () => {
    this.resetValues();
  }

  /**
   * Select change event handler
   * @param event change event
   */
  private handleSelectChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    const { selectedTransition } = this.state;

    const key = event.target.name;
    const value = event.target.value as string;

    if (!selectedTransition || !key) {
      return;
    }

    this.setState({
      selectedTransition : { ...selectedTransition, [key] : value }
    });
  }

  /**
   * Select change event handler
   * @param event change event
   */
  private handleSelectedPage = (event: React.ChangeEvent<{ name?: string | undefined; value: any }>) => {
    const { selectedTargetPageId } = this.state;
    const value = event.target.value as string;
    const newTransition = this.state.selectedTransition

    if (selectedTargetPageId === value) {
      return;
    }

    if (newTransition) {
      newTransition.options = [];
    }

    this.setState({
      selectedTargetPageId : value,
      selectedTransition : newTransition
    });
  }

  /**
   * On transition dialog confirm handler
   */
  private onTransitionDialogConfirm = () => {
    const { exhibitionPage } = this.props;
    const { selectedTransition, selectedTransitionType, selectedTransitionIndex } = this.state;
    
    const pageToUpdate = { ...exhibitionPage };
    if (!selectedTransition || !selectedTransitionType || !pageToUpdate.exhibitionId || !pageToUpdate.id) {
      this.resetValues();
      return;
    }

    if (selectedTransitionType === "enter") {
      if (selectedTransitionIndex === undefined) {
        pageToUpdate.enterTransitions = [ ...pageToUpdate.enterTransitions, selectedTransition];
      } else {
        pageToUpdate.enterTransitions[selectedTransitionIndex] = selectedTransition;
      }
      this.props.onPageTransitionChange(pageToUpdate.enterTransitions, selectedTransitionType);
    }
    
    if (selectedTransitionType === "exit") {
      if (selectedTransitionIndex === undefined) {
        pageToUpdate.exitTransitions = [ ...pageToUpdate.exitTransitions, selectedTransition];
      } else {
        pageToUpdate.exitTransitions[selectedTransitionIndex] = selectedTransition;
      }
      this.props.onPageTransitionChange(pageToUpdate.exitTransitions, selectedTransitionType);
    }

    this.resetValues();
  }

  /**
   * Generate select items
   */
  private getSelectItems = (keys: string[]) => {
    return keys.map(key => {
      return <MenuItem value={ key.toLocaleLowerCase() }>{ key }</MenuItem>;
    });
  }

  /**
   * Generate select items
   */
  private getPossiblePages = (pages: ExhibitionPage[]) => {
    return pages.map(page => {
      return <MenuItem value={ page.id }>{ page.name }</MenuItem>;
    });
  }

  /**
   * Reset state values
   */
  private resetValues() {
    this.setState({
      transitionDialogOpen: false,
      selectedTransition: undefined,
      selectedTransitionType: undefined,
      selectedAnimationOption: undefined,
      selectedTargetPageId: undefined
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PageTransitionsEditor));