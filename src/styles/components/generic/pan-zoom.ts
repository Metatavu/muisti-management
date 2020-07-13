import { createStyles } from "@material-ui/core";
import theme from "../../theme";

export default createStyles({
  root: {
    position: "relative"
  },
  controlContainer: {
    position: "absolute",
    zIndex: 1000,
    top: theme.spacing(1),
    left: theme.spacing(2),
    display: "grid",
    gridAutoFlow: "column",
    gridGap: theme.spacing(1),
    alignItems: "center"
  }
});