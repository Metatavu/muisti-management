import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  root: {
    position: "relative",
    gridArea: "hierarchy",
    borderLeft: "1px solid #ddd",
    overflow: "hidden",
    transition: "width 0.4s ease-in-out"
  },
  btnContainer: {
    position: "absolute",
    zIndex: 1,
    right: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    width: 50
  },
  container: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#fbfbfb",
    height: "100%",
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
  }
});
