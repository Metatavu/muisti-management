import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  toolbar: {
    display: "flex",
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    "& button": {
      marginRight: theme.spacing(1)
    }
  }
});
