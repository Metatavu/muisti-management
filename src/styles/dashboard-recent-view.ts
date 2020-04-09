import { createStyles } from "@material-ui/core";
import theme from "./theme";

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

  titleGrid: {
    marginBottom: 50
  },

  content: {
    marginTop: 50
  }

});