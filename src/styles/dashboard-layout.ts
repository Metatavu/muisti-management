import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  
  root: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridTemplateRows: "auto 1fr",
    gridTemplateAreas: ' "navigation header" "navigation content" ',
    height: "100vh",
    backgroundColor: "#fff"
  },

  header: {
    position: "relative",
    gridArea: "header",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    background: "#fff",
    borderBottom: "1px solid rgba(0,0,0,0.1)",
    height: 100,
    marginLeft: 30,
    marginRight: 30
  },

  navigation: {
    position: "relative",
    gridArea: "navigation",
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
    cursor: "default",
    display: "flex",
    alignItems: "center",
    height: 50,
    "& h4": {
      whiteSpace: "nowrap",
      width: "calc(100% - 50px)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      margin: 0
    },
  },

  userAvatar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    marginRight: 15,
    borderRadius: "50%",
    backgroundColor: theme.palette.secondary.main,
    "& p": {
      fontSize: 12,
      color: "#fff",
      margin: 0,
      lineHeight: 1,
      marginBottom: "-2px"
    }
  },

  navigationContent: {
    paddingTop: 22
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
    gridArea: "content",
    paddingTop: 100,
    paddingLeft: 100,
    paddingRight: 100,
    backgroundColor: theme.palette.background.paper
  },

  newExhibitionBtn: {
    marginRight: 20,
    borderRadius: 100,
    textTransform: "initial"
  },

  navigationBtn: {
    width: "100%",
    padding: 10
  }

});