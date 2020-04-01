import { createMuiTheme } from '@material-ui/core';
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
      primary: "#000",
      secondary: "#888"
    },
    error: red,
  },

  typography: {
    fontFamily: "TTNorms-Regular",
    h1: {
      fontFamily: "TTNorms-Bold",
      fontSize: "24px",
      fontWeight: "normal"
    },
    h2: {
      fontFamily: "TTNorms-Bold",
      fontSize: "20px",
      fontWeight: "normal"
    },
    h3: {
      fontFamily: "TTNorms-Bold",
      fontSize: "18px",
      fontWeight: "normal"
    },
    h4: {
      fontFamily: "TTNorms-Bold",
      fontSize: "16px",
      fontWeight: "normal"
    },
    body1: {
      fontSize: "14px"
    }
  },
  overrides: {
    MuiPaper: {
      rounded: {
        borderRadius: 8
      }
    },
    MuiButton: {
      contained: {
        color: "#fff",
        backgroundColor: "rgba(138,192,203, 1)",
        "&:hover": {
          backgroundColor: "rgba(138,192,203, 0.8)"
        },
        "&:active": {
          backgroundColor: "rgba(138,192,203, 0.7)"
        }
      }
    },
    MuiInput: {
      underline: {
        "&::before": {
          content: "none"
        }
      }
    },
    MuiSelect: {
      select: {
        lineHeight: 1,
        padding: 5,
        color: "#999"
      },
      icon: {
        color: "#999"
      }
    },
    MuiListItem: {
      root: {
        borderRadius: 4,
        "&.Mui-selected": {
          backgroundColor: "rgba(0,0,0,0)",
          color: "rgba(138,192,203, 1)",
          "& .MuiListItemIcon-root": {
            color: "#fff",
            backgroundColor: "rgba(138,192,203, 1)"
          },
          "& .MuiTypography-colorTextSecondary": {
            color: "rgba(138,192,203, 1)"
          }
        }
      }
    },
    MuiListItemIcon: {
      root: {
        height: 30,
        width: 30,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        minWidth: 24,
        marginRight: 15,
        transition: "background-color 0.2s ease-out",
        "& .MuiSvgIcon-root": {
          fontSize: 16
        }
      }
    },
    MuiListItemText: {
      primary: {
        fontFamily: "TTNorms-Medium",
        fontSize: "14px",
      },
      secondary: {
        color: "#888"
      }
    },
    MuiGridListTile: {
      tile: {
        cursor: "pointer",
        backgroundColor: "rgba(138,192,203, 1)",
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "background-color 0.2s ease-out",
        "&:hover": {
          backgroundColor: "rgba(138,192,203, 0.8)"
        }
      },
      imgFullWidth: {
        width: 100,
        top: 0,
        transform: "initial"
      },
      imgFullHeight: {
        width: "50%"
      }
    },
    MuiGridListTileBar: {
      root: {
        backgroundColor: "transparent"
      }
    }
  }
});