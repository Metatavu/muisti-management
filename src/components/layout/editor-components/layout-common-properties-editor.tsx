import { setSelectedLayout } from "../../../actions/layouts";
import { setSelectedSubLayout } from "../../../actions/subLayouts";
import {
  PageLayout,
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType,
  SubLayout
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { ReduxActions, ReduxState } from "../../../store";
import styles from "../../../styles/common-properties-editor";
import theme from "../../../styles/theme";
import DisplayMetrics from "../../../types/display-metrics";
import HelpDialog from "../../generic/help-dialog";
import {
  LayoutMarginPropKeys,
  LayoutPaddingPropKeys,
  LayoutPropKeys
} from "../editor-constants/keys";
import { LayoutHeightValues, LayoutWidthValues } from "../editor-constants/values";
import {
  constructTreeUpdateData,
  getPaddingOrMarginProperties,
  getProperty,
  hasProperty,
  removeLayoutViewProperty,
  updateLayoutViewProperty
} from "../utils/tree-data-utils";
import ColorPicker from "./color-picker";
import GenericPropertyEnabledCheckbox from "./generic-property-enabled-checkbox";
import GenericPropertySelect from "./generic-property-select";
import GenericPropertyTextField from "./generic-property-textfield";
import GravityEditor from "./gravity-editor";
import MarginPaddingEditor from "./margin-padding-editor";
import { Box, Divider, Link, TextField, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { v4 as uuid } from "uuid";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  editingSubLayout: boolean;
  pageLayoutView: PageLayoutView;
  selectedElementPath: string;
  pageLayout: PageLayout;
  subLayout: SubLayout;
  setSelectedLayout: typeof setSelectedLayout;
  setSelectedSubLayout: typeof setSelectedSubLayout;
  displayMetrics: DisplayMetrics;

  onPageLayoutViewUpdate: (pageLayoutView: PageLayoutView) => void;
}

/**
 * Interface representing component state
 */
interface State {
  layout?: PageLayout | SubLayout;
}

/**
 * Component for editing layout properties
 */
class CommonLayoutPropertiesEditor extends React.Component<Props, State> {
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
   * Component did mount life cycle handler
   */
  public componentDidMount = () => {
    const { editingSubLayout, pageLayout, subLayout } = this.props;

    this.setState({
      layout: editingSubLayout ? subLayout : pageLayout
    });
  };

  /**
   * Component did mount life cycle handler
   *
   * @param prevProps previous props
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { pageLayout, subLayout, editingSubLayout } = this.props;
    if (
      JSON.stringify(prevProps.pageLayout) !== JSON.stringify(pageLayout) ||
      JSON.stringify(prevProps.subLayout) !== JSON.stringify(subLayout)
    ) {
      this.setState({
        layout: editingSubLayout ? subLayout : pageLayout
      });
    }
  };

  /**
   * Component render method
   */
  public render() {
    return (
      <>
        {this.renderName()}
        {this.renderLayoutWidth()}
        {this.renderLayoutHeight()}
        {this.renderLayoutElevation()}
        {this.renderLayoutBackgroundColor()}
        {this.renderBackgroundImage()}
        <div style={{ display: "flex" }}>
          {this.renderLayoutPadding()}
          {this.renderLayoutMargin()}
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
        {this.renderLayoutGravity()}
      </>
    );
  }

  /**
   * Render layout name editor
   */
  private renderName = () => {
    const { pageLayoutView } = this.props;

    return (
      <Box mt={2} mb={2} display="flex" alignItems="center">
        <TextField
          label={strings.layoutEditor.commonComponents.name}
          fullWidth
          type="text"
          name="name"
          value={pageLayoutView && pageLayoutView.name ? pageLayoutView.name : ""}
          onChange={this.onNameChange}
        />
        <HelpDialog title={strings.layoutEditor.commonComponents.name}>
          <Typography variant="body1">
            {strings.helpDialogs.layoutEditor.commonProperties.name}
          </Typography>
        </HelpDialog>
      </Box>
    );
  };

  /**
   * Render layout width editor
   */
  private renderLayoutWidth = () => {
    const { displayMetrics } = this.props;
    const foundProp = getProperty(
      this.props.pageLayoutView,
      LayoutPropKeys.LayoutWidth,
      PageLayoutViewPropertyType.String
    );

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: theme.spacing(2)
        }}
      >
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.commonComponents.layoutWidth}:
        </Typography>
        <div style={{ marginRight: theme.spacing(1) }}>
          <GenericPropertySelect
            property={foundProp}
            onSelectChange={this.onSingleValueChange}
            selectItemType={LayoutWidthValues}
          />
        </div>
        <Typography variant="h6" style={{ marginRight: theme.spacing(1) }}>
          {strings.generic.or}
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <GenericPropertyTextField
            textFieldId={LayoutPropKeys.LayoutWidth}
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={this.onSingleValueChange}
          />
          <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>
            px
          </Typography>
        </div>
        <HelpDialog title={strings.layoutEditor.commonComponents.layoutWidth}>
          <Typography>
            {strings.helpDialogs.layoutEditor.commonProperties.layoutWidth.introduction}
          </Typography>
          <Box mt={2} mb={2}>
            <Typography variant="h5">MatchParent</Typography>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.layoutWidth.matchParentDescription}
            </Typography>
          </Box>
          <Box mt={2} mb={2}>
            <Typography variant="h5">WrapContent</Typography>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.layoutWidth.wrapContentDescription}
            </Typography>
          </Box>
          <Typography>
            {strings.helpDialogs.layoutEditor.commonProperties.layoutWidth.additionalNotes}
          </Typography>
        </HelpDialog>
      </div>
    );
  };

  /**
   * Render layout width editor
   */
  private renderLayoutHeight = () => {
    const { displayMetrics } = this.props;
    const foundProp = getProperty(
      this.props.pageLayoutView,
      LayoutPropKeys.LayoutHeight,
      PageLayoutViewPropertyType.String
    );

    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing(2)
          }}
        >
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
            {strings.layoutEditor.commonComponents.layoutHeight}:
          </Typography>
          <div style={{ marginRight: theme.spacing(1) }}>
            <GenericPropertySelect
              property={foundProp}
              onSelectChange={this.onSingleValueChange}
              selectItemType={LayoutHeightValues}
            />
          </div>
          <Typography variant="h6" style={{ marginRight: theme.spacing(1) }}>
            {strings.generic.or}
          </Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <GenericPropertyTextField
              textFieldId={LayoutPropKeys.LayoutHeight}
              textFieldType="number"
              textFieldUnit="px"
              displayMetrics={displayMetrics}
              property={foundProp}
              onTextFieldChange={this.onSingleValueChange}
            />
            <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>
              px
            </Typography>
          </div>
          <HelpDialog title={strings.layoutEditor.commonComponents.layoutWidth}>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.layoutWidth.introduction}
            </Typography>
            <Box mt={2} mb={2}>
              <Typography variant="h5">MatchParent</Typography>
              <Typography>
                {
                  strings.helpDialogs.layoutEditor.commonProperties.layoutWidth
                    .matchParentDescription
                }
              </Typography>
            </Box>
            <Box mt={2} mb={2}>
              <Typography variant="h5">WrapContent</Typography>
              <Typography>
                {
                  strings.helpDialogs.layoutEditor.commonProperties.layoutWidth
                    .wrapContentDescription
                }
              </Typography>
            </Box>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.layoutWidth.additionalNotes}
            </Typography>
          </HelpDialog>
        </div>
      </>
    );
  };

  /**
   * Render layout elevation editor
   */
  private renderLayoutElevation = () => {
    const { displayMetrics } = this.props;
    const foundProp = getProperty(
      this.props.pageLayoutView,
      LayoutPropKeys.Elevation,
      PageLayoutViewPropertyType.String
    );

    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing(2)
          }}
        >
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
            {strings.layoutEditor.commonComponents.elevation}:
          </Typography>
          <div style={{ display: "flex", alignItems: "center" }}>
            <GenericPropertyTextField
              tooltip={strings.layoutEditor.commonComponents.elevationTooltip}
              textFieldId={LayoutPropKeys.Elevation}
              textFieldType="number"
              textFieldUnit="px"
              displayMetrics={displayMetrics}
              property={foundProp}
              onTextFieldChange={this.onSingleValueChange}
            />
            <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>
              dp
            </Typography>
          </div>
          <HelpDialog title={strings.layoutEditor.commonComponents.elevation}>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.elevation.introduction}
            </Typography>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.elevation.description}
            </Typography>
            <Box mt={2}>
              <Typography>
                {strings.helpDialogs.layoutEditor.commonProperties.elevation.readMore}
                <Link
                  color="secondary"
                  href="https://material.io/design/environment/elevation.html#elevation-in-material-design"
                  target="_blank"
                >
                  {strings.helpDialogs.layoutEditor.commonProperties.elevation.link}
                </Link>
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

  /**
   * Render layout background color editor
   */
  private renderLayoutBackgroundColor = () => {
    const { displayMetrics } = this.props;
    const foundProp = getProperty(
      this.props.pageLayoutView,
      LayoutPropKeys.LayoutBackgroundColor,
      PageLayoutViewPropertyType.Color
    );
    return (
      <>
        <Typography variant="h6">
          {strings.layoutEditor.commonComponents.backgroundColor}
        </Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker property={foundProp} onColorChange={this.onSingleValueChange} />
          </div>
          <GenericPropertyTextField
            textFieldId={LayoutPropKeys.LayoutBackgroundColor}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={this.onSingleValueChange}
          />
          <HelpDialog title={strings.layoutEditor.commonComponents.backgroundColor}>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.backgroundColor}
            </Typography>
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

  /**
   * Render button background image resource editor
   */
  private renderBackgroundImage = () => {
    const { pageLayoutView } = this.props;

    const hasBackgroundImage = hasProperty(
      pageLayoutView,
      LayoutPropKeys.BackgroundImage,
      PageLayoutViewPropertyType.String
    );

    return (
      <>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: theme.spacing(2)
          }}
        >
          <GenericPropertyEnabledCheckbox
            label={strings.layoutEditor.commonComponents.hasBackgroundImage}
            propertyName={LayoutPropKeys.BackgroundImage}
            enabled={hasBackgroundImage}
            onCheckboxChange={this.onToggleProperty}
          />
          <HelpDialog title={strings.layoutEditor.commonComponents.hasBackgroundImage}>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.backgroundImage}
            </Typography>
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

  /**
   * Render layout padding editor
   */
  private renderLayoutPadding = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">
            {strings.layoutEditor.commonComponents.paddings.title}:
          </Typography>
          <HelpDialog title={strings.layoutEditor.commonComponents.margins.title}>
            <Typography>{strings.helpDialogs.layoutEditor.commonProperties.padding}</Typography>
          </HelpDialog>
        </Box>
        <MarginPaddingEditor
          itemKey="layout_padding"
          properties={getPaddingOrMarginProperties(
            this.props.pageLayoutView,
            LayoutPaddingPropKeys
          )}
          onSingleValueChange={this.onSingleValueChange}
          onMultipleValueChange={this.onMultipleValueChange}
        />
      </div>
    );
  };

  /**
   * Render layout margin editor
   */
  private renderLayoutMargin = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">
            {strings.layoutEditor.commonComponents.margins.title}:
          </Typography>
          <HelpDialog title={strings.layoutEditor.commonComponents.margins.title}>
            <Typography>{strings.helpDialogs.layoutEditor.commonProperties.padding}</Typography>
          </HelpDialog>
        </Box>
        <MarginPaddingEditor
          itemKey="layout_margin"
          properties={getPaddingOrMarginProperties(this.props.pageLayoutView, LayoutMarginPropKeys)}
          onSingleValueChange={this.onSingleValueChange}
          onMultipleValueChange={this.onMultipleValueChange}
        />
      </div>
    );
  };

  /**
   * Render layout gravity editor
   */
  private renderLayoutGravity = () => {
    return (
      <div style={{ padding: theme.spacing(1) }}>
        <Box display="flex" alignItems="center">
          <Typography variant="h6">
            {strings.layoutEditor.commonComponents.layoutGravity}:
          </Typography>
          <HelpDialog title={strings.layoutEditor.commonComponents.layoutGravity}>
            <Typography>
              {strings.helpDialogs.layoutEditor.commonProperties.gravity.description}
            </Typography>
            <Typography variant="h6">
              {strings.helpDialogs.layoutEditor.commonProperties.gravity.note}
            </Typography>
          </HelpDialog>
        </Box>
        <GravityEditor
          property={getProperty(
            this.props.pageLayoutView,
            LayoutPropKeys.LayoutGravity,
            PageLayoutViewPropertyType.String
          )}
          onSingleValueChange={this.onSingleValueChange}
        />
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </div>
    );
  };

  /**
   * On name change handler
   *
   * @param event react text field event
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectedElementPath, editingSubLayout, onPageLayoutViewUpdate } = this.props;
    const { layout } = this.state;

    const key = event.target.name;
    const value = event.target.value;

    if (!layout || !key) {
      return;
    }

    const layoutView = { ...this.props.pageLayoutView, [key]: value } as PageLayoutView;
    const tempLayout = { ...layout } as PageLayout | SubLayout;
    const layoutToUpdate = constructTreeUpdateData(tempLayout, layoutView, selectedElementPath);
    editingSubLayout
      ? this.props.setSelectedSubLayout(layoutToUpdate)
      : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout: layoutToUpdate
    });

    onPageLayoutViewUpdate(layoutView);
  };

  /**
   * Generic handler for single page layout property value changes
   *
   * @param updatedPageLayoutView page layout view property object to update
   */
  private onSingleValueChange = (pageLayoutViewProperty: PageLayoutViewProperty) => {
    const { selectedElementPath, editingSubLayout, onPageLayoutViewUpdate } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutView = { ...this.props.pageLayoutView } as PageLayoutView;
    const updatedLayoutView = updateLayoutViewProperty(pageLayoutViewProperty, layoutView);
    const layoutToUpdate = constructTreeUpdateData(
      currentLayout,
      updatedLayoutView,
      selectedElementPath
    );
    editingSubLayout
      ? this.props.setSelectedSubLayout(layoutToUpdate)
      : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout: layoutToUpdate
    });

    onPageLayoutViewUpdate(layoutView);
  };

  /**
   * Generic handler for single page layout property value removals
   *
   * @param layoutPropertyKey layout property key
   */
  private onSingleValueRemove = (layoutPropertyKey: LayoutPropKeys) => {
    const { selectedElementPath, editingSubLayout, onPageLayoutViewUpdate } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutView = { ...this.props.pageLayoutView } as PageLayoutView;
    const updatedLayoutView = removeLayoutViewProperty(layoutPropertyKey, layoutView);
    const layoutToUpdate = constructTreeUpdateData(
      currentLayout,
      updatedLayoutView,
      selectedElementPath
    );
    editingSubLayout
      ? this.props.setSelectedSubLayout(layoutToUpdate)
      : this.props.setSelectedLayout(layoutToUpdate);
    this.setState({
      layout: layoutToUpdate
    });

    onPageLayoutViewUpdate(layoutView);
  };

  /**
   * Generic handler for multiple page layout property value changes
   *
   * @param updatedPageLayoutViews list of page layout view property objects to update
   */
  private onMultipleValueChange = (pageLayoutViewProperties: PageLayoutViewProperty[]) => {
    const { selectedElementPath, onPageLayoutViewUpdate } = this.props;
    const currentLayout = { ...this.state.layout } as PageLayout | SubLayout;
    if (!currentLayout) {
      return;
    }

    const layoutViewToUpdate = { ...this.props.pageLayoutView } as PageLayoutView;

    pageLayoutViewProperties.forEach((property) => {
      updateLayoutViewProperty(property, layoutViewToUpdate);
    });

    const layoutToUpdate = constructTreeUpdateData(
      currentLayout,
      layoutViewToUpdate,
      selectedElementPath
    );
    this.props.setSelectedSubLayout(layoutToUpdate);
    this.setState({
      layout: layoutToUpdate
    });

    onPageLayoutViewUpdate(layoutViewToUpdate);
  };

  /**
   * Event handler for toggle property
   *
   * @param layoutPropertyKey layout property key
   * @param enabled is property enabled
   */
  private onToggleProperty = (layoutPropertyKey: LayoutPropKeys, enabled: boolean) => {
    if (enabled) {
      switch (layoutPropertyKey) {
        case LayoutPropKeys.BackgroundImage:
          this.onSingleValueChange({
            name: "backgroundImage",
            type: PageLayoutViewPropertyType.String,
            value: `@resources/${uuid()}`
          });
          break;
        default:
          break;
      }
    } else {
      this.onSingleValueRemove(layoutPropertyKey);
    }
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    pageLayout: state.layouts.selectedLayout as PageLayout,
    subLayout: state.subLayouts.selectedSubLayout as SubLayout
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {
    setSelectedLayout: (layout: PageLayout) => dispatch(setSelectedLayout(layout)),
    setSelectedSubLayout: (subLayout: SubLayout) => dispatch(setSelectedSubLayout(subLayout))
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(CommonLayoutPropertiesEditor));
