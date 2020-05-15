import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({

  root: {
    position: "relative",
    gridArea: "header",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    borderBottom: "1px solid #ddd",
    height: 100
  },

  topRow: {
    paddingLeft: theme.spacing(8),
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  middleRow: {
    paddingLeft: theme.spacing(2),
    // FIXME: Hide these from first version
    display: "none",
    flex: 1,
    alignItems: "center",
    width: "100%",
  },

  bottomRow: {
    paddingLeft: theme.spacing(8),
    // FIXME: Hide these from first version
    display: "none",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  nav: {
    display: "flex"
  },

  navList: {
    display: "flex",
    "& a": {
      whiteSpace: "nowrap",
      "& p": {
        lineHeight: 0
      }
    }
  },

  homeBtn: {

  },
  
  title: {
    color: theme.palette.text.primary
  },

  user: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    "& p": {
      marginRight: theme.spacing(2)
    }
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

  logoutBtn: {

  },

  toolbar: {
    display: "flex",
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& button": {
      marginRight: theme.spacing(1)
    }
  }
})