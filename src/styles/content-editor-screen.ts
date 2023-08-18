import theme from "./theme";
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

  navigationTabs: {
    marginTop: 5,
    marginBottom: 10
  },

  contentTabs: {
    marginLeft: theme.spacing(30)
  },

  tabIndicator: {
    height: 6
  },

  editorLayout: {
    height: "100%",
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto 1fr auto auto",
    gridTemplateAreas: `
    "editor-view editor-view contents properties"
    "timeline timeline contents properties"
    `
  },

  previewDeviceContainer: {
    height: "fit-content",
    width: "fit-content",
    marginRight: 100
  },

  timelineContent: {
    minHeight: 300,
    maxHeight: 300,
    overflowY: "auto",
    borderTop: "3px solid #000",
    backgroundColor: "#fbfbfb"
  },

  timelineContentVersion: {
    backgroundColor: "#fff",
    borderBottom: "3px solid #000"
  },

  timelineContentVersionTitle: {
    padding: "0 16px",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    minWidth: 253,
    maxWidth: 253,
    borderRight: "4px solid #000"
  },

  timelineContentVersionContent: {
    padding: 0,
    display: "flex",
    flexDirection: "row"
  },

  idlePageEditor: {
    display: "flex",
    flexDirection: "row"
  },

  timelineDivider: {
    width: 3,
    backgroundColor: "#000"
  },

  selected: {
    color: theme.palette.secondary.main
  },

  resource: {
    backgroundColor: "#fff"
  },

  resourceItem: {
    backgroundColor: "#fff",
    marginLeft: theme.spacing(1)
  },

  visualEditorContainer: {
    minHeight: "100%",
    maxHeight: "100%",
    minWidth: "100%",
    maxWidth: "100%",
    display: "flex",
    justifyItems: "center",
    alignItems: "center",
    position: "relative"
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
    alignItems: "center"
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

  borderedListItem: {
    borderRadius: 3,
    border: "1px solid rgba(0,0,0,0.2)",
    marginBottom: theme.spacing(0.5),
    backgroundColor: "#fff",
    paddingRight: 110,
    "& .MuiListItemSecondaryAction-root": {
      right: theme.spacing(5)
    },
    "& .MuiSvgIcon-root": {
      position: "absolute",
      right: 14
    }
  },

  borderedListItemSecondaryAction: {
    display: "flex",
    alignItems: "center"
  }
});
