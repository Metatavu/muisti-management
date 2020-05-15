import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  color: {
    border: "1px solid rgba(0,0,0,0.2)",
    cursor: "pointer",
    borderRadius: 4,
    width: 50,
    height: 50,
    transition: "box-shadow 0.2s ease-out",
    "&:hover": {
      boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    }
  }
});