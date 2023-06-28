import { Divider, MenuItem, Stack, TextField } from "@mui/material";
import { TextComponentHTMLElementTypes, TreeObject } from "../../../types";
import PropertyBox from "./property-box";
import { ChangeEvent } from "react";
import strings from "../../../localization/strings";
import { ExhibitionPageResource, ExhibitionPageResourceType, PageLayout, PageResourceMode } from "../../../generated/client";
import PanelSubtitle from "./panel-subtitle";
import SelectBox from "../../generic/v2/select-box";

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
 * Renders text component properties
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
  const onElementChange = ({ target: { value } } : ChangeEvent<HTMLInputElement>) => {
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

    const matchingResource = pageLayout.defaultResources.find(resource => resource.id === component.element.id);

    return matchingResource?.data;
  }

  // TODO: This can be lifted tot he layout-screen-html
  /**
   * Event handler for default resources change
   *
   * @param value value
   */
  const onDefaultResourcesChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const hasResource = pageLayout.defaultResources?.find(resource => resource.id === component.element.id);

    if (hasResource) {
      const updatedResources = pageLayout.defaultResources?.map(resource => {
        if (resource.id === hasResource.id) {
          resource.data = value;
          return resource;
        }
        return resource;
      });

      setPageLayout({
        ...pageLayout,
        defaultResources: updatedResources
      });
    } else {
      const newResource: ExhibitionPageResource = {
        id: component.element.id,
        data: value,
        type: ExhibitionPageResourceType.Text,
        mode: PageResourceMode.Static
      };

      setPageLayout({
        ...pageLayout,
        defaultResources: [ ...pageLayout.defaultResources ?? [] , newResource ]
      });
    }
  };

	return (
		<Stack>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        <PanelSubtitle subtitle={ strings.layout.htmlProperties.textProperties.elementType }/>
        <SelectBox value={ component.element.tagName } onChange={ onElementChange }>
          { Object.values(TextComponentHTMLElementTypes).map(type => (
            <MenuItem
              key={ type }
              value={ type }
              sx={{ color: "#2196F3" }}
            >
              { type }
            </MenuItem>
          )) }
        </SelectBox>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        <PanelSubtitle subtitle={ strings.layout.htmlProperties.textProperties.defaultResources }/>
        <TextField
          variant="standard"
          value={ getElementsDefaultResource() || "" }
          onChange={ onDefaultResourcesChange }
          inputProps={{
            sx:{ backgroundColor: "#fbfbfb" }
            }}
          placeholder={ strings.layout.htmlProperties.textProperties.defaultResources }
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }}/>
		</Stack>
	);
};

export default TextComponentProperties;