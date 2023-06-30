import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

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
  },

  contentContainer: {
    display: "flex"
  }
});
