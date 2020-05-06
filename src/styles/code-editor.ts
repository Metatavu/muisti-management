import { createStyles } from "@material-ui/core";

export default createStyles({

  codeEditorContainer: {
    display: "grid",
    gridTemplateRows: "auto 1fr",
    overflowX: "auto",
    height: "100%",
  },

  editor: {
    "& .CodeMirror": {
      minHeight: "100%"
    }
  },

});