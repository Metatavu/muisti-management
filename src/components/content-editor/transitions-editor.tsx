import * as React from "react";
import { ExhibitionPage, ExhibitionDevice, Animation, AnimationTimeInterpolation, ExhibitionPageTransition } from "../../generated/client";
// eslint-disable-next-line max-len
import { WithStyles, withStyles, TextField, MenuItem, Select, Typography, List, ListItem, Grid, Divider, ListItemSecondaryAction, IconButton } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import strings from "../../localization/strings";
import GenericButton from "../generic/generic-button";
import AddIcon from "@material-ui/icons/AddSharp";
import DeleteIcon from '@material-ui/icons/Delete';
import GenericDialog from "../generic/generic-dialog";
import theme from "../../styles/theme";
import PageTransitionViewsEditor from "./page-transition-elements-editor";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  selectedPage: ExhibitionPage;
  devices: ExhibitionDevice[];
  pages: ExhibitionPage[];

  /**
   * On page transition change handler
   *
   * @param transitions list of transitions to update
   * @param transitionType transition type ("exit" or "enter")
   */
  onPageTransitionChange: (transitions: ExhibitionPageTransition[], transitionType: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
  transitionDialogOpen: boolean;
  selectedTransition?: ExhibitionPageTransition;
  selectedTransitionType?: string;
  selectedTransitionIndex?: number;
}

/**
 * Component for transition editor
 */
class TransitionsEditor extends React.Component<Props, State> {

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
    const { selectedPage } = this.props;
    return (
      <>
        <Typography variant="h3">{ strings.contentEditor.editor.transitions.enterTransitions }</Typography>
        { this.renderPageTransitions("enter", selectedPage.enterTransitions) }
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />

        <Typography variant="h3">{ strings.contentEditor.editor.transitions.exitTransitions }</Typography>
        { this.renderPageTransitions("exit", selectedPage.exitTransitions) }
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19 }} />

        { this.renderTransitionDialog() }
      </>
    );
  }

  /**
   * Render page transition list
   *
   * @param transitionType transition type
   * @param transitions list of transitions
   */
  private renderPageTransitions(transitionType: string, transitions: ExhibitionPageTransition[]) {

    const transitionItems = transitions.map((transition, transitionIndex) => {
      return (<>
        <ListItem button onClick={ () => this.onTransitionClick(transitionType, transition, transitionIndex) }>
          <Typography variant="h6">{ transition.transition.animation }</Typography>
          <ListItemSecondaryAction>
            <IconButton
              color="primary"
              onClick={ () => this.onDeleteTransitionClick(transitionType, transitionIndex) }
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>

      </>);
    });

    return (
      <>
        <List component="nav" aria-labelledby="nested-list-subheader">
          { transitionItems }
        </List>
        <GenericButton
          text={ strings.contentEditor.editor.transitions.addTransition }
          color="secondary"
          icon={ <AddIcon /> }
          onClick={ () => this.onAddTransitionClick(transitionType) }
        />
      </>
    );
  }

  /**
   * Render add/modify transition dialog
   */
  private renderTransitionDialog = () => {
    const { transitionDialogOpen } = this.state;

    return (
      <GenericDialog
        open={ transitionDialogOpen }
        error={ false }
        title={ strings.contentEditor.editor.transitions.editTransition }
        onClose={ this.onTransitionDialogClose }
        onCancel={ this.onTransitionDialogClose }
        onConfirm={ this.onTransitionDialogConfirm }
        positiveButtonText={ strings.editorDialog.save }
        cancelButtonText={ strings.editorDialog.cancel }
      >
        { this.renderDialogContent() }
      </GenericDialog>
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
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.contentEditor.editor.dialog.animation }</Typography>
            <Select
              fullWidth
              labelId={ strings.contentEditor.editor.dialog.animation }
              id="transitionDialogAnimation"
              onChange={ this.handleSelectChange }
              name="animation"
              value={ selectedTransition?.transition.animation }
            >
              { this.getSelectItems(Object.keys(Animation)) }
            </Select>
            <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
          </Grid>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.contentEditor.editor.dialog.timeInterpolation }</Typography>
            <Select
              fullWidth
              labelId={ strings.contentEditor.editor.dialog.timeInterpolation }
              id="transitionDialogTimeInterpolation"
              onChange={ this.handleSelectChange }
              name="timeInterpolation"
              value={ selectedTransition?.transition.timeInterpolation }
            >
              { this.getSelectItems(Object.keys(AnimationTimeInterpolation)) }
            </Select>
            <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
          </Grid>
          <Grid item xs={ 12 }>
            <Typography style={{ marginBottom: theme.spacing(2) }} variant="h6">{ strings.contentEditor.editor.dialog.duration }</Typography>
            <TextField
              fullWidth
              type="number"
              name="duration"
              value={ selectedTransition?.transition.duration }
              onChange={ this.handleSelectChange }
            />
            <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: 19, width: "100%" }} />
          </Grid>
          <Grid item xs={ 12 }>
            { selectedTransition?.transition.animation !== Animation.Fade &&
              this.renderTransitionElementEditor()
            }
          </Grid>
        </Grid>
    </>);
  }

  /**
   * Render transition animation options editor
   */
  private renderTransitionElementEditor = () => {
    const { selectedPage } = this.props;
    const { selectedTransition } = this.state;

    if (!selectedTransition) {
      return <div/>;
    }
    return (<>
      <PageTransitionViewsEditor
        pages={ this.getCorrectPages() }
        selectedPage={ selectedPage }
        selectedTransition={ selectedTransition }
        onTransitionUpdate={ this.onTransitionUpdate }
      />
    </>);
  }

  /**
   * On transition click event handler
   *
   * @param type transition type
   * @param clickedTransition clicked transition from list
   * @param transitionIndex clicked transition list index
   */
  private onTransitionClick = (type: string, clickedTransition: ExhibitionPageTransition, transitionIndex: number) => {
    this.setState({
      selectedTransition: clickedTransition,
      transitionDialogOpen: true,
      selectedTransitionType: type,
      selectedTransitionIndex: transitionIndex
    });
  }

  /**
   * Handle animation option change
   */
  private onTransitionUpdate = (transition: ExhibitionPageTransition) => {
    this.setState({
      selectedTransition: transition
    });
  }

  /**
   * Add transition click event handler
   *
   * @param type transition type
   */
  private onAddTransitionClick = (type: string) => {

    const newTransition: ExhibitionPageTransition = {
      transition : {
        animation: Animation.Fade,
        duration: 0,
        timeInterpolation: AnimationTimeInterpolation.Acceleratedecelerate,
      },
      sourceLayoutId: this.props.selectedPage.layoutId
    };

    let index = 0;
    if (type === "enter") {
      index = this.props.selectedPage.enterTransitions.length;
    }

    if (type === "exit") {
      index = this.props.selectedPage.exitTransitions.length;
    }

    this.setState({
      selectedTransition: newTransition,
      transitionDialogOpen: true,
      selectedTransitionType: type,
      selectedTransitionIndex : index
    });
  }

  /**
   * Delete transition click event handler
   *
   * @param type transition type
   * @param transitionIndex clicked transition list index
   */
  private onDeleteTransitionClick = (type: string, transitionIndex: number) => {
    const { selectedPage } = this.props;
    const pageToUpdate = { ...selectedPage };
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

  /**
   * Transition dialog close handler
   */
  private onTransitionDialogClose = () => {
    this.resetValues();
  }

  /**
   * Select change event handler
   *
   * @param event change event
   */
  private handleSelectChange = (event: React.ChangeEvent<{ name?: string | undefined; value: any }>) => {
    const { selectedTransition } = this.state;

    const key = event.target.name;
    const value = event.target.value as string;

    if (!selectedTransition || !key) {
      return;
    }

    this.setState({
      selectedTransition : { ...selectedTransition, transition : { ...selectedTransition.transition, [key] : value }  }
    });
  }

  /**
   * On transition dialog confirm handler
   */
  private onTransitionDialogConfirm = () => {
    const { selectedPage } = this.props;
    const { selectedTransition, selectedTransitionType, selectedTransitionIndex } = this.state;

    const pageToUpdate = { ...selectedPage };
    if (!selectedTransition || !selectedTransitionType || !pageToUpdate.exhibitionId || !pageToUpdate.id) {
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
   * Get all pages of exhibition device
   *
   * @returns empty list or list of found exhibition pages
   */
  private getCorrectPages = (): ExhibitionPage[] => {
    const { devices, selectedPage, pages } = this.props;

    const foundDevice = devices.find(device => device.id === selectedPage.deviceId);
    if (!foundDevice) {
      return [];
    }

    return pages.filter(page => page.deviceId === foundDevice.id);
  }

  /**
   * Generate select items
   */
  private getSelectItems = (keys: string[]) => {
    return keys.map(key => {
      return <MenuItem key={ key } value={ key.toLocaleLowerCase() }>{ key }</MenuItem>;
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
    });
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return { };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(TransitionsEditor));