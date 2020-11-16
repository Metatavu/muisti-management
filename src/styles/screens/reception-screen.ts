import { createStyles } from "@material-ui/core";

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
    justifyContent: "center"
  },

  registerButton: {
    width: "80%",
    fontSize: 20,
  },

  select: {

  },

  formContainer: {
    display: "flex",
    flexDirection: "column",
    padding: 20
  },

  title: {
    marginTop: 25,
    display: "flex",
    justifyContent: "center"
  },

  textField: {
    marginTop: 25
  },

  saveButton: {
    marginTop: 25,
    fontSize: 20,
  },

});