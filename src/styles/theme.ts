import { createMuiTheme } from '@material-ui/core';
import { red, grey } from "@material-ui/core/colors";

const uiHighlightMain = "#0079E9";
const uiHighlightLight = "rgba(0, 121, 233, 0.25)";

export default createMuiTheme({

  palette: {
    primary: { main: grey[900] },
    secondary: {
      main: uiHighlightMain,
      light: uiHighlightLight
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
    h5: {
      fontFamily: "TTNorms-Bold",
      fontSize: "14px",
      fontWeight: "normal"
    },
    h6: {
      fontFamily: "TTNorms-Regular",
      fontSize: "14px",
      fontWeight: "normal",
      color: "#666666"
    },
    body1: {
      fontSize: "14px"
    },
    body2: {
      fontSize: "14px",
      fontFamily: "TTNorms-Bold",
    }
  },
  overrides: {
    MuiTableCell: {
      root: {
        fontFamily: "TTNorms-Regular",
        backgroundColor: "#fff",
        padding: 10
      },
      head: {
        fontFamily: "TTNorms-Bold",
        backgroundColor: "#efefef"
      }
    },
    MuiAccordionSummary: {
      root: {
        "&.Mui-expanded": {
          minHeight: 48
        }
      },
      content: {
        alignItems: "center",
        justifyContent: "space-between",
      }
    },
    MuiAccordionDetails: {
      root: {
        flexDirection: "column",
        padding: 0,
        backgroundColor: "#f7f7f7"
      }
    },
    MuiBackdrop: {
      root: {
        backgroundColor: "rgba(0,0,0,0.1)"
      }
    },
    MuiPaper: {
      rounded: {
        borderRadius: 10
      }
    },
    MuiButton: {
      root: {
        fontFamily: "TTNorms-Medium",
        textTransform: "initial",
      },
      textPrimary: {
        fontFamily: "TTNorms-Medium",
      },
      containedPrimary: {
        color: "#fff",
        textTransform: "initial",
        borderRadius: 0
      },
      containedSecondary: {
        color: "#fff",
        textTransform: "initial",
        borderRadius: 0
      },
      contained: {
        color: "#fff",
        backgroundColor: uiHighlightMain,
        textTransform: "initial",
        borderRadius: 0,
        "&:hover": {
          backgroundColor: "rgba(138,192,203, 0.8)"
        },
        "&:active": {
          backgroundColor: "rgba(138,192,203, 0.7)"
        }
      }
    },
    MuiInputLabel: {
      filled: {
        transform: "translate(12px, 13px) scale(1)",
        "&.MuiInputLabel-shrink": {
          transform: "translate(0px, -16px) scale(0.9)"
        }
      }
    },
    MuiFilledInput: {
      root: {
        backgroundColor: "#f3f3f3",
        borderRadius: 4,
        "& .MuiSelect-select": {
          color: "#222"
        },
      },
      input: {
        padding: "10px 12px"
      },
      multiline: {
        paddingTop: 10
      },
      underline: {
        "&::before": {
          borderBottom: "0px solid rgba(0,0,0,0)"
        },
        "&::after": {
          borderBottomColor: uiHighlightMain
        },
        "&:hover": {
          "&::before": {
            borderBottomColor: uiHighlightMain
          }
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
    MuiInputBase: {
      root: {
        fontSize: 14
      }
    },
    MuiSelect: {
      filled: {
        padding: "10px 12px"
      },
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
          color: uiHighlightMain,
          "& .MuiListItemIcon-root": {
            color: "#fff",
            backgroundColor: uiHighlightMain
          },
          "& .MuiTypography-colorTextSecondary": {
            color: uiHighlightMain
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
        backgroundColor: uiHighlightMain,
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "background-color 0.2s ease-out",
        "&:hover": {
          backgroundColor: uiHighlightLight
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
    },
    MuiDialogTitle: {
      root: {
        fontFamily: "TTNorms-Medium",
        fontSize: "16px",
        fontWeight: "normal",
        color: "#000"
      }
    }
  }
});
