import { HeightOutlined } from "@mui/icons-material";
import { Stack, Typography, TextField, Select, MenuItem } from "@mui/material";
import strings from "../../../../localization/strings";
import { useState } from "react";

/**
 * Components properties
 */
interface Props {
  value: string;
  name: string;
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
  const onValueChange = ({ target: { name, value } }: React.ChangeEvent<HTMLInputElement>) => {
    const type = settings[name as keyof typeof settings];
    const val = type === "px" ? value : `${value}${type}`;

    onChange(name, val);
  };

  return (
    <Stack direction="row" spacing={ 1 }>
      <Typography
        variant="caption"
        fontWeight={ 500 }
        fontSize="12px"
      >
        { label }
      </Typography>
      <TextField
        variant="standard"
        name="width"
        value={ value }
        onChange={ onValueChange }
        inputProps={{
          pattern: "[0-9]",
          sx:{ backgroundColor: "#fbfbfb" }
        }}
      />
      <Select
        value={ settings.width }
        variant="standard"
        sx={{ backgroundColor: "#F5F5F5" }}
        onChange={ ({ target: { value } }) => {
          setSettings({ ...settings, width: value as "px" | "%"});
        } }
      >
        <MenuItem value="px" sx={{ color: "#2196F3" }}>px</MenuItem>
        <MenuItem value="%" sx={{ color: "#2196F3" }}>%</MenuItem>
      </Select>
      <HeightOutlined
        sx={{
          transform: "rotate(90deg)",
          color: "#2196F3",
          border: "1px solid #2196F3",
          borderRadius: "5px"
        }}
      />
    </Stack>
  );
};

export default ProportionsEditorHtml;