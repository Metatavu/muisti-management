import { createStyles } from "@material-ui/core";

export default createStyles({

  root: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto 1fr",
    gridTemplateAreas: ' "header" "content" ',
    height: "100vh"
  },
  content: {
    gridArea: "content",
    overflow: "hidden"
  },
});