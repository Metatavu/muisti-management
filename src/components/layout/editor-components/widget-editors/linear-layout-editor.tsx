import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType
} from "../../../../generated/client";
import strings from "../../../../localization/strings";
import styles from "../../../../styles/common-properties-editor";
import theme from "../../../../styles/theme";
import HelpDialog from "../../../generic/help-dialog";
import { LayoutLinearLayoutPropKeys } from "../../editor-constants/keys";
import { LinearLayoutOrientationValues } from "../../editor-constants/values";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertySelect from "../generic-property-select";
import { Box, Divider, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;

  /**
   * On value change handler
   * @param updatedPageLayoutView updated page layout view object
   */
  onValueChange: (updatedPageLayoutView: PageLayoutViewProperty) => void;
}

/**
 * Component for editing linear layout properties
 */
class LinearLayoutEditor extends React.Component<Props, {}> {
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
  public render() {
    return <>{this.renderOrientationEditor()}</>;
  }

  /**
   * Render orientation editor
   */
  private renderOrientationEditor = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.linearLayout.orientation}:
          </Typography>
          <GenericPropertySelect
            property={getProperty(
              this.props.pageLayoutView,
              LayoutLinearLayoutPropKeys.Orientation,
              PageLayoutViewPropertyType.String
            )}
            onSelectChange={this.props.onValueChange}
            selectItemType={LinearLayoutOrientationValues}
          />
          <HelpDialog title={strings.layoutEditor.linearLayout.orientation}>
            <Typography>{strings.helpDialogs.layoutEditor.linearLayout.introduction}</Typography>
            <Box mt={2}>
              <Typography variant="h5">Vertical</Typography>
              <Typography>
                {strings.helpDialogs.layoutEditor.linearLayout.verticalDescription}
              </Typography>
            </Box>
            <Box mt={2}>
              <Typography variant="h5">Horizontal</Typography>
              <Typography>
                {strings.helpDialogs.layoutEditor.linearLayout.horizontalDescription}
              </Typography>
            </Box>
          </HelpDialog>
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </>
    );
  };
}

export default withStyles(styles)(LinearLayoutEditor);
