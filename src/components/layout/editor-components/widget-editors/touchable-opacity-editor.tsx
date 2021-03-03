import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView } from "../../../../generated/client";
import strings from "../../../../localization/strings";
import { WithStyles, withStyles, Typography, Divider } from "@material-ui/core";
import styles from "../../../../styles/common-properties-editor";
import { LayoutButtonPropKeys } from "../../editor-constants/keys";
import theme from "../../../../styles/theme";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertyTextField from "../generic-property-textfield";
import DisplayMetrics from "../../../../types/display-metrics";
import HelpDialog from "../../../generic/help-dialog";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;
  displayMetrics: DisplayMetrics;

  /**
   * On value change handler
   *
   * @param updatedPageLayoutView updated page layout view object
   */
  onValueChange: (updatedPageLayoutView: PageLayoutViewProperty) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for editing touchable opacity properties
 */
class TouchableOpacityEditor extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Component render method
   */
  public render() {
    return (
      <>
        { this.renderWidth() }
        { this.renderHeight() }
      </>
    );
  }

  /**
   * Render touchable opacity width editor
   */
  private renderWidth = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.button.width }:
          </Typography>
          <GenericPropertyTextField
            textFieldId={ LayoutButtonPropKeys.Width }
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={ displayMetrics }
            property={ getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.Width, PageLayoutViewPropertyType.String) }
            onTextFieldChange={ this.props.onValueChange }
          />
          <HelpDialog title={ strings.layoutEditor.button.width }>
            <Typography>
              { strings.helpDialogs.layoutEditor.button.width }
            </Typography>
          </HelpDialog>
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }

  /**
   * Render touchable opacity height editor
   */
  private renderHeight = () => {
    const { displayMetrics } = this.props;

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.button.height }:
          </Typography>
          <GenericPropertyTextField
            textFieldId={ LayoutButtonPropKeys.Height }
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={ displayMetrics }
            property={ getProperty(this.props.pageLayoutView, LayoutButtonPropKeys.Height, PageLayoutViewPropertyType.String) }
            onTextFieldChange={ this.props.onValueChange }
          />
          <HelpDialog title={ strings.layoutEditor.button.height }>
            <Typography>
              { strings.helpDialogs.layoutEditor.button.height }
            </Typography>
          </HelpDialog>
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }
}

export default (withStyles(styles)(TouchableOpacityEditor));
