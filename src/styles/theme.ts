import { createMuiTheme } from "@material-ui/core";
import { red, grey } from "@material-ui/core/colors";

export default createMuiTheme({

  palette: {
    primary: { main: grey[900] },

    background: {
      default: grey[100]
    },
    error: red,
  },

  typography: {
    h2: {
      fontSize: "24px"
    }
  }
});