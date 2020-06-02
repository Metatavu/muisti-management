import { createStyles } from "@material-ui/core";
import theme from "../../../theme";

export default createStyles({

  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    width: 250,
    height: 240,
    background: "#ebebeb",
    borderRadius: 4,
    transition: "background 0.2s ease-out, box-shadow 0.2s ease-out ",
    "&:hover": {
      background: "#dedede",
    },
    "&:active": {
      background: "#dedede",
      boxShadow: "0 0 2 rgba(0,0,0,0.2)"
    },
    "& .MuiCardContent-root": {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
    }
  },

  imageContainer: {
    height: "100%"
  },

  status: {
    marginTop: "auto"
  }

});