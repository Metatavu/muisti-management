import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  list: {
    marginLeft: theme.spacing(4)
  },

  listItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff"
  },

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

  editorLayout: {
    overflow: "hidden",
    height: "100%",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto 1fr auto",
    gridTemplateAreas: ' "navigation editor-view properties" '
  },

  enumEditorToolbar: {
    justifyContent: "space-between",
    marginTop: theme.spacing(1)
  }
});
