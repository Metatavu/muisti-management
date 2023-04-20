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
    console.log("property change here", value);

    // TODO: Not yet implemented
    // const updatedHTMLTag = document.createElement(value);
    // updatedHTMLTag.innerHTML = component.element.innerHTML;

    // console.log("component before", component.element.parentNode)
    // component.element.parentNode?.replaceChild(updatedHTMLTag, component.element);
    // // Undefined?
    // console.log("component after", component.element.parentNode)

    // updateComponent(component);
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