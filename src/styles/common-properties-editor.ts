import { createStyles } from "@material-ui/core";

export default createStyles({
  backgroundPickerContainer: {
    position: "relative",
    "& .sketch-picker": {
      position: "absolute",
      zIndex: 1000,
      top: 87,
      left: 50
    }
  }
});