import { createStyles } from "@material-ui/core";
import theme from "../../theme";

export default createStyles({

  timeLineRowList: {
    padding: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    overflowX: "scroll",
    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.grey[300]
    },
    "&::-webkit-scrollbar": {
      height: 10
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.text.primary,
      border: "none"
    }
  },

  timelineRow: {
    padding: 15,
    height: 70,
    width: 5000
  },

  pageList: {
    display: "flex",
    padding: 0,
    height: "100%",
    width: "auto"
  },

  pageItem: {
    display: "flex",
    alignItems: "center",
    padding: "0 10px",
    marginRight: 5,
    height: "100%",
    width: 350
  },

  pageItemContent: {
    borderRadius: 2,
    borderColor: theme.palette.primary.main,
    transitionDuration: "0s"
  },

  selected: {
    borderColor: theme.palette.secondary.main,
    boxShadow: `0 0 0 2px ${theme.palette.secondary.main}`,
    zIndex: 1
  }

});