import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { HtmlTextComponentType, TreeObject } from "../../../types";
import LocalizationUtils from "../../../utils/localization-utils";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import FontColorEditor from "./font-color-editor";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Divider, MenuItem, Stack } from "@mui/material";
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
 * Text Component Properties component
 */
const TextComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  /**
   * Event handler for element change events
   *
   * @param value value
   */
  const handleElementChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const updatedHTMLTag = document.createElement(value);

    for (const attribute of component.element.attributes) {
      updatedHTMLTag.setAttribute(attribute.name, attribute.value);
    }

    updateComponent({
      ...component,
      element: updatedHTMLTag
    });
  };

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
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
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
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.elementType} />
        <SelectBox value={component.element.tagName} onChange={handleElementChange}>
          {Object.values(HtmlTextComponentType).map((type) => (
            <MenuItem key={type} value={type} sx={{ color: "#2196F3" }}>
              {LocalizationUtils.getLocalizedTextComponentType(type)}
            </MenuItem>
          ))}
        </SelectBox>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <FontColorEditor component={component} updateComponent={updateComponent} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.defaultResource} />
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

export default TextComponentProperties;
