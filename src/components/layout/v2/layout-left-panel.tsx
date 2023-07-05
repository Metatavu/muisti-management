import { DeviceModel, PageLayout } from "../../../generated/client";
import { ScreenOrientation } from "../../../generated/client";
import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import ElementNavigationPane from "../../layouts/element-navigation-pane";
import LayoutTreeMenuHtml from "./layout-tree-menu-html";
import PanelSubtitle from "./panel-subtitle";
import { MenuItem, Stack } from "@mui/material";
import { ChangeEvent } from "react";

/**
 * Components properties
 */
interface Props {
  layout: PageLayout;
  treeObjects: TreeObject[];
  selectedComponent?: TreeObject;
  deviceModels: DeviceModel[];
  onTreeComponentSelect: (component?: TreeObject) => void;
  onAddComponentClick: (path: string, asChildren: boolean) => void;
  onLayoutNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDeviceModelChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onScreenOrientationChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Layout Left Panel component
 */
const LayoutLeftPanel = ({
  layout,
  treeObjects,
  selectedComponent,
  deviceModels,
  onTreeComponentSelect,
  onAddComponentClick,
  onLayoutNameChange,
  onDeviceModelChange,
  onScreenOrientationChange
}: Props) => {
  /**
   * Renders device model menu item
   *
   * @param model device model
   */
  const renderDeviceModelMenuItem = (model: DeviceModel) => (
    <MenuItem key={model.id} value={model.id} sx={{ color: "2196F3" }}>
      {`${model.manufacturer} ${model.model}`}
    </MenuItem>
  );

  /**
   * Renders device model select
   */
  const renderDeviceModelSelect = () => (
    <>
      <PanelSubtitle subtitle={strings.layout.settings.deviceModelId} />
      <SelectBox value={layout.modelId} onChange={onDeviceModelChange}>
        {deviceModels.map(renderDeviceModelMenuItem)}
      </SelectBox>
    </>
  );

  /**
   * Renders screen orientation select
   */
  const renderScreenOrientationSelect = () => (
    <>
      <PanelSubtitle subtitle={strings.layout.settings.screenOrientation} />
      <SelectBox value={layout.screenOrientation} onChange={onScreenOrientationChange}>
        <MenuItem value={ScreenOrientation.Portrait}>{strings.layout.settings.portrait}</MenuItem>
        <MenuItem value={ScreenOrientation.Landscape}>{strings.layout.settings.landscape}</MenuItem>
      </SelectBox>
    </>
  );

  /**
   * Renders layout name change
   */
  const renderNameChange = () => (
    <>
      <PanelSubtitle subtitle={strings.layout.toolbar.name} />
      <TextField value={layout.name} onChange={onLayoutNameChange} />
    </>
  );

  return (
    <ElementNavigationPane width={250} title={strings.layout.title}>
      <Stack spacing={2}>
        {renderNameChange()}
        {renderDeviceModelSelect()}
        {renderScreenOrientationSelect()}
        <PanelSubtitle subtitle="Elementit" />
        <LayoutTreeMenuHtml
          treeObjects={treeObjects}
          selectedComponent={selectedComponent}
          onTreeComponentSelect={onTreeComponentSelect}
          onAddComponentClick={onAddComponentClick}
        />
      </Stack>
    </ElementNavigationPane>
  );
};

export default LayoutLeftPanel;
