import { createStyles } from "@material-ui/core";

export default createStyles({

  root: {
    position: "relative",
    border: "20px solid #ccc",
    borderRadius: 15,
    boxSizing: "content-box",
    boxShadow: "0px 0px 0px rgba(0, 0, 0, 0.2)",
    overflow: "auto"
  },

  highlighted: {
    boxShadow: "0px 0px 2px 5px rgba(0, 121, 233, 1)"
  },

  previewComponent: {},
  relativeLayout: {}
});