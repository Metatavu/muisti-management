import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import TextField from "../../generic/v2/text-field";
import FontColorEditor from "./font-color-editor";
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
 * Button Component Properties component
 */
const ButtonComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {

  /**
   * Returns button resource path
   * 
   * @returns button resource path
   */
  const getButtonResourcePath = () => {
    const { element } = component;
    return element.innerHTML;
  }

  /**
   * Returns button text
   * 
   * @returns button text
   */
  const getButtonText = () => {
    return HtmlResourceUtils.getResourceData(pageLayout.defaultResources, getButtonResourcePath());
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const ressourcePath = getButtonResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(ressourcePath);
    if (!resourceId) return;
   
    const defaultResources = [ ... (pageLayout.defaultResources || []).filter(resource => resource.id !== resourceId), {
      id: resourceId,
      data: value,
      type: ExhibitionPageResourceType.Text,
      mode: PageResourceMode.Static
    }];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <FontColorEditor component={component} updateComponent={updateComponent} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.buttonProperties.defaultResource} />
        <TextField
          value={ getButtonText() }
          onChange={ handleDefaultResourceChange }
          placeholder={strings.layoutEditorV2.buttonProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
    </Stack>
  );
};

export default ButtonComponentProperties;
