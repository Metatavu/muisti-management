import { Divider, Stack } from "@mui/material";
import strings from "../../../../localization/strings";
import { TreeObject } from "../../../../types";
import PropertyBox from "./generic/property-box";
import renderPanelSubtitle from "./generic/render-panel-subtitle";
import AlignmentEditorHtml from "./alignment-editor-html";
import { FC } from "react";

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
const LayoutComponentProperties: FC<Props> = ({
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
        { renderPanelSubtitle(strings.layout.htmlProperties.layoutProperties.contentEmphasis) }
        <AlignmentEditorHtml
          onChange={ onPropertyChange }
        />
      </PropertyBox>
		</Stack>
	);
};

export default LayoutComponentProperties;