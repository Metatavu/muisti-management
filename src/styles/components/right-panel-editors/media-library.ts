import { createStyles } from "@material-ui/core";
import theme from "../../theme";

export default createStyles({
  root: {
    display: "block"
  },
  folder: {
    display: "flex",
    alignItems: "center"
  },
  mediaThumbnail: {
    borderRadius: 0
  },
  refreshButton: {
    minWidth: "25px",
    width: "30px",
    right: "70px",
    position: "absolute",
  },
  addButton: {
    minWidth: "25px",
    width: "30px",
    right: "40px",
    position: "absolute",
  },
  tableItem: {
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
  }

});
