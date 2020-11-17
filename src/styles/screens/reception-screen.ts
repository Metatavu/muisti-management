import { createStyles } from "@material-ui/core";
import theme from "../theme";

export default createStyles({

  loader: {
    height: "100%",
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "#F5EFEA"
  },

  logoContainer: {
    flex: 1,
    marginTop: theme.spacing(5),
    width: 200,
    height: 200,
    "& img": {
      width: "100%"
    }
  },

  registerButton: {
    width: "80%",
    fontSize: 20,
  },

  select: {

  },

  formContainer: {
    display: "flex",
    flex: 3,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(5),
    backgroundColor: "#F5EFEA"
  },

  title: {
    marginTop: theme.spacing(5),
    display: "flex",
    justifyContent: "center"
  },

  textField: {
    marginTop: theme.spacing(5),
  },

  saveButton: {
    marginTop: theme.spacing(5),
    fontSize: 20,
  },

});