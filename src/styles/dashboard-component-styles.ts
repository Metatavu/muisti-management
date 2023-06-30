import theme from "./theme";
import createStyles from "@mui/styles/createStyles";

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
  }
});
