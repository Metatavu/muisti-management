import * as React from "react";
// eslint-disable-next-line max-len
import { ExhibitionPage, PageLayout, ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select, FormControl } from "@material-ui/core";
import styles from "../../styles/page-settings-editor";
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
        <div style={{ paddingTop: theme.spacing(2) }}>
          <TextField
            label={ strings.contentEditor.editor.pageName }
            name="name"
            value={ pageData.name }
            onChange={ onChange }
          />
        </div>
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
        <FormControl>
          <InputLabel id="pageLayoutId">
            { strings.contentEditor.editor.layout }
          </InputLabel>
          <Select
            label={ strings.contentEditor.editor.layout }
            labelId="pageLayoutId"
            value={ page.layoutId }
            onChange={ onLayoutChange }
          >
            { layoutSelectItems }
          </Select>
        </FormControl>
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
        <MenuItem key={ device.id! } value={ device.id }>
          { device.name }
        </MenuItem>
      );
    });

    return (
      <FormControl>
        <InputLabel id="pageDeviceId">
          { strings.contentEditor.editor.device }
        </InputLabel>
        <Select
          label={ strings.contentEditor.editor.device }
          labelId="pageDeviceId"
          name="deviceId"
          value={ page.deviceId }
          onChange={ onChange }
        >
          { selectItems }
        </Select>
      </FormControl>
    );
  }
}

export default (withStyles(styles)(CommonSettingsEditor));
