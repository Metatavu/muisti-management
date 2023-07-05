import theme from "./theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  root: {
    position: "relative",
    borderRadius: 15,
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
