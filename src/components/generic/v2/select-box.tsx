import { TextField, TextFieldProps } from "@mui/material";
import { ReactNode } from "react";

/**
 * Components properties
 */
type Props = TextFieldProps & {
  children: ReactNode;
  value: unknown;
  name?: string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Select Box component
 */
const SelectBox = ({ children, value, name, disabled, onChange, ...rest }: Props) => {
  return (
    <TextField
      {...rest}
      name={name}
      value={value}
      variant="standard"
      disabled={disabled}
      select
      fullWidth
      InputProps={{ disableUnderline: true }}
      onChange={onChange}
      SelectProps={{
        sx: {
          "& .MuiInputBase-input": {
            color: "#2196F3",
            height: "20px",
            padding: 0,
            backgroundColor: "#fbfbfb"
          },
          height: "20px"
        }
      }}
    >
      {children}
    </TextField>
  );
};

export default SelectBox;
