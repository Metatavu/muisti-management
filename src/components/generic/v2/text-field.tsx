import { TextField as MuiTextField } from "@mui/material";

/**
 * Components properties
 */
interface Props {
  value: unknown;
  placeholder?: string;
  number?: boolean;
  name?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Text Field component
 */
const TextField = ({
  value,
  placeholder,
  number,
  name,
  onChange
}: Props) => {
  return (
    <MuiTextField
      variant="standard"
      name={ name }
      fullWidth
      placeholder={ placeholder }
      value={ value }
      inputProps={{
        pattern: number ? "[0-9]*" : undefined,
        sx: { backgroundColor: "#fbfbfb" }
      }}
      onChange={ onChange }
    />);
};

export default TextField;