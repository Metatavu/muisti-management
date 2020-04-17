import { createStyles } from "@material-ui/core";
import theme from "./theme";

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
    alignItems: "center",
  },

  navigationTabs: {
    marginTop: 5,
    marginBottom: 10
  },

  searchBar: {
  },

  treeView: {
    "& > div:focus": {
      outline: "none"
    }
  },

  navigationTree: {
    marginTop: theme.spacing(2),
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
    height: "100%",
    display: "flex",
    justifyItems: "center",
    alignItems: "center",
    position: "relative",
    overflowY: "auto"
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
    height: 55,
    padding: "0 16px",
    alignItems: "center",
  },

  toolbarContent: {
    paddingTop: theme.spacing(2)
  },

  listItem: {
    cursor: 'pointer',
    position: 'relative',
    transition: "background-color 0.2s ease-out, color 0.2s ease-out",
    "&:hover": {
      backgroundColor: "#f2f2f2"
    },

    "&.focused": {
      backgroundColor: theme.palette.secondary.main,
      color: "#fff",
      zIndex: 999,
    }
  }
})