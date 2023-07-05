import { Popover } from "@mui/material";
import { ColorResult, SketchPicker } from "react-color";

/**
 * Components properties
 */
interface Props {
  color: string;
  anchorEl?: HTMLButtonElement;
  onClose: () => void;
  onChangeComplete: (color: ColorResult) => void;
}

/**
 * Color Picker component
 */
const ColorPicker = ({ color, anchorEl, onClose, onChangeComplete }: Props) => {
  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "center",
        horizontal: "left"
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "right"
      }}
    >
      <SketchPicker color={color} onChangeComplete={onChangeComplete} />
    </Popover>
  );
};

export default ColorPicker;
