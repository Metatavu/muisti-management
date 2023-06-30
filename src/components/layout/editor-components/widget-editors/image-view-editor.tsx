import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType
} from "../../../../generated/client";
import strings from "../../../../localization/strings";
import styles from "../../../../styles/common-properties-editor";
import theme from "../../../../styles/theme";
import DisplayMetrics from "../../../../types/display-metrics";
import { LayoutImageViewPropKeys } from "../../editor-constants/keys";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertyTextField from "../generic-property-textfield";
import { Divider, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;
  displayMetrics: DisplayMetrics;

  /**
   * On value change handler
   * @param updatedPageLayoutView updated page layout view object
   */
  onValueChange: (updatedPageLayoutView: PageLayoutViewProperty) => void;
}

/**
 * Component for editing image view properties
 */
class ImageViewEditor extends React.Component<Props, {}> {
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
    return <>{this.renderSrcEditor()}</>;
  }

  /**
   * Render flow text view text resource editor
   */
  private renderSrcEditor = () => {
    const { displayMetrics } = this.props;
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h4">
            {strings.layoutEditor.imageView.src}:
          </Typography>
          <GenericPropertyTextField
            disabled
            textFieldId={LayoutImageViewPropKeys.Src}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutImageViewPropKeys.Src,
              PageLayoutViewPropertyType.String
            )}
            onTextFieldChange={this.props.onValueChange}
          />
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

export default withStyles(styles)(ImageViewEditor);
