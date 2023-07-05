import createStyles from "@mui/styles/createStyles";

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
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gridTemplateRows: "1fr",
    gridTemplateAreas: ' "inner-content properties hierarchy" ',
    overflow: "hidden",
    backgroundColor: "#fff"
  }
});
