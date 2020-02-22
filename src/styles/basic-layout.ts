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
    height: 40
  },
  title: {

  },
  logoutBtn: {
    position: "absolute",
    right: 20
  },
  content: {
    gridArea: "content",
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto 1fr auto",
    gridTemplateAreas: ' "view-selection navigation editor settings" ',
  },
});