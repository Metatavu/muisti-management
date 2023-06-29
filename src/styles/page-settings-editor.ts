import createStyles from "@mui/styles/createStyles";
import theme from "./theme";

export default createStyles({
  selectFields: {
    paddingTop: theme.spacing(2)
  },

  navigationTree: {
    marginTop: theme.spacing(2),
    marginBottom: 20
  },

  addNewLabel: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  }
});
