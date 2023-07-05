import createStyles from "@mui/styles/createStyles";

export default createStyles({
  cardWrapper: {
    position: "relative"
  },

  largeCard: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    cursor: "pointer",
    width: 250,
    height: 410,
    background: "#F1EFE8",
    borderRadius: 0,
    transition: "background 0.2s ease-out, box-shadow 0.2s ease-out ",
    "&:hover": {
      background: "#F1EFE8"
    },
    "&:active": {
      background: "#F1EFE8",
      boxShadow: "0 0 2 rgba(0,0,0,0.2)"
    },
    "& .MuiCardContent-root": {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column"
    }
  },

  card: {
    position: "relative",
    zIndex: 2,
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
      background: "#dedede"
    },
    "&:active": {
      background: "#dedede",
      boxShadow: "0 0 2px rgba(0,0,0,0.2)"
    },
    "&.selected": {
      border: "1px solid #000",
      boxShadow: "0 0 2px rgba(0,0,0,0.2)"
    },
    "& .MuiCardContent-root": {
      display: "flex",
      flexGrow: 1,
      flexDirection: "column"
    }
  },

  cardActionArea: {
    position: "absolute",
    zIndex: 1,
    width: "100%",
    transform: "translate3d(0, -35px, 0)",
    transition: "transform 0.2s ease-out",
    "&.visible": {
      transform: "translate3d(0, 0, 0)"
    },
    "& button": {
      width: "100%",
      border: "1px solid #000",
      borderTopWidth: 0,
      borderRadius: 0,
      background: "#ebebeb"
    }
  },

  imageContainer: {
    height: "100%"
  },

  status: {
    marginTop: "auto"
  }
});
