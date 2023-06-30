import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  root: {
    display: "block"
  },
  loader: {
    height: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
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
    position: "absolute"
  },
  addButton: {
    minWidth: "25px",
    width: "30px",
    right: "40px",
    position: "absolute"
  },
  tableItem: {
    cursor: "pointer",
    position: "relative",
    transition: "background-color 0.2s ease-out, color 0.2s ease-out",
    "&:hover": {
      backgroundColor: "#f2f2f2"
    },
    "&.focused": {
      backgroundColor: theme.palette.secondary.main,
      color: "#fff",
      zIndex: 999
    }
  }
});
