import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { GroupedInputsType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import TextField from "../../generic/v2/text-field";
import GroupedInputsWithLock from "./grouped-inputs-with-lock";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Divider, Stack } from "@mui/material";
import { ChangeEvent } from "react";

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
 * Image Button Component Properties component
 */
const ImageButtonComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  /**
   * Event handler for border radius change events
   *
   * @param name name
   * @param value value
   */
  const onBorderRadiusChange = (name: string, value: string) => {
    const element = HtmlComponentsUtils.handleStyleAttributeChange(component.element, name, value);

    updateComponent({ ...component, element: element });
  };

  /**
   * Validates that given string is a valid URL
   *
   * @param url url to validate
   * @returns whether url is valid
   */
  const validateUrl = (url: string) => {
    try {
      return !!new URL(url);
    } catch (_) {
      return false;
    }
  };

  /**
   * Returns buttons child image resource path
   *
   * @returns image resource path
   */
  const getImageResourcePath = () => {
    const { element } = component;
    return element.children[0].getAttribute("src");
  };

  /**
   * Returns image src
   *
   * @returns image src
   */
  const getImageSrc = () => {
    return HtmlResourceUtils.getResourceData(pageLayout.defaultResources, getImageResourcePath());
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    if (!validateUrl(value) && value !== "") return;

    const resourcePath = getImageResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(resourcePath);
    if (!resourceId) return;

    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: value,
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
        <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.borderRadius} />
        <GroupedInputsWithLock
          styles={HtmlComponentsUtils.parseStyles(component.element)}
          type={GroupedInputsType.BORDER_RADIUS}
          onChange={onBorderRadiusChange}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.imageProperties.defaultResource} />
        <TextField
          value={getImageSrc()}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.imageProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
    </Stack>
  );
};

export default ImageButtonComponentProperties;
