import { createStyles } from "@material-ui/core";

export default createStyles({

  root: {
    height: "100%",
    display: "grid",
    gridArea: "editor-view",
    backgroundColor: "#f2f2f2",
    gridAutoRows: "auto 1fr",
    overflow: "hidden",
    "& .device-icon": {
      backgroundColor: "rgba(194, 74, 73, 0.8)",
      borderRadius: "50%",
      boxShadow: "0 0 30px rgba(0,0,0,0.2)",
      border: "3px solid #222"
    },
    "& .antenna-icon": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: "50%",
      boxShadow: "0 0 30px rgba(0,0,0,0.2)",
      border: "3px solid #222"
    }
  }

});