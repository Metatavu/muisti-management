import * as React from "react";
import { PageLayoutViewProperty, PageLayoutViewPropertyType, PageLayoutView } from "../../../../generated/client";
import strings from "../../../../localization/strings";
import { WithStyles, withStyles, Typography, Divider } from "@material-ui/core";
import styles from "../../../../styles/common-properties-editor";
import GenericPropertySelect from "../generic-property-select";
import { LinearLayoutOrientationValues } from "../../editor-constants/values";
import { LayoutLinearLayoutPropKeys } from "../../editor-constants/keys";
import theme from "../../../../styles/theme";
import { getProperty } from "../../utils/tree-data-utils";

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
 * Interface representing component state
 */
interface State {
}

/**
 * Component for editing linear layout properties
 */
class LinearLayoutEditor extends React.Component<Props, State> {

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
        { this.renderOrientationEditor() }
      </>
    );
  }

  /**
   * Render orientation editor
   */
  private renderOrientationEditor = () => {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography
            style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }}
            variant="h4"
          >
            { strings.layoutEditor.linearLayout.orientation }:
          </Typography>
          <GenericPropertySelect
            property={ getProperty(this.props.pageLayoutView, LayoutLinearLayoutPropKeys.Orientation, PageLayoutViewPropertyType.String) }
            onSelectChange={ this.props.onValueChange }
            selectItemType={ LinearLayoutOrientationValues }
          />
        </div>
        <Divider variant="fullWidth" color="rgba(0,0,0,0.1)" style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }} />
      </>
    );
  }
}

export default (withStyles(styles)(LinearLayoutEditor));