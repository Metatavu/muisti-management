import { LinkRounded } from "@mui/icons-material";
import { IconButton, Stack, TextField } from "@mui/material";
import theme from "../../../../styles/theme";
import { ChangeEvent, useState } from "react";

/**
 * Component props
 */
interface Props {
  type: "margin" | "padding";
  onChange: (name: string, value: string) => void;
  styles: CSSStyleDeclaration;
}

/**
 * Margin/Padding Editor component
 */
const MarginPaddingEditorHtml = ({
  type,
  onChange,
  styles
}: Props) => {
  const [ lock, setLock ] = useState(false);

  const suffixes = [ "-top", "-right", "-bottom", "-left" ];

  /**
   * Event handler for input change events
   *
   * @param event event
   */
  const onValueChange = ({ target: { name, value } }: ChangeEvent<HTMLInputElement>) => onChange(name, value);

  /**
   * Event handler for linked input change events
   *
   * @param event event
   */
  const onLinkedValueChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => onChange(type, value);

  return (
    <Stack direction="row" spacing={ theme.spacing(2) }>
      { suffixes.map(suffix => (
        <TextField
          key={ type + suffix }
          value={ parseInt(styles[`${type}${suffix}` as any] || "0").toString() }
          name={ `${type}${suffix}` }
          inputProps={{
            pattern: "[0-9]"
          }}
          InputProps={{
            sx: {
              "& .MuiInputBase-input": {
                color: "#2196F3",
                height: "20px",
                padding: 0,
              }
            }
          }}
          sx={{ width: "34px" }}
          onChange={ lock ? onLinkedValueChange: onValueChange }
        />
      )) }
      <IconButton sx={{ margin: 0, padding: 0 }} onClick={ () => setLock(!lock) }>
        <LinkRounded
          sx={{
            color: lock ? "#ffffff" : "#2196F3",
            backgroundColor: lock ? "#2196F3" : undefined,
            border: "1px solid #2196F3",
            borderRadius: "5px",
            height: "20px"
          }}
        />
      </IconButton>
    </Stack>
    );
};

export default MarginPaddingEditorHtml;