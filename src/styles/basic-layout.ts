import { createStyles } from "@material-ui/core";

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
    justifyContent: "center",
    alignItems: "center",
    background: "#fff",
    borderBottom: "1px solid #ddd",
    height: 50
  },
  title: {

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
    gridArea: "content"
  },
});