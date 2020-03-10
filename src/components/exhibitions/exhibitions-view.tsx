import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxState, ReduxActions } from "../../store";
import { setExhibition } from "../../actions/exhibition";

import { History } from "history";
import styles from "../../styles/exhibitions-view";
import strings from "../../localization/strings";
import { Container, Typography, Grid, Dialog, DialogTitle, DialogContent, TextField, DialogContentText, DialogActions, Button, Paper } from "@material-ui/core";
import { WithStyles, withStyles } from "@material-ui/core";
import CardItem from "../generic/card-item";
import { Exhibition } from "../../generated/client";
import defaultExhibitionImage from "../../resources/gfx/muisti-logo.png";
import Api from "../../api/api";
import BasicLayout from "../generic/basic-layout";
import { KeycloakInstance } from "keycloak-js";
import AddIcon from "@material-ui/icons/AddRounded";
import { AccessToken } from "../../types";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  setExhibition: typeof setExhibition;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  creating: boolean;
  createDialogOpen: boolean;
  createDialogName: string;
  exhibitions: Exhibition[];
}

/**
 * Component for exhibitions view
 */
class ExhibitionsView extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      creating: false,
      createDialogOpen: false,
      createDialogName: "",
      exhibitions: []
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = async () => {
    this.setState({
      loading: true
    });

    try {
      const { accessToken } = this.props;
      const exhibitionsApi = Api.getExhibitionsApi(accessToken);
      const exhibitions: Exhibition[] = await exhibitionsApi.listExhibitions();

      this.setState({
        exhibitions: exhibitions
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
  public render() {
    const { classes } = this.props;

    const cards = this.state.exhibitions.map(exhibition => this.renderCard(exhibition));

    return (
      <BasicLayout title="Alusta™" keycloak={ this.props.keycloak } error={ this.state.error } clearError={ () => this.setState({ error: undefined }) }>
        <Container maxWidth="xl">
          <Container maxWidth="md">
            <Paper elevation={3} className={ classes.paper } >
              <Typography className={ classes.title } variant="h2">{ strings.exhibitions.listTitle }</Typography>

              <Grid container spacing={5} direction="row">
              <Grid item>
                <CardItem key="new" 
                  title={ strings.exhibitions.newExhibitionLabel } 
                  icon={ <AddIcon fontSize="large" /> } onClick={ this.onCreateButtonClick }/>
              </Grid>
                {
                  cards
                }
              </Grid>
            </Paper>
          </Container>
        </Container>
        { this.renderCreateDialog() }
      </BasicLayout>
    );
  }

  /**
   * Card render method
   */
  private renderCard(exhibition: Exhibition) {
    if (!exhibition || !exhibition.id) {
      return;
    }

    const exhibitionId: string = exhibition.id;

    return (
      <Grid item>
        <CardItem key={ exhibitionId } title={ exhibition.name } image={ defaultExhibitionImage } onClick={ () => this.openExhibition(exhibitionId) }/>
      </Grid>
    );
  }
  
  /**
   * Renders create dialog
   */
  private renderCreateDialog = () => {
    return (
      <Dialog open={ this.state.createDialogOpen } onClose={ this.onCreateDialogClose }>
        <DialogTitle>{ strings.exhibitions.createExhibitionDialog.title }</DialogTitle>
        <DialogContent>
          <DialogContentText>
            { strings.exhibitions.createExhibitionDialog.helpText }
          </DialogContentText>
          <TextField value={ this.state.createDialogName } 
            onChange={event => this.setState({ createDialogName: event.target.value }) } 
            autoFocus 
            margin="dense" 
            id="name" 
            label={ strings.exhibitions.createExhibitionDialog.nameLabel } type="text" fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={ this.onCreateDialogCancelClick } color="primary">
            { strings.exhibitions.createExhibitionDialog.cancelButton }
          </Button>
          <Button onClick={ this.onDialogCreateButtonClick } color="primary">
            { strings.exhibitions.createExhibitionDialog.createButton }
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  /**
   * Creates new exhibition
   * 
   * @param name exhibition name
   */
  private createExhibition = async (name: string) => {
    this.setState({
      creating: true
    });

    const exhibitionsApi = Api.getExhibitionsApi(this.props.accessToken);
    
    const exhibition = await exhibitionsApi.createExhibition({
      exhibition: {
        name: name
      }
    });

    this.setState({
      creating: false,
      exhibitions: [ ...this.state.exhibitions, exhibition ]
    });
  }


  /**
   * Opens exhibition
   * 
   * @param exhibitionId exhibition id
   */
  private openExhibition = async (exhibitionId: string) => {
    const { accessToken } = this.props;
    const exhibitionsApi = Api.getExhibitionsApi(accessToken);
    const exhibition = await exhibitionsApi.findExhibition({ exhibitionId: exhibitionId });
    this.props.setExhibition(exhibition);
    this.props.history.push(`/exhibitions/${exhibitionId}`);
  }

  /**
   * Closes a create dialog
   */
  private closeCreateDialog = () => {
    this.setState({
      createDialogOpen: false
    });
  }

  /**
   * Event handler for create button click
   */
  private onCreateButtonClick = () => {
    this.setState({
      createDialogOpen: true
    });
  }

  /**
   * Event handler for create dialog create button click
   */
  private onDialogCreateButtonClick = async () => {
    await this.createExhibition(this.state.createDialogName);

    this.setState({ 
      createDialogName: "" 
    });

    this.closeCreateDialog();
  }

  /**
   * Event handler for create dialog cancel button click 
   */
  private onCreateDialogCancelClick = () => {
    this.closeCreateDialog();
  }

  /**
   * Event handler for create dialog close event 
   */
  private onCreateDialogClose = () => {
    this.closeCreateDialog();
  }
}

/**
 * Redux mapper for mapping store state to component props
 * 
 * @param state store state
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak as KeycloakInstance,
    accessToken: state.auth.accessToken as AccessToken
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setExhibition: (exhibition: Exhibition) => dispatch(setExhibition(exhibition))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionsView));