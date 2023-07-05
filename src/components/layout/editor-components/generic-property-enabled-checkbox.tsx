import styles from "../../../styles/add-device-editor";
import { LayoutPropKeys } from "../editor-constants/keys";
import { Checkbox, FormControlLabel } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  label?: string;
  propertyName: LayoutPropKeys;
  enabled: boolean;

  /**
   * On checkbox change handler
   */
  onCheckboxChange: (propertyName: LayoutPropKeys, enabled: boolean) => void;
}

/**
 * Component for layout property enabled checkbox
 */
class GenericPropertyEnabledCheckbox extends React.Component<Props, {}> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  /**
   * Component render method
   */
  public render = () => {
    const { enabled, propertyName, label, onCheckboxChange } = this.props;

    if (label) {
      return (
        <FormControlLabel
          label={label}
          control={
            <Checkbox
              checked={enabled}
              onChange={(_, checked) => onCheckboxChange(propertyName, checked)}
              name={propertyName}
            />
          }
        />
      );
    }

    return (
      <Checkbox
        checked={enabled}
        onChange={(_, checked) => onCheckboxChange(propertyName, checked)}
        name={propertyName}
      />
    );
  };
}

export default withStyles(styles)(GenericPropertyEnabledCheckbox);
