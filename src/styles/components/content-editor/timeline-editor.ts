import { createStyles } from "@material-ui/core";
import theme from "../../theme";

export default createStyles({

  timeLineRowList: {
    padding: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    overflowX: "scroll",
  },

  timelineRow: {
    padding: 5,
    height: 70,
    width: "100%"
  },

  pageList: {
    display: "flex",
    padding: 10,
    height: "100%",
    width: "100%",
    transition: "background-color 0.25s linear"
  },

  isDraggedOver: {
    backgroundColor: theme.palette.grey[200]
  },

  pageItemContent: {
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
    marginRight: 5,
    height: "100%",
    width: 350,
    borderRadius: 2,
    borderColor: theme.palette.primary.main,
    transition: "background-color 0.25s linear"
  },

  isDragged: {
    backgroundColor: "#B3E5FC"
  },

  selected: {
    borderColor: theme.palette.secondary.main,
    boxShadow: `0 0 0 2px ${theme.palette.secondary.main}`,
    zIndex: 1
  }

});