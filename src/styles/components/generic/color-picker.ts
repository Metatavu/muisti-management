import createStyles from "@mui/styles/createStyles";

export default createStyles({
  color: {
    border: "1px solid rgba(0,0,0,0.2)",
    cursor: "pointer",
    borderRadius: 4,
    width: 40,
    height: 40,
    transition: "box-shadow 0.2s ease-out",
    "&:hover": {
      boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    }
  },

  popover: {
    position: "absolute",
    zIndex: 2,
    "& .sketch-picker": {
      position: "relative",
      zIndex: 4
    }
  },

  overlay: {
    position: "fixed",
    zIndex: 3,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
});
