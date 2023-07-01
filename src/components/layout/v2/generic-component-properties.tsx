import strings from "../../../localization/strings";
import { HtmlComponentType, TreeObject } from "../../../types";
import ConditionalTooltip from "../../generic/v2/conditional-tooltip";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import ColorPicker from "./color-picker";
import MarginPaddingEditorHtml from "./margin-padding-editor-html";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import ProportionsEditorHtml from "./proportions-editor-html";
import {
  FormatColorFillOutlined as FormatColorFillOutlinedIcon,
  PaletteOutlined as PaletteOutlinedIcon
} from "@mui/icons-material";
import { Button, Divider, MenuItem, Stack } from "@mui/material";
import React, { ChangeEvent, FC, useState } from "react";
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
const GenericComponentProperties: FC<Props> = ({ component, updateComponent }) => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLButtonElement>();

  if (!component) return null;

  /**
   * Event handler for property change events
   *
   * @param name name
   * @param value value
   */
  const onPropertyChange = (name: string, value: string) => {
    if (!value) {
      component.element.style.removeProperty(name);
    } else {
      component.element.style[name as any] = value;
    }
    updateComponent(component);
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
    const elementsBackgroundColor = component.element.style.backgroundColor;

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
          <ConditionalTooltip enabled title={strings.generic.notYetImplemented}>
            <SelectBox value={component.type} disabled>
              {Object.values(HtmlComponentType).map((type) => (
                <MenuItem key={type} value={type} sx={{ color: "#2196F3" }}>
                  {type}
                </MenuItem>
              ))}
            </SelectBox>
          </ConditionalTooltip>
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
            value={parseInt(component.element?.style?.width || "0").toString()}
            name="width"
            label={strings.layoutEditorV2.genericProperties.width}
            onChange={onPropertyChange}
          />
          <ProportionsEditorHtml
            component={component}
            value={parseInt(component.element?.style?.height || "0").toString()}
            name="height"
            label={strings.layoutEditorV2.genericProperties.height}
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.margin} />
          <MarginPaddingEditorHtml
            styles={component.element.style}
            type="margin"
            onChange={onPropertyChange}
          />
        </PropertyBox>
        <Divider sx={{ color: "#F5F5F5" }} />
        <PropertyBox>
          <PanelSubtitle subtitle={strings.layoutEditorV2.genericProperties.padding} />
          <MarginPaddingEditorHtml
            styles={component.element.style}
            type="padding"
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
