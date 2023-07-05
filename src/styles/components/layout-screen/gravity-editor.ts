import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

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
    minWidth: 40,
    height: 40,
    padding: 0,
    border: "1px solid rgba(0,0,0,0.2)",
    "&.selected": {
      backgroundColor: theme.palette.secondary.main,
      color: "#fff"
    },
    "& .MuiButton-label svg": {
      width: 16,
      height: 16
    }
  }
});
