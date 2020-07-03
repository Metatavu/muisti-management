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

  editorLayout: {
    height: "100%",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto 1fr auto",
    gridTemplateAreas: ' "navigation editor-view properties" ',
  },

  root: {
    height: "100%",
    display: "grid",
    gridAutoColumns: "auto 1fr",
    gridTemplateRows: "1fr",
    gridTemplateAreas: "'panel content' 'panel content'"
  },

  panel: {
    position: "relative",
    gridArea: "panel",
    borderRight: "1px solid #ddd",
    overflow: "hidden",
    transition: "width 0.4s ease-in-out"
  },

  select: {
    marginTop: 10,
    marginBottom: 10,
  },

  toolBar: {
    backgroundColor: "#fbfbfb",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    height: 55,
    padding: "0 16px",
    alignItems: "center",
  },

  btnContainer: {
    position: "absolute",
    zIndex: 1,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    width: 50
  },

  container: {
    backgroundColor: "#fbfbfb",
    height: "100%",
    width: 320,
    transition: "opacity 0.2s 0.2s ease-in-out",
    "&.closed": {
      opacity: 0
    }
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 12px",
    borderBottom: "1px solid #ddd",
    height: 55,
    "& h3": {
      whiteSpace: "nowrap",
      width: "calc(100% - 50px)",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  },

  content: {
    gridArea: "content",
    display: "flex",
    height: "100%",
    width: "100%",
    flexDirection: "column"
  },

  editors: {
    display: "grid",
    width: "100%",
    height: "100%",
    gridGap: 10,
    gridTemplateColumns: "1fr 1fr"
  },

  editorContainer: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    height: "100%"
  },

  editor: {
    paddingBottom: theme.spacing(2),
    "& .CodeMirror": {
      minHeight: "100%"
    }
  }
});