import * as React from "react";
import { ExhibitionPage, ExhibitionDevice } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField, MenuItem, InputLabel, Select } from "@material-ui/core";
import styles from "../../styles/device-settings-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  deviceData: ExhibitionDevice;
  devicePages: ExhibitionPage[];
  onChange: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for device settings editor
 */
class DeviceSettingsEditor extends React.Component<Props, State> {

  /**
   * Constructor
   * 
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
    const { classes, deviceData, devicePages } = this.props;
    const selectIndexPageItems = devicePages.map(page => {
      return (
        <MenuItem key={ page.id } value={ page.id }>{ page.name }</MenuItem>
      );
    });

    selectIndexPageItems.push(<MenuItem key={ "undefinedIndexPage" } value={ undefined }>{ strings.generic.undefined }</MenuItem>);

    return (
      <>
        <TextField
          className={ classes.nameInput }
          variant="filled"
          fullWidth
          label={ strings.generic.name }
          name="name"
          value={ deviceData.name }
          onChange={ this.props.onChange }
        />
        <InputLabel id="indexPageId">
          { strings.exhibition.deviceSettingsEditor.indexPageId }
        </InputLabel>
        <Select 
          variant="filled"
          labelId="indexPageId"
          fullWidth
          name="indexPageId"
          value={ deviceData.indexPageId || strings.generic.undefined }
          onChange={ this.props.onChange }
        >
          { selectIndexPageItems }
        </Select>
      </>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DeviceSettingsEditor));