import { createStyles } from "@material-ui/core";

export default createStyles({

  largeCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    width: 250,
    height: 410,
    background: "#F1EFE8",
    borderRadius: 0,
    transition: "background 0.2s ease-out, box-shadow 0.2s ease-out ",
    "&:hover": {
      background: "#F1EFE8",
    },
    "&:active": {
      background: "#F1EFE8",
      boxShadow: "0 0 2 rgba(0,0,0,0.2)"
    },
    "& .MuiCardContent-root": {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
    }
  },

  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    width: 250,
    height: 240,
    background: "#ebebeb",
    borderRadius: 0,
    border: "1px solid transparent",
    transition: "background 0.2s ease-out, box-shadow 0.2s ease-out ",
    "&:hover": {
      background: "#dedede",
    },
    "&:active": {
      background: "#dedede",
      boxShadow: "0 0 2 rgba(0,0,0,0.2)"
    },
    "&.selected": {
      border: "1px solid #000",
      boxShadow: "0 0 2 rgba(0,0,0,0.2)"
    },
    "& .MuiCardContent-root": {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column",
    }
  },

  imageContainer: {
    height: "100%"
  },

  status: {
    marginTop: "auto"
  }

});