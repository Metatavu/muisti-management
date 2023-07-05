import {
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType
} from "../../../../generated/client";
import strings from "../../../../localization/strings";
import styles from "../../../../styles/common-properties-editor";
import theme from "../../../../styles/theme";
import DisplayMetrics from "../../../../types/display-metrics";
import { LayoutPlayerViewPropKeys } from "../../editor-constants/keys";
import { getProperty } from "../../utils/tree-data-utils";
import GenericPropertyCheckbox from "../generic-property-checkbox";
import GenericPropertyTextField from "../generic-property-textfield";
import { Box, Divider, Typography } from "@mui/material";
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
 * Component for editing player view properties
 */
class PlayerViewEditor extends React.Component<Props, {}> {
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
    return (
      <>
        {this.renderAutoPlay()}
        {this.renderAutoPlayDelay()}
        {this.renderPlaybackControls()}
        {this.renderSrcEditor()}
      </>
    );
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
            {strings.layoutEditor.playerView.src}:
          </Typography>
          <GenericPropertyTextField
            disabled
            textFieldId={LayoutPlayerViewPropKeys.Src}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={getProperty(
              this.props.pageLayoutView,
              LayoutPlayerViewPropKeys.Src,
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

  /**
   * Render auto-play editor
   */
  private renderAutoPlay = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.AutoPlay,
      PageLayoutViewPropertyType.Boolean
    );

    return (
      <Box ml={2}>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.playerView.autoPlay}
            property={foundProp}
            onCheckboxChange={onValueChange}
          />
        </div>
      </Box>
    );
  };

  /**
   * Render playback controls editor
   */
  private renderPlaybackControls = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.ShowPlaybackControls,
      PageLayoutViewPropertyType.Boolean
    );

    return (
      <Box ml={2}>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.playerView.showPlaybackControls}
            property={foundProp}
            onCheckboxChange={onValueChange}
          />
        </div>
        {this.renderPlaybackButtons()}
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </Box>
    );
  };

  /**
   * Render playback buttons editor
   */
  private renderPlaybackButtons = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const showPlaybackControlsProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.ShowPlaybackControls,
      PageLayoutViewPropertyType.Boolean
    );
    const showRewindButtonProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.ShowRewindButton,
      PageLayoutViewPropertyType.Boolean
    );
    const showFastForwardButtonProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.ShowFastForwardButton,
      PageLayoutViewPropertyType.Boolean
    );
    const showPreviousButtonProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.ShowPreviousButton,
      PageLayoutViewPropertyType.Boolean
    );
    const showNextButtonProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.ShowNextButton,
      PageLayoutViewPropertyType.Boolean
    );

    if (showPlaybackControlsProp?.value !== "true") {
      return null;
    }

    return (
      <div style={{ marginLeft: theme.spacing(2) }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.playerView.showRewindButton}
            property={showRewindButtonProp}
            onCheckboxChange={onValueChange}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.playerView.showFastForwardButton}
            property={showFastForwardButtonProp}
            onCheckboxChange={onValueChange}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.playerView.showPreviousButton}
            property={showPreviousButtonProp}
            onCheckboxChange={onValueChange}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.playerView.showNextButton}
            property={showNextButtonProp}
            onCheckboxChange={onValueChange}
          />
        </div>
      </div>
    );
  };

  /**
   * Render autoplay delay editor
   */
  private renderAutoPlayDelay = () => {
    const { pageLayoutView, displayMetrics, onValueChange } = this.props;
    const autoPlayDelayProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.AutoPlayDelay,
      PageLayoutViewPropertyType.Number
    );
    const autoPlayProp = getProperty(
      pageLayoutView,
      LayoutPlayerViewPropKeys.AutoPlay,
      PageLayoutViewPropertyType.Boolean
    );

    if (autoPlayProp?.value !== "true") {
      return null;
    }

    return (
      <Box ml={2}>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <GenericPropertyTextField
            label={strings.layoutEditor.playerView.autoPlayDelay}
            textFieldId={LayoutPlayerViewPropKeys.AutoPlayDelay}
            displayMetrics={displayMetrics}
            textFieldType="number"
            property={autoPlayDelayProp}
            onTextFieldChange={onValueChange}
          />
        </div>
      </Box>
    );
  };
}

export default withStyles(styles)(PlayerViewEditor);
