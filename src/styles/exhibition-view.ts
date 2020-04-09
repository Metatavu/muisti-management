import { createStyles } from "@material-ui/core";

export default createStyles({
  editorLayout: {
    height: "100%",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto 1fr auto",
    gridTemplateAreas: ' "view-selection navigation editor settings" ',
  }
});