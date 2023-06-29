import { Divider, FormControlLabel, Checkbox, Stack } from "@mui/material";
import { TreeObject } from "../../../types";
import PropertyBox from "./property-box";
import { ChangeEvent } from "react";
import strings from "../../../localization/strings";
import { ExhibitionPageResourceType, PageLayout, PageResourceMode } from "../../../generated/client";
import PanelSubtitle from "./panel-subtitle";
import TextField from "../../generic/v2/text-field";

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
 * Video Component Properties component
 */
const VideoComponentProperties = ({
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
  const handleElementChange = ({ target: { value } } : ChangeEvent<HTMLInputElement>) => {
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

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const foundResource = pageLayout.defaultResources?.find(resource => resource.id === component.element.id);
    if (foundResource) {
      setPageLayout({
        ...pageLayout,
        defaultResources: pageLayout.defaultResources?.map(resource => 
          resource.id === foundResource?.id ? { ...resource, data: value } : resource)
      });
    } else {
      setPageLayout({
        ...pageLayout,
        defaultResources: [
          ...pageLayout.defaultResources ?? [], {
            id: component.element.id,
            data: value,
            type: ExhibitionPageResourceType.Text,
            mode: PageResourceMode.Static
          }]
      });
    }
  };
  
  /**
   * Event handler for attribute change event
   * 
   * @param event event
   */
  const handleAttributeChange = ({ target: { checked, name } }: ChangeEvent<HTMLInputElement>) => {
    const element = component.element as HTMLVideoElement;
    switch (name) {
      case "controls": element.controls = checked;
        break;
      case "loop": element.loop = checked;
        break;
      case "autoplay": element.autoplay = checked;
    }
    
    updateComponent({
      ...component,
      element: element
    });
  };
  
  /**
   * Checks whether component has given attribute or not
   * 
   * @param attribute attribute
   * @returns whether component has given attribute or not
   */
  const checkIsAttributePresent = (attribute: string) => {
    return component.element.hasAttribute(attribute);
  };
  
  /**
   * Renders checkbox with given label and name
   * 
   * @param label label
   * @param name name
   */
  const renderCheckbox = (label: string, name: string) => (
    <PropertyBox>
      <FormControlLabel
        label={ label }
        control={
          <Checkbox
            color="secondary"
            name={ name }
            value={ checkIsAttributePresent(name) }
            onChange={ handleAttributeChange }
          /> 
        }
      />
    </PropertyBox>
  );

	return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        <PanelSubtitle subtitle={ strings.layoutEditorV2.videoProperties.defaultResource }/>
        <TextField
          value={ getElementsDefaultResource() || "" }
          onChange={ handleDefaultResourceChange }
          placeholder={ strings.layoutEditorV2.videoProperties.defaultResource }
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }}/>
      { renderCheckbox("Ohjausnäppäimet", "controls") }
      <Divider sx={{ color: "#F5F5F5" }}/>
      { renderCheckbox("Jatkuva toisto", "loop") }
      <Divider sx={{ color: "#F5F5F5" }}/>
      { renderCheckbox("Automaattinen toisto", "autoplay") }
    </Stack>
	);
};

export default VideoComponentProperties;