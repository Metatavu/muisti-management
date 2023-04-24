import { Divider, MenuItem, Stack, TextField } from "@mui/material";
import { TextComponentHTMLElementTypes, TreeObject } from "../../../../types";
import PropertyBox from "./generic/property-box";
import renderPanelSubtitle from "./generic/render-panel-subtitle";
import { ChangeEvent, FC } from "react";

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
  const onPropertyChange = ({ target: { value } } : ChangeEvent<HTMLTextAreaElement>) => {

    const updatedHTMLTag = document.createElement(value);

    // TODO: Inner html is not currently saved to the tree?
    updatedHTMLTag.innerHTML = component.element.innerHTML;

    for (let attribute of component.element.attributes) {
      updatedHTMLTag.setAttribute(attribute.name, attribute.value);
    }

    updateComponent({
      ...component,
      element: updatedHTMLTag
    });
  };

	return (
		<Stack>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        { renderPanelSubtitle("text element type") }
          <TextField
            value={ component.element.tagName }
            variant="standard"
            select
            fullWidth
            onChange={ onPropertyChange }
            sx={{ backgroundColor: "#F5F5F5" }}
            InputProps={{
                disableUnderline: true,
                sx: {  backgroundColor: "#F5F5F5" }
            }}
            SelectProps={{
              sx: {
                "& .MuiInputBase-input": {
                  color: "#2196F3",
                  height: "20px",
                  padding: 0,
                },
                height: "20px",
                backgroundColor: "#F5F5F5"
              }
            }}
          >
            { Object.values(TextComponentHTMLElementTypes).map(type => (
              <MenuItem
                key={ type }
                value={ type }
                sx={{ color: "#2196F3" }}
              >
                { type }
              </MenuItem>
            )) }
          </TextField>
        </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }}/>
		</Stack>
	);
};

export default TextComponentProperties;