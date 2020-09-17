import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({

  root: {
    left: "50%",
    top: "50%",
    transform: "translate3d(-50%, -50%, 0) scale(0.7)",
    border: "10px solid transparent",
    boxSizing: "content-box",
    boxShadow: "0px 2px 100px rgba(0, 0, 0, 0.5)",
    overflow: "auto",
    transition: "border-color 0.2s ease-out"
  },

  highlighted: {
    borderColor: theme.palette.secondary.main
  },

  previewComponent: {},
  relativeLayout: {}
});