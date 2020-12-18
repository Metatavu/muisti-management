/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line max-len
import { Button, CircularProgress, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, TextField, Toolbar, Typography, WithStyles, withStyles } from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';
import { History } from "history";
import { KeycloakInstance } from "keycloak-js";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import Api from "../../api/api";
import { Exhibition, VisitorVariable, VisitorVariableType } from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/components/visitor-variables-screen/visitor-variables-editor-view";
import theme from "../../styles/theme";
import { AccessToken, ActionButton } from '../../types';
import ConfirmDialog from "../generic/confirm-dialog";
import BasicLayout from "../layouts/basic-layout";
import ElementNavigationPane from "../layouts/element-navigation-pane";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak: KeycloakInstance;
  accessToken: AccessToken;
  exhibitions: Exhibition[];
  exhibitionId: string;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  panelOpen: boolean;
  toolbarOpen: boolean;
  deleteOpen: boolean;
  dataChanged: boolean;
  visitorVariables: VisitorVariable[];
  selectedVisitorVariable?: VisitorVariable;
}

/**
 * Component for visitor variable screen
 */
export class VisitorVariablesScreen extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      panelOpen: false,
      toolbarOpen: true,
      deleteOpen: false,
      dataChanged: false,
      visitorVariables: []
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    this.setState({ loading: true });
    await this.fetchEditorData();
    this.setState({ loading: false });
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, history } = this.props;
    const { loading, dataChanged } = this.state;

    if (loading) {
      return (
        <div className={ classes.loader }>
          <CircularProgress size={ 50 } color="secondary"></CircularProgress>
        </div>
      );
    }

    return (
      <BasicLayout
        history={ history }
        title={ strings.visitorVariables.title }
        breadcrumbs={ [] }
        actionBarButtons={ this.getActionButtons() }
        keycloak={ this.props.keycloak }
        error={ this.state.error }
        clearError={ () => this.setState({ error: undefined }) }
        dataChanged={ dataChanged }
        openDataChangedPrompt={ true }
        noTabs={ true }
      >
        <div className={ classes.editorLayout }>
          <ElementNavigationPane title={ strings.visitorVariables.title }>
            { this.renderVisitorVariablesList() }
          </ElementNavigationPane>
          <div style={{ padding: theme.spacing(4) }}>
            { this.renderEditor() }
            { this.renderConfirmDeleteDialog() } 
          </div>
        </div>
      </BasicLayout>
    );
  }

  /**
   * Renders visitor variable list
   */
  private renderVisitorVariablesList = () => {
    const { visitorVariables } = this.state;
    
    return (
      <List disablePadding>
        {
          visitorVariables.map(visitorVariable => {
            const id = visitorVariable.id!;
            const selected = id === this.state.selectedVisitorVariable?.id;
            const name = visitorVariable.name;
            const label = visitorVariable.type;
            
            return (
              <ListItem button key={ id } selected={ selected } onClick={ () => this.onListItemClick(visitorVariable) }>
                <ListItemText primary={ name } secondary={ label } />
                <ListItemSecondaryAction>
                  <IconButton 
                    title={ strings.generic.delete }
                    edge="end"
                    aria-label="delete"
                    onClick={ () => this.onDeleteVisitorVariableClick(visitorVariable) }
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })
        }
      </List>
    );
  }

  /**
   * Renders editor view
   */
  private renderEditor = () => {
    const { selectedVisitorVariable } = this.state;

    if (!selectedVisitorVariable) {
      return null;
    }

    return (
      <>
        <TextField
          style={{ marginBottom: theme.spacing(2) }}
          label={ strings.visitorVariables.nameLabel }
          name="name"
          value={ selectedVisitorVariable.name }
          onChange={ this.onNameChange }
        />

        <Select
          label={ strings.visitorVariables.typeLabel }
          value={ selectedVisitorVariable.type }
          onChange={ this.onTypeChange }
        >
          <MenuItem value={ VisitorVariableType.Boolean }> { strings.visitorVariables.typeBoolean } </MenuItem>
          <MenuItem value={ VisitorVariableType.Number }> { strings.visitorVariables.typeNumber } </MenuItem>
          <MenuItem value={ VisitorVariableType.Text }> { strings.visitorVariables.typeText } </MenuItem>
          <MenuItem value={ VisitorVariableType.Enumerated }> { strings.visitorVariables.typeEnumerated } </MenuItem>
        </Select>

        { this.renderEnumEditor() }
      </>
    );
  }

  /**
   * Renders editor for enumerated values
   */
  private renderEnumEditor = () => {
    const { selectedVisitorVariable } = this.state;
    if (!selectedVisitorVariable || selectedVisitorVariable.type !==  VisitorVariableType.Enumerated) {
      return null;
    }

    return (
      <>
        <Toolbar disableGutters style={{ justifyContent: "space-between", marginTop: theme.spacing(1) }}>
        <Typography variant="h3">{ strings.visitorVariables.valuesTitle }</Typography>
          <Button variant="contained" color="primary" onClick={ this.onAddEnumItenClick }>
            { strings.visitorVariables.addEnumValue }
          </Button>
        </Toolbar>
        <List disablePadding dense>
          { selectedVisitorVariable._enum?.map(this.renderEnunEditorItem) }
        </List>

      </>
    );
  }

  /**
   * Renders enumerated value editor
   * 
   * @param value value
   * @param index index of value
   */
  private renderEnunEditorItem = (value: string, index: number) => {
    return (
      <ListItem disableGutters>
        <ListItemText>
          <TextField fullWidth={ true } value={ value } onChange={ event => this.onEnumItemChange(event.target.value, index) }/>
        </ListItemText>
        <ListItemSecondaryAction>
          <IconButton 
            size="small"
            edge="end"
            aria-label="delete"
            onClick={ () => this.onEnumItemDelete(index) }
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  /**
   * Render content version confirmation dialog
   */
  private renderConfirmDeleteDialog = () => {
    return (
      <ConfirmDialog
        open={ this.state.deleteOpen }
        title={ strings.visitorVariables.deleteConfirmTitle }
        text={ strings.visitorVariables.deleteConfirmText }
        onClose={ this.onConfirmDeleteCloseClick }
        onCancel={ this.onConfirmDeleteCancelClick }
        onConfirm={ () => this.deleteVisitorVariable() }
        cancelButtonText={ strings.genericDialog.cancel }
        positiveButtonText={ strings.genericDialog.confirm }
      />
    );
  }

  /**
   * Returns action buttons
   *
   * @returns action buttons as array
   */
  private getActionButtons = (): ActionButton[] => {
    const { dataChanged } = this.state;

    return [
      {
        name: strings.visitorVariables.newButton,
        action: this.onNewClick
      },
      {
        name: strings.visitorVariables.saveButton,
        action: this.onSaveClick,
        disabled : !dataChanged
      }
    ];
  }

  /**
   * Fetches editor data
   */
  private fetchEditorData = async () => {
    const { accessToken, exhibitionId } = this.props;

    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);
    
    const visitorVariables = await visitorVariablesApi.listVisitorVariables({
      exhibitionId: exhibitionId
    });

    this.setState({
      visitorVariables: visitorVariables
    });

  }
  
  /**
   * Creates new visitor variable
   */
  private newVisitorVariable = async () => {
    const { accessToken, exhibitionId } = this.props;    
    const { visitorVariables } = this.state;

    this.setState({
      loading: true
    });

    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);

    let newVariableName = strings.visitorVariables.newVariableName;
    let newVariableIndex = 0;

    // eslint-disable-next-line no-loop-func
    while (visitorVariables.find(visitorVariable => visitorVariable.name === newVariableName)) {
      newVariableName = `${strings.visitorVariables.newVariableName}-${++newVariableIndex}`;
    }

    const updatedVisitorVariable = await visitorVariablesApi.createVisitorVariable({
      exhibitionId: exhibitionId,
      visitorVariable: {
        name: newVariableName,
        type: VisitorVariableType.Text
      }
    });
  
    this.setState({
      loading: false,
      visitorVariables: [ ...visitorVariables.filter(visitorVariable => visitorVariable.id !== updatedVisitorVariable.id), updatedVisitorVariable ]
    });
  }

  /**
   * Saves the visitor variable
   */
  private saveVisitorVariable = async () => {
    const { accessToken, exhibitionId } = this.props;    
    const { selectedVisitorVariable, visitorVariables } = this.state;
    if (!selectedVisitorVariable) {
      return;
    }

    this.setState({
      loading: true
    });

    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);

    const updatedVisitorVariable = await visitorVariablesApi.updateVisitorVariable({
      exhibitionId: exhibitionId,
      visitorVariable: selectedVisitorVariable,
      visitorVariableId: selectedVisitorVariable.id!
    });
  
    this.setState({
      loading: false,
      visitorVariables: [ ...visitorVariables.filter(visitorVariable => visitorVariable.id !== updatedVisitorVariable.id), updatedVisitorVariable ]
    });
  }

  /**
   * Deletes visitor variable
   */
  private deleteVisitorVariable = async () => {
    const { accessToken, exhibitionId } = this.props;    
    const { selectedVisitorVariable, visitorVariables } = this.state;
    if (!selectedVisitorVariable) {
      return;
    }

    const visitorVariableId = selectedVisitorVariable.id!;

    this.setState({
      loading: true
    });

    const visitorVariablesApi = Api.getVisitorVariablesApi(accessToken);

    await visitorVariablesApi.deleteVisitorVariable({
      exhibitionId: exhibitionId,
      visitorVariableId: visitorVariableId
    });
  
    this.setState({
      loading: false,
      deleteOpen: false,
      selectedVisitorVariable: undefined,
      visitorVariables: visitorVariables.filter(visitorVariable => visitorVariable.id !== visitorVariableId)
    });
  }

  /**
   * Event handler for visitor variable item click
   * 
   * @param visitorVariable visitor variable
   */
  private onListItemClick = (visitorVariable: VisitorVariable) => {
    this.setState({
      selectedVisitorVariable: visitorVariable
    });
  }

  /**
   * Event handler for name change
   *
   * @param event React change event
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedVisitorVariable } = this.state;
    if (!selectedVisitorVariable) {
      return;
    }

    const { target } = event;
    const value: string = target.value;
    const updatedVisitorVariable = { ...selectedVisitorVariable };
    updatedVisitorVariable.name = value;

    this.setState({
      selectedVisitorVariable: updatedVisitorVariable,
      dataChanged: true
    });
  }

  /**
   * Event handler for type change
   *
   * @param event event
   */
  private onTypeChange = (event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
    const { selectedVisitorVariable } = this.state;

    if (!selectedVisitorVariable) {
      return;
    }

    const type = event.target.value as VisitorVariableType;
    const updatedVisitorVariable = { ...selectedVisitorVariable };
    updatedVisitorVariable.type = type;

    this.setState({
      selectedVisitorVariable: updatedVisitorVariable,
      dataChanged: true
    });
  }

  /**
   * Event handler for enum add item click
   */
  private onAddEnumItenClick = () => {
    const { selectedVisitorVariable } = this.state;

    if (!selectedVisitorVariable) {
      return;
    }

    this.setState({
      selectedVisitorVariable: { ...selectedVisitorVariable, _enum: [ ...(selectedVisitorVariable._enum || []), "" ] },
      dataChanged: true
    });
  }

  /**
   * Event handler for enum item change
   * 
   * @param value new value
   * @param index index of changed value
   */
  private onEnumItemChange = (value: string, index: number) => {
    const { selectedVisitorVariable } = this.state;
    if (!selectedVisitorVariable) {
      return;
    }

    const _enum = [ ...selectedVisitorVariable._enum || []];
    _enum[index] = value;

    this.setState({
      selectedVisitorVariable: { ...selectedVisitorVariable, _enum: _enum },
      dataChanged: true
    });
  }

  /**
   * Event handler for enum item delete click
   * 
   * @param index index of value to be deleted
   */
  private onEnumItemDelete = (index: number) => {
    const { selectedVisitorVariable } = this.state;
    if (!selectedVisitorVariable) {
      return;
    }

    const _enum = [ ...selectedVisitorVariable._enum || []];
    _enum.splice(index, 1);

    this.setState({
      selectedVisitorVariable: { ...selectedVisitorVariable, _enum: _enum },
      dataChanged: true
    });
  }

  /**
   * Event handler for visitor variable delete click
   * 
   * @param visitorVariable visitor variable to be deleted
   */
  private onDeleteVisitorVariableClick = (visitorVariable: VisitorVariable) => {
    this.setState({
      selectedVisitorVariable: visitorVariable,
      deleteOpen: true
    });
  }

  /**
   * Event handler for save button click
   */
  private onSaveClick = () => {
    this.saveVisitorVariable();
  }

  /**
   * Event handler for new button click
   */
  private onNewClick = () => {
    this.newVisitorVariable();
  }

  /**
   * Confirm dialog close click handler
   */
  private onConfirmDeleteCloseClick = () => {
    this.setState({
      deleteOpen: false
    });
  }

  /**
   * Confirm dialog cancel click handler
   */
  private onConfirmDeleteCancelClick = () => {
    this.setState({
      deleteOpen: false
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
    exhibitions: state.exhibitions.exhibitions
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(_dispatch: Dispatch<ReduxActions>) {
  return {
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(VisitorVariablesScreen));
