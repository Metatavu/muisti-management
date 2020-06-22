import { createStyles } from "@material-ui/core";
import theme from "../../theme";

export default createStyles({

  treeView: {
    "& > div:focus": {
      outline: "none"
    },
    "& .MuiListItemSecondaryAction-root": {
      zIndex: 1000
    },
  },

  searchBar: {
  },

  listItem: {
    cursor: 'pointer',
    position: 'relative',
    transition: "background-color 0.2s ease-out, color 0.2s ease-out",
    "&:hover": {
      backgroundColor: "#f2f2f2"
    },
    "&.focused": {
      backgroundColor: theme.palette.secondary.main,
      color: "#fff",
      zIndex: 999,
    }
  },

  treeMenu: {
    overflow: "hidden"
  }

});