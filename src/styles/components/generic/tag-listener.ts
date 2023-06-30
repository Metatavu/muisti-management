import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "column",
    backgroundColor: "#F5EFEA"
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

  formContainer: {
    display: "flex",
    flex: 3,
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    padding: theme.spacing(5),
    backgroundColor: "#F5EFEA"
  },

  text: {}
});
