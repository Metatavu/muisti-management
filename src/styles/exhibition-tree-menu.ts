import theme from "./theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  treeView: {
    "& > div:focus": {
      outline: "none"
    },
    "& .MuiListItemSecondaryAction-root": {
      zIndex: 1000
    }
  },

  searchBar: {},

  listItem: {
    cursor: "pointer",
    position: "relative",
    paddingTop: 0,
    paddingBottom: 0,
    borderRadius: 0,
    transition: "background-color 0.2s ease-out, color 0.2s ease-out",
    "& p": {
      fontSize: 12
    },
    "&:hover": {
      backgroundColor: "#f2f2f2"
    },
    "&.focused": {
      backgroundColor: theme.palette.secondary.main,
      color: "#fff",
      zIndex: 999,
      "& p": {
        color: "#fff"
      }
    }
  }
});
