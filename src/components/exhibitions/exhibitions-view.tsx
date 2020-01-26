import * as React from "react";
import { Container, Typography, Grid, WithStyles, withStyles, Dialog, DialogTitle, DialogContent, TextField, DialogContentText, DialogActions, Button, Card, CardActionArea, CardContent, Icon, CardMedia } from "@material-ui/core";
import styles from "../../styles/card-item";
import { History } from "history";
import CardItem from "../generic/card-item";
import strings from "../../localization/strings";
import { Exhibition } from "../../generated/client";
import defaultExhibitionImage from "../../resources/gfx/logo.png";
import { StoreState, AccessToken } from "../../types";
import * as actions from "../../actions";
import { connect } from "react-redux";
import Api from "../../api/api";
import BasicLayout from "../generic/basic-layout";
import { KeycloakInstance } from "keycloak-js";
import AddIcon from "@material-ui/icons/Add";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History,
  keycloak: KeycloakInstance,
  accessToken: AccessToken
}

/**
 * Component state
 */
interface State {
  error?: Error,
  loading: boolean,
  creating: boolean,
  createDialogOpen: boolean,
  createDialogName: string,
  exhibitions: Exhibition[]
}

/**
 * Exhibitions view
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
      const exhibitionsApi = Api.getExhibitionsApi(this.props.accessToken);
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
    const cards = this.state.exhibitions.map((exhibition) => this.renderCard(exhibition));

    return (
      <BasicLayout keycloak={ this.props.keycloak } error={ this.state.error } clearError={ () => this.setState({ error: undefined }) }>
        <Container maxWidth="xl">
          <Typography variant="h2">{ strings.exhibitions.listTitle }</Typography>
          <Container maxWidth="md" style={{ background: "#fff" }}>
            <Grid container spacing={5} direction="row">
              <Grid item>
                <Card elevation={10} variant="outlined">
                  <CardActionArea onClick={ this.onCreateButtonClick }>
                    <CardMedia>
                      <AddIcon style={{ fontSize: "60px" }}/>
                    </CardMedia>
                  </CardActionArea>
                </Card>
              </Grid>
              {
                cards
              }
            </Grid>
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
    return (
    <Grid item>
      <CardItem
        title={ exhibition.name }
        img={ defaultExhibitionImage }
        onClick={() => {} }>
      </CardItem>
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
          <TextField value={ this.state.createDialogName } onChange={ (event ) => this.setState({ createDialogName: event.target.value }) } autoFocus margin="dense" id="name" label={ strings.exhibitions.createExhibitionDialog.nameLabel } type="text" fullWidth />
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
      exhibitions: [ ... this.state.exhibitions, exhibition ]
    });
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
function mapStateToProps(state: StoreState) {
  return {
    keycloak: state.keycloak as KeycloakInstance,
    accessToken: state.accessToken as AccessToken
  };
}

/**
 * Redux mapper for mapping component dispatches 
 * 
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: React.Dispatch<actions.AppAction>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ExhibitionsView));