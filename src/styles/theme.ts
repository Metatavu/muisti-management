import { createMuiTheme } from "@material-ui/core";
import { red, grey } from "@material-ui/core/colors";

export default createMuiTheme({

  palette: {
    primary: { main: grey[900] },
    secondary: { 
      main: "#8AC0CB",
      light: "#C0DDE3"
    },

    background: {
      default: "#f2f2f2",
      paper: "#fff"
    },
    text: {
      primary: "#292929"
    },
    error: red,
  },

  typography: {
    h2: {
      fontSize: "24px"
    }
  },
  overrides: {
    MuiPaper: {
      rounded: {
        borderRadius: 8
      }
    }
  }
});