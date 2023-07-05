import { ChangeEvent, useState } from "react";
import { ExpandOutlined, HeightOutlined } from "@mui/icons-material";
import { Stack, Typography, MenuItem } from "@mui/material";
import TextField from "../../generic/v2/text-field";
import SelectBox from "../../generic/v2/select-box";

/**
 * Components properties
 */
interface Props {
  value: string;
  name: "width" | "height";
  label: string;
  onChange: (name: string, value: string) => void;
}

/**
 * HTML Component proportions editor
 */
const ProportionsEditorHtml = ({
  value,
  name,
  label,
  onChange
}: Props) => {
  const [ settings, setSettings ] = useState<{
    width: "px" | "%";
    height: "px" | "%";
  }>({
    width: "px",
    height: "px",
  });

  /**
   * Event handler for input change events
   *
   * @param event event
   */
  const onValueChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => {
    const type = settings[name as keyof typeof settings];
    const val = type === "px" ? value : `${value}${type}`;

    onChange(name, val);
  };

  /**
   * Renders icon
   */
  const renderIcon = () => {
    const iconStyles = {
      color: "#2196F3",
      border: "1px solid #2196F3",
      borderRadius: "5px"
    };
    switch (name) {
      case "width":
        return (
          <HeightOutlined
            sx={{
              transform: "rotate(90deg)",
              ...iconStyles
            }}
          />
        );
      case "height":
        return (
          <ExpandOutlined
            sx={{...iconStyles}}
          />
        );
    }
  };

  return (
    <Stack direction="row" spacing={ 1 } alignItems="center">
      <Typography
        variant="caption"
        fontWeight={ 500 }
        fontSize="12px"
      >
        { label }
      </Typography>
      <TextField
        name={ name }
        value={ value }
        number
        onChange={ onValueChange }
      />
      <SelectBox
        value={ settings[name] }
        onChange={ ({ target: { value } }) => {
          setSettings({ ...settings, [name]: value as "px" | "%"});
        }}
      >
        <MenuItem value="px" sx={{ color: "#2196F3" }}>px</MenuItem>
        <MenuItem value="%" sx={{ color: "#2196F3" }}>%</MenuItem>
      </SelectBox>
      { renderIcon() }
    </Stack>
  );
};

export default ProportionsEditorHtml;