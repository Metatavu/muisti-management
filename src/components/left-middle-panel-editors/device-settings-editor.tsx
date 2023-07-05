import { ExhibitionDevice, ExhibitionPage } from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/device-settings-editor";
import { MenuItem, TextField } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
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
 * Component for device settings editor
 */
class DeviceSettingsEditor extends React.Component<Props, {}> {
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
    const selectIndexPageItems = devicePages.map((page) => {
      return (
        <MenuItem key={page.id} value={page.id}>
          {page.name}
        </MenuItem>
      );
    });

    selectIndexPageItems.push(
      <MenuItem key={"undefinedIndexPage"} value={strings.generic.undefined}>
        {strings.generic.undefined}
      </MenuItem>
    );

    return (
      <>
        <TextField
          className={classes.nameInput}
          variant="filled"
          fullWidth
          label={strings.generic.name}
          name="name"
          value={deviceData.name}
          onChange={this.props.onChange}
        />
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
  return {};
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(DeviceSettingsEditor));
