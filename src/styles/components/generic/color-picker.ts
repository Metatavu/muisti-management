import { createStyles } from "@material-ui/core";

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
    position: "absolute"
  },

  overlay: {
    zIndex: 2,
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  },

});