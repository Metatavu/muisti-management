import createStyles from "@mui/styles/createStyles";

export default createStyles({
  loader: {
    height: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "#F5EFEA",
    overflow: "auto"
  },

  editorLayout: {
    overflow: "hidden",
    height: "100%",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto 1fr auto",
    gridTemplateAreas: ' "navigation editor-view properties" '
  }
});
