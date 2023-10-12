import {
  ExhibitionPageResourceType,
  PageLayout,
  PageResourceMode
} from "../../../generated/client";
import strings from "../../../localization/strings";
import { HtmlTextComponentType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import HtmlResourceUtils from "../../../utils/html-resource-utils";
import LocalizationUtils from "../../../utils/localization-utils";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import FontColorEditor from "./font-color-editor";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Divider, MenuItem, Slider, Stack, Typography } from "@mui/material";
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
   * Returns text resource path
   *
   * @returns text resource path
   */
  const getTextResourcePath = () => {
    const { element } = component;
    return element.innerHTML;
  };

  /**
   * Returns text
   *
   * @returns text
   */
  const getText = () => {
    return HtmlResourceUtils.getResourceData(pageLayout.defaultResources, getTextResourcePath());
  };

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

    for (const style of component.element.style) {
      updatedHTMLTag.style.setProperty(style, component.element.style.getPropertyValue(style));
    }
    updatedHTMLTag.innerHTML = component.element.innerHTML;

    updateComponent({
      ...component,
      element: updatedHTMLTag
    });
  };

  /**
   * Event handler for default resource change event
   *
   * @param event event
   */
  const handleDefaultResourceChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    const ressourcePath = getTextResourcePath();
    const resourceId = HtmlResourceUtils.getResourceId(ressourcePath);
    if (!resourceId) return;

    const defaultResources = [
      ...(pageLayout.defaultResources || []).filter((resource) => resource.id !== resourceId),
      {
        id: resourceId,
        data: value,
        type: ExhibitionPageResourceType.Text,
        mode: PageResourceMode.Static
      }
    ];

    setPageLayout({
      ...pageLayout,
      defaultResources: defaultResources
    });
  };

  /**
   * Event handler for font size change events
   *
   * @param name name
   * @param value value
   */
  const onFontSizeChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    if (!value) {
      component.element.style.fontSize = "0px";
    } else {
      component.element.style[name as any] = `${value}px`;
    }
    updateComponent(component);
  };

  /**
   * Event handler for line height change events
   *
   * @param name name
   * @param value value
   */
  const onLineHeightChange = (_: any, newValue: number | number[]) => {
    if (!newValue) {
      component.element.style.removeProperty("line-height");
    } else {
      component.element.style.setProperty("line-height", newValue.toString());
    }
    updateComponent(component);
  };

  /**
   * Gets line height
   */
  const getLineHeight = () => {
    const lineHeight = component.element?.style.lineHeight;

    if (!lineHeight) {
      return HtmlComponentsUtils.DEFAULT_LINE_HEIGHT;
    }

    return parseFloat(lineHeight);
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
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.fontSize} />
        <TextField
          value={HtmlComponentsUtils.getFontSize(component)}
          name="font-size"
          number
          onChange={onFontSizeChange}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.lineHeight} />
        <Stack direction="row" spacing={2}>
          <Slider
            value={getLineHeight()}
            onChange={onLineHeightChange}
            valueLabelDisplay="auto"
            step={0.1}
            color="secondary"
            min={0}
            max={5}
          />
          <Typography variant="caption">{getLineHeight()}</Typography>
        </Stack>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <FontColorEditor component={component} updateComponent={updateComponent} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.defaultResource} />
        <TextField
          value={getText()}
          onChange={handleDefaultResourceChange}
          placeholder={strings.layoutEditorV2.textProperties.defaultResource}
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
    </Stack>
  );
};

export default TextComponentProperties;
