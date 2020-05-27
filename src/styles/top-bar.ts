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
    height: 100,
    padding: theme.spacing(2)
  },

  topRow: {
    paddingLeft: theme.spacing(8),
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%",
  },

  middleRow: {
    display: "flex",
    paddingTop: theme.spacing(1),
    alignItems: "center",
    width: "100%",
  },

  bottomRow: {
    display: "flex",
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(8),
    paddingBottom: theme.spacing(2),
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },

  breadcrumbs: {
    marginRight: "auto"
  },

  nav: {
    display: "flex",
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

  backBtn: {
    marginRight: 25,
    color: "#000"
  },
  
  title: {
    color: theme.palette.text.primary
  },

  user: {
    marginLeft: 300,
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

  tabs: {

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