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

  editorLayout: {
    height: "100%",
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto 1fr auto",
    gridTemplateAreas: ` "navigation contents editor-view properties" `,
  },

  visualEditorContainer: {
    height: "100%",
    display: "flex",
    justifyItems: "center",
    alignItems: "center",
    position: "relative",
    overflowY: "auto"
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

  actionButtons: {
    display: "grid",
    gridAutoFlow: "column",
    gridGap: theme.spacing(1)
  },

  color: {
    border: "1px solid rgba(0,0,0,0.2)",
    cursor: "pointer",
    borderRadius: 4,
    width: 40,
    height: 40,
    transition: "box-shadow 0.2s ease-out",
    "&:hover": {
      boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    }
  },

  title: {
    color: theme.palette.text.primary
  },
});