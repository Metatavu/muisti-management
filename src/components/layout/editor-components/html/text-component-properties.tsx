import { Divider, MenuItem, Stack, TextField } from "@mui/material";
import { TextComponentHTMLElementTypes, TreeObject } from "../../../../types";
import PropertyBox from "./generic/property-box";
import renderPanelSubtitle from "./generic/render-panel-subtitle";
import { ChangeEvent, FC } from "react";
import strings from "../../../../localization/strings";

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
   * Event handler for element change events
   *
   * @param value value
   */
  const onElementChange = ({ target: { value } } : ChangeEvent<HTMLTextAreaElement>) => {
    const updatedHTMLTag = document.createElement(value);

    for (const attribute of component.element.attributes) {
      updatedHTMLTag.setAttribute(attribute.name, attribute.value);
    }

    updateComponent({
      ...component,
      element: updatedHTMLTag
    });
  };

  /**
   * Event handler for google font change events
   *
   * @param value value
   */
  const onFontChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    component.element.setAttribute("data-google-font", value);
    updateComponent(component);
  };

	return (
		<Stack>
      <Divider sx={{ color: "#F5F5F5" }}/>
      <PropertyBox>
        { renderPanelSubtitle(strings.layout.htmlProperties.textProperties.elementType) }
        <TextField
          value={ component.element.tagName }
          variant="standard"
          select
          fullWidth
          onChange={ onElementChange }
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
      <PropertyBox>
        { renderPanelSubtitle(strings.layout.htmlProperties.textProperties.googleFontLink) }
        <TextField
          variant="standard"
          value={ component.element.attributes.getNamedItem("data-google-font")?.nodeValue || "" }
          onChange={ onFontChange }
          inputProps={{
            sx:{ backgroundColor: "#fbfbfb" }
            }}
          placeholder={ strings.layout.htmlProperties.textProperties.googleFontLink }
        />
      </PropertyBox>
      <Divider sx={{ color: "#F5F5F5" }}/>
		</Stack>
	);
};

export default TextComponentProperties;