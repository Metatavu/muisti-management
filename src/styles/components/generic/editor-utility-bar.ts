import { createStyles } from "@material-ui/core";
import theme from "../../theme";

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