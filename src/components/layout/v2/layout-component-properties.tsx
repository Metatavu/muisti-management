import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import SelectBox from "../../generic/v2/select-box";
import TextField from "../../generic/v2/text-field";
import AlignmentEditorHtml from "./alignment-editor-html";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Divider, MenuItem, Stack } from "@mui/material";
import { ChangeEvent, FC } from "react";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
}

/**
 * Renders layout component properties
 */
const LayoutComponentProperties: FC<Props> = ({ component, updateComponent }) => {
  /**
   * Event handler for layout alignment change events
   *
   * @param name name
   * @param value value
   */
  const onAlignmentChange = (name: string, value: string) => {
    component.element.style[name as any] = value;
    updateComponent(component);
  };

  /**
   * Event handler for property change events
   *
   * @param event event
   */
  const onPropertyChange = ({ target: { value, name } }: ChangeEvent<HTMLInputElement>) => {
    if (!value) {
      component.element.style.removeProperty(name);
    } else {
      if (name === "gap") {
        component.element.style.gap = `${value}px ${value}px`;
      } else {
        component.element.style[name as any] = value;
      }
    }

    updateComponent(component);
  };

  return (
    <Stack>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.layoutProperties.contentEmphasis} />
        <AlignmentEditorHtml onChange={onAlignmentChange} element={component.element} />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PanelSubtitle
            sx={{ flex: 1 }}
            subtitle={strings.layoutEditorV2.layoutProperties.contentDirection.label}
          />
          <SelectBox
            name="flexDirection"
            sx={{ flex: 1 }}
            value={component.element.style.flexDirection ?? "row"}
            onChange={onPropertyChange}
          >
            <MenuItem value={"row"}>
              {strings.layoutEditorV2.layoutProperties.contentDirection.row}
            </MenuItem>
            <MenuItem value={"column"}>
              {strings.layoutEditorV2.layoutProperties.contentDirection.column}
            </MenuItem>
          </SelectBox>
        </Stack>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <PropertyBox>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <PanelSubtitle
            sx={{ flex: 1 }}
            subtitle={strings.layoutEditorV2.layoutProperties.contentGap}
          />
          <TextField
            name="gap"
            number
            sx={{ flex: 0.5 }}
            value={parseInt(component.element?.style.gap || "0").toString()}
            onChange={onPropertyChange}
          />
        </Stack>
      </PropertyBox>
    </Stack>
  );
};

export default LayoutComponentProperties;
