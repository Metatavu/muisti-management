import strings from "../../../localization/strings";
import { TreeObject } from "../../../types";
import ColorPicker from "./color-picker";
import PanelSubtitle from "./panel-subtitle";
import PropertyBox from "./property-box";
import { Button, Divider, Stack } from "@mui/material";
import { useState } from "react";
import { ColorResult } from "react-color";

/**
 * Components properties
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
}

/**
 * Font Color Editor component for HTML Layouts
 */
const FontColorEditor = ({ component, updateComponent }: Props) => {
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLButtonElement>();

  /**
   * Event handler for font color change events
   *
   * @param event event
   */
  const handleFontColorChange = ({ hex }: ColorResult) => {
    const element = component.element;

    element.style.color = hex;

    updateComponent({
      ...component,
      element: element
    });
  };

  return (
    <>
      <PropertyBox>
        <PanelSubtitle subtitle={strings.layoutEditorV2.textProperties.fontColor} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            sx={{ color: "#2196F3" }}
            onClick={({ currentTarget }: React.MouseEvent<HTMLButtonElement>) =>
              setPopoverAnchorElement(currentTarget)
            }
          >
            {strings.layoutEditorV2.genericProperties.color.button}
          </Button>
        </Stack>
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }} />
      <ColorPicker
        color={component.element.style.color}
        anchorEl={popoverAnchorElement}
        onClose={() => setPopoverAnchorElement(undefined)}
        onChangeComplete={handleFontColorChange}
      />
    </>
  );
};

export default FontColorEditor;
