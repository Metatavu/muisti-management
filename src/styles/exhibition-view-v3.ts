import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({

  navigationTabs: {
    marginTop: 5,
    marginBottom: 10
  },

  searchBar: {
    marginBottom: 20
  },

  navigationTree: {
    marginBottom: 20
  },

  editorLayout: {
    height: "100%",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto 1fr auto",
    gridTemplateAreas: ' "navigation contents editor-view properties" ',
  },

  codeEditorContainer: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    height: "100%",
  },

  visualEditorContainer: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    height: "100%",
    justifyItems: "center"
  },

  editor: {
    "& .CodeMirror": {
      minHeight: "100%"
    }
  },

  textResourceEditor: {
    width: "calc(100% - 10px)",
    margin: "10px 5px 5px 5px"
  },

  toolBar: {
    backgroundColor: "#fbfbfb",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "flex-end",
    height: 58,
    padding: "0 16px",
    alignItems: "center",
  },

  toolbarContent: {
    padding: theme.spacing(2)
  }

})