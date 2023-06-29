import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ReduxActions, ReduxState } from "../../store";
import { History } from "history";
import styles from "../../styles/screens/reception-screen";
import {
  CircularProgress,
  Typography,
  Button,
  TextField,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  SelectChangeEvent
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import { KeycloakInstance } from "keycloak-js";
import { ContentVersion, DeviceModel, Visitor } from "../../generated/client";
import { AccessToken } from "../../types";
import strings from "../../localization/strings";
import BasicLayout from "../layouts/basic-layout";
import { setDeviceModels } from "../../actions/devices";
import TagListener from "../generic/tag-listener";
import { MqttListener } from "../generic/mqtt-listener";
import Api from "../../api/api";
import SimpleReactValidator from "simple-react-validator";
import logo from "../../resources/gfx/muisti-logo.png";
import LanguageUtils from "../../utils/language-utils";
import { Config } from "../../constants/configuration";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  keycloak?: KeycloakInstance;
  accessToken?: AccessToken;
  exhibitionId: string;
}

/**
 * Component state
 */
interface State {
  loading: boolean;
  formError: boolean;
  error?: Error;
  beginRegistrationProcess: boolean;
  languageSelected: boolean;
  existingVisitor: boolean;
  emailGiven: boolean;
  tag?: string;
  visitor?: Visitor;
  visitorCreated: boolean;
  languages: string[];
}

const config = Config.getConfig();

/**
 * Component for reception screen
 */
export class ReceptionScreen extends React.Component<Props, State> {
  private validator: SimpleReactValidator;

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.validator = new SimpleReactValidator({
      autoForceUpdate: this,
      messages: {
        required: strings.reception.errorMessages.required,
        email: strings.reception.errorMessages.email,
        phone: strings.reception.errorMessages.number,
        min: strings.reception.errorMessages.minLength
      },
      element: (message: string) => <p style={{ color: "red", margin: 0 }}>{message} </p>
    });

    this.state = {
      formError: false,
      loading: false,
      beginRegistrationProcess: false,
      languageSelected: false,
      existingVisitor: false,
      emailGiven: false,
      visitorCreated: false,
      languages: []
    };
  }

  /**
   * Component did mount life cycle handler
   */
  public componentDidMount = async () => {
    await this.fetchData();
  };

  /**
   * Component render method
   */
  public render = () => {
    const { history, keycloak } = this.props;
    const { error } = this.state;

    if (!keycloak) {
      return null;
    }

    return (
      <BasicLayout
        keycloak={keycloak}
        history={history}
        title={strings.reception.title}
        breadcrumbs={[]}
        error={error}
        noBackButton
        hideHeader={true}
      >
        {this.resolveComponentToRender()}
      </BasicLayout>
    );
  };

  /**
   * Resolves what component to render inside basic layout
   */
  private resolveComponentToRender = () => {
    const { classes } = this.props;
    const { loading, beginRegistrationProcess, languageSelected, emailGiven, tag, visitorCreated } =
      this.state;

    if (loading) {
      return (
        <div className={classes.loader}>
          <CircularProgress size={50} color="secondary"></CircularProgress>
        </div>
      );
    }

    if (!beginRegistrationProcess) {
      return this.renderBeginRegistrationProcess();
    }

    if (!tag) {
      return this.renderTagListener();
    }

    if (!languageSelected) {
      return this.renderLanguageSelect();
    }

    if (!emailGiven) {
      return this.renderEmailForm();
    }

    if (!visitorCreated) {
      return this.renderForm();
    }

    return this.renderConfirmation();
  };

  /**
   * Renders begin registration process
   */
  private renderBeginRegistrationProcess = () => {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.logoContainer}>
          <img alt="Muisti logo" src={logo} />
        </div>
        <div className={classes.formContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={this.onRegisterNewVisitorClick}
            className={classes.registerButton}
          >
            {strings.reception.registerNewVisitor}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Renders content version select
   */
  private renderLanguageSelect = () => {
    const { classes } = this.props;
    const { languages, visitor } = this.state;

    if (!visitor) {
      return null;
    }

    const selectOptions = languages.map((language) => {
      return (
        <MenuItem key={language} value={language}>
          {language}
        </MenuItem>
      );
    });

    return (
      <div className={classes.container}>
        <div className={classes.logoContainer}>
          <img alt="Muisti logo" src={logo} />
        </div>
        <div className={classes.formContainer}>
          <Typography className={classes.title} variant="h3">
            {strings.reception.selectLanguageTitle}
          </Typography>
          <FormControl className={classes.languageSelectControl}>
            <InputLabel id="languageLabel">{strings.reception.language}</InputLabel>
            <Select
              label={strings.reception.language}
              labelId="languageLabel"
              onChange={this.onLanguageChange}
              name={"language"}
              value={visitor.language}
            >
              {selectOptions}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={this.onLanguageSaveClick}
            className={classes.saveButton}
          >
            {strings.reception.selectLanguage}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Renders registration form
   */
  private renderEmailForm = () => {
    const { classes } = this.props;
    const { visitor } = this.state;

    if (!visitor) {
      return null;
    }

    return (
      <div className={classes.container}>
        <div className={classes.logoContainer}>
          <img alt="Muisti logo" src={logo} />
        </div>
        <div className={classes.formContainer}>
          <Typography className={classes.title} variant="h3">
            {strings.reception.checkEmail}
          </Typography>
          {this.renderTextField(
            strings.reception.visitor.email,
            "email",
            "required|email",
            visitor.email
          )}

          <Button
            disabled={!this.validator.allValid()}
            variant="contained"
            color="primary"
            onClick={this.onEmailSaveClick}
            className={classes.saveButton}
          >
            {strings.reception.saveEmail}
          </Button>
        </div>
      </div>
    );
  };

  /**
   * Renders tag listener
   */
  private renderTagListener = () => {
    return (
      <MqttListener onError={this.onMqttError}>
        {(mqtt) => (
          <TagListener
            threshold={75}
            mqtt={mqtt}
            antenna={config.mqttConfig.newVisitorAntenna}
            hide={false}
            onTagRegister={this.onTagRegister}
          />
        )}
      </MqttListener>
    );
  };

  /**
   * Renders registration form
   */
  private renderForm = () => {
    const { classes } = this.props;
    const { tag, visitor } = this.state;

    if (!visitor) {
      return null;
    }

    return (
      <div className={classes.container}>
        <div className={classes.logoContainer}>
          <img alt="Muisti logo" src={logo} />
        </div>
        <div className={classes.formContainer}>
          <Typography className={classes.title} variant="h3">
            {strings.reception.visitor.visitorInfoFormTitle}
          </Typography>

          {this.renderTextField(
            strings.reception.visitor.firstName,
            "firstName",
            "required|min:3",
            visitor.firstName
          )}
          {this.renderTextField(
            strings.reception.visitor.lastName,
            "lastName",
            "required|min:3",
            visitor.lastName
          )}
          {this.renderTextField(
            strings.reception.visitor.email,
            "email",
            "required|email",
            visitor.email
          )}
          {this.renderTextField(
            strings.reception.visitor.number,
            "phone",
            "required|phone",
            visitor.phone
          )}
          {this.renderTextField(
            strings.reception.visitor.birthYear,
            "birthYear",
            "required|numeric",
            visitor.birthYear,
            "number"
          )}

          <Button
            disabled={!this.validator.allValid()}
            variant="contained"
            color="primary"
            onClick={this.onSaveNewVisitorClick}
            className={classes.saveButton}
          >
            {strings.reception.saveVisitor}
          </Button>
          <div className={classes.visitorTagContainer}>
            {`${strings.reception.visitor.tag}: ${tag}`}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renders text field with given parameters
   *
   * @param label text field label
   * @param name text field name
   * @param validationRules rules for text field validation
   * @param value input field value
   * @param inputType input field type
   */
  private renderTextField = (
    label: string,
    name: string,
    validationRules: string,
    value?: string | number,
    inputType?: string
  ) => {
    const { classes } = this.props;

    return (
      <>
        <TextField
          required
          className={classes.textField}
          fullWidth
          label={label}
          variant="outlined"
          name={name}
          value={value}
          type={inputType ? inputType : "string"}
          onChange={this.onTextFieldChange}
          onBlur={() => this.validator.showMessageFor(name)}
        />
        {this.validator.message(name, value, validationRules)}
      </>
    );
  };

  /**
   * Renders confirmation view
   */
  private renderConfirmation = () => {
    const { classes } = this.props;

    return (
      <div className={classes.formContainer}>
        <Typography className={classes.title} variant="h3">
          {strings.reception.confirmation}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={this.onReturnClick}
          className={classes.saveButton}
        >
          {strings.reception.return}
        </Button>
      </div>
    );
  };

  /**
   * Construct available language options from content version
   *
   * @param contentVersions exhibition content versions
   */
  private constructAvailableLanguages = (contentVersions: ContentVersion[]) => {
    const languages = LanguageUtils.getAvailableLanguages(contentVersions);

    this.setState({
      languages: languages
    });
  };

  /**
   * Event handler for tag register
   *
   * @param tag tag that was read
   */
  private onTagRegister = (tag: string) => {
    const newVisitor: Visitor = {
      language: "",
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      birthYear: 2000,
      tagId: tag
    };

    this.setState({
      tag,
      visitor: newVisitor
    });
  };

  /**
   * Event handler for register new visitor click
   */
  private onRegisterNewVisitorClick = () => {
    this.setState({
      beginRegistrationProcess: true
    });
  };

  /**
   * Event handler for language change
   *
   * @param event react change event
   * @param child react child node
   */
  private onLanguageChange = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    const { visitor } = this.state;
    const name = event.target.name;

    if (!name || !visitor) {
      return;
    }

    const value = event.target.value as string;
    strings.setLanguage(value.toLocaleLowerCase());

    this.setState({
      visitor: { ...visitor, [name]: value }
    });
  };

  /**
   * Event handler for mqtt error
   *
   * @param error mqtt error
   */
  private onMqttError = (error: Error) => {
    this.setState({
      error: error
    });
  };

  /**
   * Event handler for text field change
   *
   * @param event react change event
   */
  private onTextFieldChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { visitor } = this.state;
    const { name, value } = event.target;

    if (!name || !visitor) {
      return;
    }

    this.setState({
      visitor: { ...visitor, [name]: value }
    });
  };

  /**
   * Event handler for language save click
   */
  private onLanguageSaveClick = () => {
    this.setState({
      languageSelected: true
    });
  };

  /**
   * Event handler for email save click
   */
  private onEmailSaveClick = async () => {
    const { accessToken, exhibitionId } = this.props;
    const { visitor } = this.state;

    if (!visitor || !accessToken) {
      return;
    }

    const visitorsApi = Api.getVisitorsApi(accessToken);
    const existingVisitors = await visitorsApi.listVisitors({
      exhibitionId: exhibitionId,
      email: visitor.email
    });

    let visitorToSave: Visitor;
    const foundVisitor = existingVisitors.find((v) => v.email === visitor.email);

    if (!foundVisitor) {
      visitorToSave = visitor;
    } else {
      visitorToSave = foundVisitor;
    }

    this.setState({
      existingVisitor: !!foundVisitor,
      emailGiven: true,
      visitor: visitorToSave
    });
  };

  /**
   * Event handler for new visitor save click
   */
  private onSaveNewVisitorClick = () => {
    const { visitor, tag, existingVisitor } = this.state;

    if (!visitor || !tag) {
      return;
    }

    if (existingVisitor) {
      this.handleVisitorUpdate({ ...visitor, tagId: tag });
    } else {
      this.handleVisitorCreation({ ...visitor, tagId: tag });
    }

    strings.setLanguage("fi");
    this.setState({
      visitorCreated: true
    });
  };

  /**
   * Handles visitor update
   *
   * @param visitor visitor to be updated
   */
  private handleVisitorUpdate = async (visitor: Visitor) => {
    const { accessToken, exhibitionId } = this.props;

    if (!accessToken || !visitor.id) {
      return;
    }

    const visitorsApi = Api.getVisitorsApi(accessToken);
    await visitorsApi.updateVisitor({
      exhibitionId: exhibitionId,
      visitorId: visitor.id,
      visitor: visitor
    });
  };

  /**
   * Handles visitor creation
   *
   * @param visitor visitor to be created
   */
  private handleVisitorCreation = async (visitor: Visitor) => {
    const { accessToken, exhibitionId } = this.props;

    if (!accessToken) {
      return;
    }

    const visitorsApi = Api.getVisitorsApi(accessToken);
    await visitorsApi.createVisitor({
      exhibitionId: exhibitionId,
      visitor: visitor
    });
  };

  /**
   * Event handler for return click
   */
  private onReturnClick = () => {
    this.setState({
      beginRegistrationProcess: false,
      tag: undefined,
      existingVisitor: false,
      languageSelected: false,
      emailGiven: false,
      visitor: undefined,
      visitorCreated: false
    });
  };

  /**
   * Fetches initial data from API
   */
  private fetchData = async () => {
    const { accessToken, exhibitionId } = this.props;

    if (!accessToken) {
      return;
    }

    const contentVersionsApi = Api.getContentVersionsApi(accessToken);
    const contentVersions = await contentVersionsApi.listContentVersions({ exhibitionId });

    this.constructAvailableLanguages(contentVersions);
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    keycloak: state.auth.keycloak,
    accessToken: state.auth.accessToken
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setDeviceModels: (deviceModels: DeviceModel[]) => dispatch(setDeviceModels(deviceModels))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ReceptionScreen));
