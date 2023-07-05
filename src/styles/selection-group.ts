import theme from "./theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  root: {
    backgroundColor: "#f3f3f3",
    borderRadius: 4
  },

  button: {
    width: "100%",
    borderRadius: 4,
    height: 30,
    color: "#888",
    "&.no-text": {
      "& .MuiButton-startIcon": {
        margin: 0
      }
    },
    "&.selected": {
      color: theme.palette.secondary.main,
      backgroundColor: "#fff",
      boxShadow: "1px 1px 2px rgba(0,0,0,0.2)"
    }
  }
});
