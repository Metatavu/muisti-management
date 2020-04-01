import { createStyles } from "@material-ui/core";
import theme from "./theme";

/**
 * Dashboard commonly used component stylings
 */
export default createStyles({

  muistiAvatar: {
    "& .MuiAvatar-root": {
      borderRadius: 5,
      boxShadow: theme.shadows[2],
      width: 35,
      "& img": {
        width: "50%",
        height: "auto"
      }
    }
  },

  content: {
    marginTop: 50
  },

  actionBtn: {
    borderRadius: 100,
    textTransform: "initial"
  },
});