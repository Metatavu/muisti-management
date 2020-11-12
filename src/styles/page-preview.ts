import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({

  root: {
    position: "relative",
    borderRadius: 15,
    //left: "50%",
    //top: "50%",
    border: "10px solid transparent",
    boxSizing: "content-box",
    boxShadow: "0px 2px 100px rgba(0, 0, 0, 0.2)",
    overflow: "auto",
    transition: "border-color 0.2s ease-out"
  },

  highlighted: {
    borderColor: theme.palette.secondary.main
  },

  previewComponent: {},
  relativeLayout: {}
});