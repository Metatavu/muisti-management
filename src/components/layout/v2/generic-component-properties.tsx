import strings from "../../../localization/strings";
import { GroupedInputsType, HtmlComponentType, TreeObject } from "../../../types";
import HtmlComponentsUtils from "../../../utils/html-components-utils";
import LocalizationUtils from "../../../utils/localization-utils";
import ConditionalTooltip from "../../generic/v2/conditional-tooltip";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import ColorPicker from "./color-picker";
import GroupedInputsWithLock from "./grouped-inputs-with-lock";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import ProportionsEditorHtml from "./proportions-editor-html";
import {
  FormatColorFillOutlined as FormatColorFillOutlinedIcon,
  PaletteOutlined as PaletteOutlinedIcon
} from "@mui/icons-material";
import { Button, Divider, MenuItem, Stack } from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import { ColorResult } from "react-color";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
}

/**
 * Generic Component Properties
 */
const GenericComponentProperties = ({ component, updateComponent }: Props) => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLButtonElement>();

  if (!component) return null;

  /**
   * Event handler for property change events
   *
   * @param name name
   * @param value value
   */
  const onPropertyChange = (name: string, value: string) => {
    let { element } = component;
    const dimensionAttributes = ["width", "height"];
    const { tagName } = component.element;
    if (tagName.toLowerCase() === HtmlComponentType.VIDEO && dimensionAttributes.includes(name)) {
      element = HtmlComponentsUtils.handleAttributeChange(element, name, value);
    } else {
      element = HtmlComponentsUtils.handleStyleAttributeChange(element, name, value);
    }
    updateComponent({ ...component, element: element });
  };

  const getElementWidth = () => {
    const { element } = component;
    const { tagName } = element;
    const styles = HtmlComponentsUtils.parseStyles(element);
    if (tagName.toLowerCase() === HtmlComponentType.VIDEO) {
      return parseInt(component.element.attributes.getNamedItem("width")?.value || "0").toString();
    }
    return parseInt(styles["width"] || "0").toString();
  };

  const getElementHeight = () => {
    const { element } = component;
    const { tagName } = element;
    const styles = HtmlComponentsUtils.parseStyles(element);
    if (tagName.toLowerCase() === HtmlComponentType.VIDEO) {
      return parseInt(component.element.attributes.getNamedItem("height")?.value || "0").toString();
    }
    return parseInt(styles["height"] || "0").toString();
  };

  const getElementWidth = () => {
    if (component.element.tagName === "VIDEO") {
      return parseInt(component.element.attributes.getNamedItem("width")?.value || "0").toString();
    }
    return parseInt(component.element?.style?.width || "0").toString();
  };

  const getElementHeight = () => {
    if (component.element.tagName === "VIDEO") {
      return parseInt(component.element.attributes.getNamedItem("height")?.value || "0").toString();
    }
    return parseInt(component.element?.style?.height || "0").toString();
  };

  /**
   * Event handler for name change events
   *
   * @param event event
   */
  const onNameChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    component.element.setAttribute("name", value);
    updateComponent(component);
  };

  /**
   * Gets elements background icon colors
   */
  const getElementBackgroundIconColors = () => {
    const { element } = component;
    const styles = HtmlComponentsUtils.parseStyles(element);
    const elementsBackgroundColor = styles["background-color"];

    return {
      border: elementsBackgroundColor ? undefined : "1px solid #2196F3",
      backgroundColor: elementsBackgroundColor || "#F5F5F5"
    };
  };
  return (
    <>
      <Stack spacing={2} paddingLeft={0} paddingRight={0}>
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.element} />
          <SelectBox value={component.type} disabled>
            {Object.values(HtmlComponentType).map((type) => (
              <MenuItem key={type} value={type} sx={{ color: "#2196F3" }}>
                {LocalizationUtils.getLocalizedComponentType(type)}
              </MenuItem>
            ))}
          </SelectBox>
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.elementName} />
          <TextField
            value={component.element.attributes.getNamedItem("name")?.nodeValue || ""}
            onChange={onNameChange}
            placeholder={strings.layoutEditorV2.genericProperties.elementName}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.proportions} />
          <ProportionsEditorHtml
            component={component}
            value={getElementWidth()}
            name="width"
            label={strings.layoutEditorV2.genericProperties.width}
            onChange={onPropertyChange}
          />
          <ProportionsEditorHtml
            component={component}
            value={getElementHeight()}
            name="height"
            label={strings.layoutEditorV2.genericProperties.height}
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.margin} />
          <GroupedInputsWithLock
            styles={component.element.style}
            type={GroupedInputsType.MARGIN}
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.padding} />
          <GroupedInputsWithLock
            styles={component.element.style}
            type={GroupedInputsType.PADDING}
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PaletteOutlinedIcon sx={{ opacity: 0.54 }} />
            <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.color.label} />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                ...getElementBackgroundIconColors()
              }}
            />
            <Button
              sx={{ color: "#2196F3" }}
              onClick={({ currentTarget }: React.MouseEvent<HTMLButtonElement>) =>
                setPopoverAnchorElement(currentTarget)
              }
            >
              {strings.layoutEditorV2.genericProperties.color.button}
            </Button>
            <FormatColorFillOutlinedIcon sx={{ color: "#2196F3" }} />
          </Stack>
        </PropertyBox>
      </Stack>
      <ColorPicker
        color={component.element.style.backgroundColor}
        anchorEl={popoverAnchorElement}
        onClose={() => setPopoverAnchorElement(undefined)}
        onChangeComplete={({ hex }: ColorResult) => onPropertyChange("background-color", hex)}
      />
    </>
  );
};

export default GenericComponentProperties;
