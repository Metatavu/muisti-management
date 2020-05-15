import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  gravitySelector: {
    display: "flex",
    flexDirection: "column"
  },
  topRow: {
    display: "flex",
    flexDirection: "row"
  },
  middleRow: {
    display: "flex",
    flexDirection: "row"
  },
  bottomRow: {
    display: "flex",
    flexDirection: "row"
  },
  button: {
    width: 30,
    height: 30,
    "&.selected": {
      backgroundColor: theme.palette.secondary.main
    }
  }
});