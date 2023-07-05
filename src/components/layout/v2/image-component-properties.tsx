import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import TextField from "../../generic/v2/text-field";
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
 * Image Component Properties component
 */
const ImageComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  /**
   * Get default resource associated with element
   *
   * @returns matchingResource string
   */
  const getElementsDefaultResource = () => {
    if (!pageLayout.defaultResources) return;

    const matchingResource = pageLayout.defaultResources.find(
      (resource) => resource.id === component.element.id
    );

    return matchingResource?.data;
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
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    if (!validateUrl(value)) return;
    const foundResource = pageLayout.defaultResources?.find(
      (resource) => resource.id === component.element.id
    );
    if (foundResource) {
      setPageLayout({
        ...pageLayout,
        defaultResources: pageLayout.defaultResources?.map((resource) =>
          resource.id === foundResource?.id ? { ...resource, data: value } : resource
        )
      });
    } else {
      setPageLayout({
        ...pageLayout,
        defaultResources: [
          ...(pageLayout.defaultResources ?? []),
          {
            id: component.element.id,
            data: value,
            type: ExhibitionPageResourceType.Text,
            mode: PageResourceMode.Static
          }
        ]
      });
    }
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.imageProperties.defaultResource} />
        <TextField
          value={getElementsDefaultResource() || ""}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.textProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
    </Stack>
  );
};

export default ImageComponentProperties;
