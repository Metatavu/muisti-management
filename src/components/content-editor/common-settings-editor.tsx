import * as React from "react";
import { ExhibitionPage, PageLayout, ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import { TextField, MenuItem, InputLabel, Select, FormControl, SelectChangeEvent } from "@mui/material";
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import styles from "../../styles/page-settings-editor";
import theme from "../../styles/theme";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  layouts: PageLayout[];
  devices: ExhibitionDevice[];
  pageData: ExhibitionPage;
  onChange: (event: SelectChangeEvent<string>) => void;
  onChangeText: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onLayoutChange: (event: SelectChangeEvent<string>) => void;
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
    const { classes, pageData, onChangeText } = this.props;

    return (
      <>
        <TextField
          label={ strings.contentEditor.editor.pageName }
          name="name"
          value={ pageData.name }
          onChange={ onChangeText }
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
    const layoutSelectItems = layouts
      // TODO: localeCompare() seems to be broken after React/dependency updates
      // .sort((a, b) => a.name.localeCompare(b.name))
      .map(layout =>
        <MenuItem key={ layout.id } value={ layout.id }>
          { layout.name }
        </MenuItem>
      );

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
