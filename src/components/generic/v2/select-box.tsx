import { TextField } from "@mui/material";
import { ReactNode } from "react";

/**
 * Components properties
 */
interface Props {
  children: ReactNode;
  value: unknown;
  name?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Select Box component
 */
const SelectBox = ({
  children,
  value,
  name,
  onChange
}: Props) => {
  return (
    <TextField
      name={ name }
      value={ value }
      variant="standard"
      select
      fullWidth
      InputProps={{ disableUnderline: true }}
      onChange={ onChange }
      SelectProps={{
        sx: {
          "& .MuiInputBase-input": {
            color: "#2196F3",
            height: "20px",
            padding: 0,
            backgroundColor: "#fbfbfb"
          },
          height: "20px",
        }
      }}
    >
    { children }
    </TextField>
    
  );
};

export default SelectBox;