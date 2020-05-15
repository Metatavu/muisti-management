import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  backgroundPickerContainer: {
    position: "relative",
    "& .sketch-picker": {
      position: "absolute",
      zIndex: 1000
    }
  }
});