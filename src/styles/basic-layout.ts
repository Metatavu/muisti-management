import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({

  root: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto 1fr",
    gridTemplateAreas: ' "header" "content" ',
    height: "100vh"
  },
  header: {
    position: "relative",
    gridArea: "header",
    display: "flex",
    paddingLeft: 60,
    alignItems: "center",
    background: "#fff",
    borderBottom: "1px solid #ddd",
    height: 50
  },
  headerLeft: {

  },
  headerRight: {

  },
  title: {
    color: theme.palette.text.primary
  },
  menuBtn: {
    position: "absolute",
    left: 12
  },
  backBtn: {
    position: "absolute",
    left: 52
  },
  logoutBtn: {
    position: "absolute",
    right: 12
  },
  content: {
    gridArea: "content",
    overflow: "hidden"
  },
});