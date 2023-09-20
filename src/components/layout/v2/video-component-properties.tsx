import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import TextField from "../../generic/v2/text-field";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Checkbox, Divider, FormControlLabel, Stack } from "@mui/material";
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
 * Video Component Properties component
 */
const VideoComponentProperties = ({
  component,
  updateComponent,
  pageLayout,
  setPageLayout
}: Props) => {
  /**
   * Returns video resource path
   *
   * @returns video resource path
   */
  const getVideoResourcePath = () => {
    const { element } = component;
    return element.getElementsByTagName("source")[0].getAttribute("src") || "";
  };

  /**
   * Returns video src
   *
   * @returns video src
   */
  const getVideo = () => {
    return HtmlResourceUtils.getResourceData(pageLayout.defaultResources, getVideoResourcePath());
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const resourcePath = getVideoResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(resourcePath);
    if (!resourceId) return;

    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: value,
        type: ExhibitionPageResourceType.Video,
        mode: PageResourceMode.Static
      }
    ];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  /**
   * Event handler for attribute change event
   *
   * @param event event
   */
  const handleAttributeChange = ({ target: { checked, name } }: ChangeEvent<HTMLInputElement>) => {
    const element = component.element as HTMLVideoElement;
    switch (name) {
      case "controls":
        element.controls = checked;
        break;
      case "loop":
        element.loop = checked;
        break;
      case "autoplay":
        element.autoplay = checked;
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
        label={label}
        control={
          <Checkbox
            color="secondary"
            name={name}
            value={checkIsAttributePresent(name)}
            onChange={handleAttributeChange}
          />
        }
      />
    </PropertyBox>
  );

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.videoProperties.defaultResource} />
        <TextField
          value={getVideo()}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.videoProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      {renderCheckbox("Ohjausnäppäimet", "controls")}
      <Divider sx={{ color: "#F5F5F5" }} />
      {renderCheckbox("Jatkuva toisto", "loop")}
      <Divider sx={{ color: "#F5F5F5" }} />
      {renderCheckbox("Automaattinen toisto", "autoplay")}
    </Stack>
  );
};

export default VideoComponentProperties;
