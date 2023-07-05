import createStyles from "@mui/styles/createStyles";

export default createStyles({
  codeEditorContainer: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    overflowX: "auto",
    height: "100%"
  },

  editor: {
    "& .CodeMirror": {
      minHeight: "100%"
    }
  }
});
