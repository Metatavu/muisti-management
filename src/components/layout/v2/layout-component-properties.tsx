import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import AlignmentEditorHtml from "./alignment-editor-html";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Divider, MenuItem, Stack } from "@mui/material";
import { ChangeEvent, FC } from "react";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
  pageLayout: PageLayout;
  setPageLayout: (foundLayout: PageLayout) => void;
}

/**
 * Renders layout component properties
 */
const LayoutComponentProperties: FC<Props> = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}) => {
  /**
   * Event handler for layout alignment change events
   *
   * @param name name
   * @param value value
   */
  const onAlignmentChange = (name: string, value: string) => {
    HtmlComponentsUtils.handleStyleAttributeChange(component.element, name, value);
    updateComponent(component);
  };

  /**
   * Event handler for property change events
   *
   * @param event event
   */
  const onPropertyChange = ({ target: { value, name } }: ChangeEvent<HTMLInputElement>) => {
    const val = name === "gap" ? `${value}px ${value}px` : value;
    HtmlComponentsUtils.handleStyleAttributeChange(component.element, name, val);

    updateComponent(component);
  };

  /**
   * Gets elements background image source
   */
  const getBackgroundImageSrc = () => {
    const { element } = component;
    const styles = HtmlComponentsUtils.parseStyles(element);
    const backgroundImage = styles["background-image"];

    const resourceData = HtmlResourceUtils.getResourceData(
      pageLayout.defaultResources,
      backgroundImage
    );

    return resourceData === "none" ? "" : resourceData?.replace("url('", "").replace("')", "");
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const { element } = component;
    const styles = HtmlComponentsUtils.parseStyles(element);
    const backgroundImage = styles["background-image"];
    const resourceId = HtmlResourceUtils.getResourceId(backgroundImage);
    if (!resourceId) return;
    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: !value ? "none" : `url('${value}')`,
        type: ExhibitionPageResourceType.Image,
        mode: PageResourceMode.Static
      }
    ];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.backgroundImage} />
        <TextField
          name="background-image"
          value={getBackgroundImageSrc()}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.genericProperties.backgroundImage}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.layoutProperties.contentEmphasis} />
        <AlignmentEditorHtml onChange={onAlignmentChange} element={component.element} />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PanelSubtitle
            sx={{ flex: 1 }}
            subtitle={strings.layoutEditorV2.layoutProperties.contentDirection.label}
          />
          <SelectBox
            name="flex-direction"
            sx={{ flex: 1 }}
            value={component.element.style.flexDirection ?? "row"}
            onChange={onPropertyChange}
          >
            <MenuItem value={"row"}>
              {strings.layoutEditorV2.layoutProperties.contentDirection.row}
            </MenuItem>
            <MenuItem value={"column"}>
              {strings.layoutEditorV2.layoutProperties.contentDirection.column}
            </MenuItem>
          </SelectBox>
        </Stack>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PanelSubtitle
            sx={{ flex: 1 }}
            subtitle={strings.layoutEditorV2.layoutProperties.contentGap}
          />
          <TextField
            name="gap"
            number
            sx={{ flex: 0.5 }}
            value={parseInt(component.element?.style.gap || "0").toString()}
            onChange={onPropertyChange}
          />
        </Stack>
      </PropertyBox>
    </Stack>
  );
};

export default LayoutComponentProperties;
