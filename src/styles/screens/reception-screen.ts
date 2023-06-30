import theme from "../theme";
import createStyles from "@mui/styles/createStyles";

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
    alignItems: "center"
  },

  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "#F5EFEA",
    overflow: "auto"
  },

  logoContainer: {
    flex: 1,
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(5),
    width: 200,
    height: 200,
    "& img": {
      width: "100%"
    }
  },

  registerButton: {
    width: "80%",
    fontSize: 20,
    maxWidth: 360
  },

  saveButton: {
    width: "80%",
    fontSize: 20,
    maxWidth: 360,
    marginTop: theme.spacing(5)
  },

  select: {
    width: "80%",
    maxWidth: 360
  },

  languageSelectControl: {
    marginTop: theme.spacing(5)
  },

  formContainer: {
    display: "flex",
    flex: 3,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    paddingLeft: theme.spacing(10),
    paddingRight: theme.spacing(10),
    backgroundColor: "#F5EFEA"
  },

  title: {
    display: "flex",
    justifyContent: "center"
  },

  textField: {
    marginTop: theme.spacing(5)
  },

  visitorTagContainer: {
    marginTop: theme.spacing(5)
  }
});
