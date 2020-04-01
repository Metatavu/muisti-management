import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  
  root: {
    backgroundColor: "#f3f3f3",
    borderRadius: 4,
    padding: 4
  },

  button: {
    width: "100%",
    borderRadius: 4,
    height: 30,
    "&.selected": {
      color: theme.palette.secondary.main,
      backgroundColor: "#fff",
      boxShadow: "1px 1px 2px rgba(0,0,0,0.2)"
    }
  }

});