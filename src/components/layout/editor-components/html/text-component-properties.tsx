import { Divider, MenuItem, Stack, TextField } from "@mui/material";
import { TextComponentHTMLElementTypes, TreeObject } from "../../../../types";
import PropertyBox from "./generic/property-box";
import renderPanelSubtitle from "./generic/render-panel-subtitle";
import { ChangeEvent, FC } from "react";
import strings from "../../../../localization/strings";
import { ExhibitionPageResource, ExhibitionPageResourceType, PageLayout, PageResourceMode } from "../../../../generated/client";

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
const TextComponentProperties: FC<Props> = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}) => {
  /**
   * Event handler for element change events
   *
   * @param value value
   */
  const onElementChange = ({ target: { value } } : ChangeEvent<HTMLTextAreaElement>) => {
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
   * Event handler for google font change events
   *
   * @param value value
   */
  const onFontChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    component.element.setAttribute("data-google-font", value);
    updateComponent(component);
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
        { renderPanelSubtitle(strings.layout.htmlProperties.textProperties.elementType) }
        <TextField
          value={ component.element.tagName }
          variant="standard"
          select
          fullWidth
          onChange={ onElementChange }
          sx={{ backgroundColor: "#F5F5F5" }}
          InputProps={{
              disableUnderline: true,
              sx: {  backgroundColor: "#F5F5F5" }
          }}
          SelectProps={{
            sx: {
              "& .MuiInputBase-input": {
                color: "#2196F3",
                height: "20px",
                padding: 0,
              },
              height: "20px",
              backgroundColor: "#F5F5F5"
            }
          }}
        >
          { Object.values(TextComponentHTMLElementTypes).map(type => (
            <MenuItem
              key={ type }
              value={ type }
              sx={{ color: "#2196F3" }}
            >
              { type }
            </MenuItem>
          )) }
        </TextField>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        { renderPanelSubtitle(strings.layout.htmlProperties.textProperties.googleFontLink) }
        <TextField
          variant="standard"
          value={ component.element.attributes.getNamedItem("data-google-font")?.nodeValue || "" }
          onChange={ onFontChange }
          inputProps={{
            sx:{ backgroundColor: "#fbfbfb" }
            }}
          placeholder={ strings.layout.htmlProperties.textProperties.googleFontLink }
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        { renderPanelSubtitle(strings.layout.htmlProperties.textProperties.defaultResources) }
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