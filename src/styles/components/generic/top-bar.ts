import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

const leftPadding = 30;

export default createStyles({
  root: {
    position: "relative",
    gridArea: "header",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    height: 130,
    paddingLeft: theme.spacing(5),
    borderBottom: "1px solid #D5D5D5",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)"
  },

  topRow: {
    display: "grid",
    gridAutoFlow: "column",
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center",
    paddingLeft: 45,
    width: "100%",
    height: 45
  },

  middleRow: {
    display: "flex",
    paddingTop: theme.spacing(1),
    alignItems: "center",
    width: "100%"
  },

  bottomRow: {
    display: "flex",
    paddingLeft: leftPadding,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 45,
    width: "100%"
  },

  breadcrumbs: {},

  nav: {
    justifySelf: "center",
    display: "flex",
    height: "100%"
  },

  navList: {
    display: "flex",
    "& a": {
      whiteSpace: "nowrap",
      borderRadius: 0,
      borderTop: "4px solid rgba(255,255,255,0)",
      transition: "border-top-color 0.2s ease-out",
      "& p": {
        lineHeight: 0
      },
      "&.Mui-selected": {
        borderTopColor: theme.palette.secondary.main
      }
    }
  },

  backBtn: {
    marginRight: theme.spacing(2),
    color: "#000"
  },

  title: {
    color: theme.palette.text.primary
  },

  user: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    justifySelf: "end",
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

  logoutBtn: {},

  toolbar: {
    display: "flex",
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& button": {
      marginRight: theme.spacing(1)
    }
  }
});
