import { Divider, Stack } from "@mui/material";
import { TreeObject } from "../../../../types";
import PropertyBox from "./generic/property-box";
import renderPanelSubtitle from "./generic/render-panel-subtitle";
import { FC } from "react";

/**
 * Component props
 */
interface Props {
  component: TreeObject;
  updateComponent: (updatedComponent: TreeObject) => void;
}

/**
 * Renders text component properties
 */
const TextComponentProperties: FC<Props> = ({
  component,
  updateComponent
}) => {
  /**
   * Event handler for property change events
   *
   * @param name name
   * @param value value
   */
  const onPropertyChange = (name: string, value: string) => {
    component.element.style[name as any] = value;
    updateComponent(component);
  };

	return (
		<Stack>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        { renderPanelSubtitle("text element type") }

      </PropertyBox>
		</Stack>
	);
};

export default TextComponentProperties;