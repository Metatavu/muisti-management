import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  root: {
    position: "relative",
    gridArea: "navigation",
    borderLeft: "1px solid #ddd",
    overflow: "hidden",
    transition: "width 0.4s ease-in-out"
  },
  container: {
    backgroundColor: "#fbfbfb",
    display: "grid",
    gridTemplateRows: "auto 1fr",
    overflow: "hidden",
    height: "100%",
    width: 320,
    transition: "opacity 0.2s 0.2s ease-in-out",
    "&.closed": {
      opacity: 0
    }
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 12px",
    borderBottom: "1px solid #ddd",
    height: 55,
    "& h3": {
      whiteSpace: "nowrap",
      width: "calc(100% - 50px)",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  },
  content: {
    padding: theme.spacing(2),
    overflowY: "auto"
  },
});