import theme from "./theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  paper: {
    marginTop: "80px",
    maxWidth: "720px",
    marginLeft: "auto",
    marginRight: "auto",
    padding: "60px"
  },

  title: {
    textAlign: "center",
    fontWeight: "bold",
    paddingBottom: "60px"
  },

  cardItem: {
    cursor: "pointer",
    opacity: 0.5,
    transition: "opacity 0.2s ease-out",
    "&:hover": {
      opacity: 0.9
    },
    "&:active": {
      opacity: 1
    }
  },

  card: {
    width: 120,
    height: 120,
    padding: 20,
    background: "#ebebeb",
    borderColor: theme.palette.text.primary
  },

  imageContainer: {
    height: "100%"
  },

  media: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%"
  },

  cardTitle: {
    textAlign: "center",
    maxWidth: "120px"
  }
});
