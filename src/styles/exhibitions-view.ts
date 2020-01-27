import { createStyles } from "@material-ui/core";

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
    cursor: "pointer"
  },

  card: {
    width: 120,
    height: 120,
    padding: 30,
    background: "#ebebeb",
    borderColor: "#323232"
  },
  
  media: {
    backgroundSize: "contain",
    backgroundPosition: "center",
    height: 60,
    width: 60
  },

  cardTitle: {
    textAlign: "center",
    maxWidth: "120px"
  }
});