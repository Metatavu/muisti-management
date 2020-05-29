import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({

  cardItem: {
    width: 250,
    height: 400,
    cursor: "pointer",
    opacity: 0.5,
    transition: "opacity 0.2s ease-out",
    "&:hover": {
      opacity: 0.9,
    },
    "&:active": {
      opacity: 1,
    }
  },

  card: {
    width: 250,
    height: 400,
    padding: 20,
    background: "#ebebeb",
    borderColor: theme.palette.text.primary
  },

  imageContainer: {
    height: "100%"
  },

  cardTitle: {
    textAlign: "center",
    maxWidth: "120px"
  }

});