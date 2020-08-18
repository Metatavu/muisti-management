import * as React from "react";
// eslint-disable-next-line max-len
import { ExhibitionPage, PageLayout, ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import theme from "../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layouts: PageLayout[];
  devices: ExhibitionDevice[];
  pageData: ExhibitionPage;
  onChange: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => void;
  onLayoutChange: (event: React.ChangeEvent<{ name?: string; value: any }>) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for common exhibition page settings editor
 */
class CommonSettingsEditor extends React.Component<Props, State> {

  /**
   * Constructor
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component render method
   */
  public render() {
    const { classes, pageData, onChange } = this.props;

    return (
      <>
        <TextField
          fullWidth
          variant="filled"
          label={ strings.contentEditor.editor.pageName }
          name="name"
          value={ pageData.name }
          onChange={ onChange }
        />
        <div className={ classes.selectFields }>
          { this.renderDeviceSelect(pageData) }
          { this.renderLayoutSelect(pageData) }
        </div>
      </>
    );
  }

  /**
   * Render layout select
   *
   * @param page selected page
   */
  private renderLayoutSelect = (page: ExhibitionPage) => {
    const { layouts, onLayoutChange } = this.props;
    const layoutSelectItems = layouts.map(layout => {
      return (
        <MenuItem key={ layout.id } value={ layout.id }>
          { layout.name }
        </MenuItem>
      );
    });

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <InputLabel id="pageLayoutId">
        { strings.contentEditor.editor.layout }
        </InputLabel>
        <Select
          variant="filled"
          labelId="pageLayoutId"
          fullWidth value={ page.layoutId }
          onChange={ onLayoutChange }
        >
          { layoutSelectItems }
        </Select>
      </div>
    );
  }

  /**
   * Renders device select
   *
   * @param page selected page
   */
  private renderDeviceSelect = (page: ExhibitionPage) => {
    const { devices, onChange } = this.props;
    const selectItems = devices.map(device => {
      return (
        <MenuItem key={ device.id || "" } value={ device.id }>
          { device.name }
        </MenuItem>
      );
    });

    return (
      <>
        <InputLabel id="pageDeviceId">
          { strings.contentEditor.editor.device }
        </InputLabel>
        <Select
          variant="filled"
          labelId="pageDeviceId"
          fullWidth
          name="deviceId"
          value={ page.deviceId }
          onChange={ onChange }
        >
          { selectItems }
        </Select>
      </>
    );
  }
}

export default (withStyles(styles)(CommonSettingsEditor));
