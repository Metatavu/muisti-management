import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  gravitySelector: {
    marginTop: theme.spacing(2),
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
    minWidth: 50,
    height: 50,
    padding: 0,
    border: "1px solid rgba(0,0,0,0.2)",
    "&.selected": {
      backgroundColor: theme.palette.secondary.main,
      color: "#fff"
    }
  }
});