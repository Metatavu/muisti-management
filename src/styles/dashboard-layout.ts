import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  
  root: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridTemplateRows: "auto 1fr",
    gridTemplateAreas: ' "navigation header" "navigation content" ',
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

  navigation: {
    position: "relative",
    gridArea: "navigation",
    borderRight: "1px solid #ddd",
    backgroundColor: "#fbfbfb",
    height: "100%",
    width: 320,
    padding: 30
  },

  btnContainer: {
    position: "absolute",
    zIndex: 1,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    width: 50
  },

  userElement: {
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottom: "1px solid #ddd",
    height: 50,
    transition: "background-color 0.2s ease-in-out",
    "& h3": {
      whiteSpace: "nowrap",
      width: "calc(100% - 50px)",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.1)"
    }
  },

  userAvatar: {
    padding: 8,
    borderRadius: "50%",
    backgroundColor: theme.palette.secondary.main,
    color: "#fff"
  },

  navigationContent: {

  },

  backBtn: {
    position: "absolute",
    left: 12
  },

  logoutBtn: {
    position: "absolute",
    right: 12
  },

  content: {
    gridArea: "content"
  },

});