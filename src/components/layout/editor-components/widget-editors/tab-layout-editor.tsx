import {
  PageLayout,
  PageLayoutView,
  PageLayoutViewProperty,
  PageLayoutViewPropertyType
} from "../../../../generated/client";
import strings from "../../../../localization/strings";
import styles from "../../../../styles/common-properties-editor";
import theme from "../../../../styles/theme";
import DisplayMetrics from "../../../../types/display-metrics";
import { allowedContainerTypes } from "../../editor-constants/constants";
import { LayoutTabPropKeys } from "../../editor-constants/keys";
import {
  SelectedTabIndicatorGravityValues,
  TabGravityValues,
  TabModeValues
} from "../../editor-constants/values";
import { getProperty } from "../../utils/tree-data-utils";
import ColorPicker from "../color-picker";
import GenericPropertyCheckbox from "../generic-property-checkbox";
import GenericPropertySwitch from "../generic-property-switch";
import GenericPropertyTextField from "../generic-property-textfield";
import GravityEditor from "../gravity-editor";
import { Box, Divider, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  pageLayoutView: PageLayoutView;
  displayMetrics: DisplayMetrics;
  pageLayout: PageLayout;

  /**
   * On value change handler
   *
   * @param updatedPageLayoutView updated page layout view object
   */
  onValueChange: (updatedPageLayoutView: PageLayoutViewProperty) => void;

  onPageLayoutViewMetadataChange: (pageLayoutView: PageLayoutView) => void;
}

/**
 * Component for editing tab layout properties
 */
class TabLayoutEditor extends React.Component<Props, {}> {
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
        {this.renderContentContainer()}
        {this.renderTabMode()}
        {this.renderTabGravity()}
        {this.renderSelectedTabIndicatorColor()}
        {this.renderSelectedTabIndicatorGravity()}
        {this.renderSelectedTabIndicatorHeight()}
        {this.renderTabTextColorNormal()}
        {this.renderTabTextColorSelected()}
        {this.renderUnboundedRipple()}
        {this.renderTabIndicatorFullWidth()}
      </>
    );
  }

  /**
   * Render tab component content container selection
   */
  private renderContentContainer = () => {
    const { pageLayoutView } = this.props;

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
          {strings.layoutEditor.tab.contentContainer}:
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Select
            variant="filled"
            fullWidth
            onChange={this.handleSelectChange}
            name="contentContainerId"
            value={pageLayoutView.contentContainerId}
          >
            {this.renderNoSelection()}
            {this.getSelectItems()}
          </Select>
        </div>
      </div>
    );
  };

  /**
   * Renders no selection item
   */
  private renderNoSelection = () => {
    return (
      <MenuItem key={"undefined"} value={"undefined"}>
        {strings.generic.undefined}
      </MenuItem>
    );
  };

  /**
   * Render tab mode editor
   */
  private renderTabMode = () => {
    const { onValueChange, pageLayoutView } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.TabMode,
      PageLayoutViewPropertyType.String
    );

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
            {strings.layoutEditor.tab.mode.title}:
          </Typography>
          <div style={{ flexGrow: 0 }}>
            <GenericPropertySwitch
              switchId={LayoutTabPropKeys.TabMode}
              property={foundProp}
              switchOptions={[TabModeValues.Scrollable, TabModeValues.Fixed]}
              onSwitchChange={onValueChange}
            />
          </div>
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
   * Render tab gravity editor
   */
  private renderTabGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.TabGravity,
      PageLayoutViewPropertyType.Color
    );

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
            {strings.layoutEditor.tab.gravity.title}:
          </Typography>
          <GravityEditor
            property={foundProp}
            onSingleValueChange={onValueChange}
            gravityOptions={TabGravityValues}
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
   * Render selected tab indicator color editor
   */
  private renderSelectedTabIndicatorColor = () => {
    const { onValueChange, pageLayoutView, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.SelectedTabIndicatorColor,
      PageLayoutViewPropertyType.Color
    );

    return (
      <>
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.tab.selectedIndicatorColor}:
        </Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker property={foundProp} onColorChange={onValueChange} />
          </div>
          <GenericPropertyTextField
            textFieldId={LayoutTabPropKeys.SelectedTabIndicatorColor}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={onValueChange}
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
   * Render selected tab indicator gravity editor
   */
  private renderSelectedTabIndicatorGravity = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.SelectedTabIndicatorGravity,
      PageLayoutViewPropertyType.Color
    );

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
            {strings.layoutEditor.tab.selectedIndicatorGravity.title}:
          </Typography>
          <GravityEditor
            property={foundProp}
            onSingleValueChange={onValueChange}
            gravityOptions={SelectedTabIndicatorGravityValues}
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
   * Render selected tab indication height editor
   */
  private renderSelectedTabIndicatorHeight = () => {
    const { pageLayoutView, onValueChange, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.SelectedTabIndicatorHeight,
      PageLayoutViewPropertyType.String
    );

    return (
      <>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
            {strings.layoutEditor.tab.selectedIndicatorHeight}:
          </Typography>
          <GenericPropertyTextField
            textFieldId={LayoutTabPropKeys.SelectedTabIndicatorHeight}
            textFieldType="number"
            textFieldUnit="px"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={onValueChange}
          />
          <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>
            px
          </Typography>
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
   * Render tab text color editor
   */
  private renderTabTextColorNormal = () => {
    const { onValueChange, pageLayoutView, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.TabTextColorNormal,
      PageLayoutViewPropertyType.Color
    );

    return (
      <>
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.tab.textColorNormal}:
        </Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker property={foundProp} onColorChange={onValueChange} />
          </div>
          <GenericPropertyTextField
            textFieldId={LayoutTabPropKeys.TabTextColorNormal}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={onValueChange}
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
   * Render selected tab text color editor
   */
  private renderTabTextColorSelected = () => {
    const { onValueChange, pageLayoutView, displayMetrics } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.TabTextColorSelected,
      PageLayoutViewPropertyType.Color
    );

    return (
      <>
        <Typography style={{ marginRight: theme.spacing(2), whiteSpace: "nowrap" }} variant="h6">
          {strings.layoutEditor.tab.textColorSelected}:
        </Typography>
        <div style={{ display: "flex", alignItems: "center", marginTop: theme.spacing(2) }}>
          <div style={{ marginRight: theme.spacing(2) }}>
            <ColorPicker property={foundProp} onColorChange={onValueChange} />
          </div>
          <GenericPropertyTextField
            textFieldId={LayoutTabPropKeys.TabTextColorSelected}
            textFieldType="text"
            displayMetrics={displayMetrics}
            property={foundProp}
            onTextFieldChange={onValueChange}
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
   * Render unbounded ripple editor
   */
  private renderUnboundedRipple = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.UnboundedRipple,
      PageLayoutViewPropertyType.Boolean
    );

    return (
      <Box ml={1}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.tab.unboundedRipple}
            property={foundProp}
            onCheckboxChange={onValueChange}
          />
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </Box>
    );
  };

  /**
   * Render tab indicator full width editor
   */
  private renderTabIndicatorFullWidth = () => {
    const { pageLayoutView, onValueChange } = this.props;
    const foundProp = getProperty(
      pageLayoutView,
      LayoutTabPropKeys.TabIndicatorFullWidth,
      PageLayoutViewPropertyType.Boolean
    );

    return (
      <Box ml={1}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <GenericPropertyCheckbox
            label={strings.layoutEditor.tab.tabIndicatorFullWidth}
            property={foundProp}
            onCheckboxChange={onValueChange}
          />
        </div>
        <Divider
          variant="fullWidth"
          color="rgba(0,0,0,0.1)"
          style={{ marginTop: theme.spacing(2), marginBottom: theme.spacing(2) }}
        />
      </Box>
    );
  };

  /**
   * Get content container select items
   */
  private getSelectItems = () => {
    const { pageLayout } = this.props;

    const elementList: JSX.Element[] = [];
    this.constructSingleElement(elementList, pageLayout.data.children);
    return elementList;
  };

  /**
   * Recursive function that constructs single menu item element
   *
   * @param elementList JSX element list
   * @param pageLayoutViews list of page layout views
   */
  private constructSingleElement = (
    elementList: JSX.Element[],
    pageLayoutViews: PageLayoutView[]
  ) => {
    pageLayoutViews.forEach((pageLayoutView) => {
      if (allowedContainerTypes.includes(pageLayoutView.widget)) {
        const selectItem = (
          <MenuItem key={pageLayoutView.id} value={pageLayoutView.id}>
            {pageLayoutView.name ?? ""}
          </MenuItem>
        );
        elementList.push(selectItem);
      }

      if (pageLayoutView.children.length > 0) {
        this.constructSingleElement(elementList, pageLayoutView.children);
      }
    });

    return elementList;
  };

  /**
   * Event handler for container id select value change
   *
   * @param event react change event
   */
  private handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { pageLayoutView, onPageLayoutViewMetadataChange } = this.props;

    const key = event.target.name;
    const value = event.target.value as string;

    if (!key) {
      return;
    }

    const pageLayoutViewToUpdate = { ...pageLayoutView, [key]: value } as PageLayoutView;
    onPageLayoutViewMetadataChange(pageLayoutViewToUpdate);
  };
}

export default withStyles(styles)(TabLayoutEditor);
