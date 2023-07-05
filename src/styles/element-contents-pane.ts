import createStyles from "@mui/styles/createStyles";

export default createStyles({
  root: {
    position: "relative",
    gridArea: "contents",
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
    height: 48,
    width: 48
  },
  container: {
    overflowY: "auto",
    backgroundColor: "#fbfbfb",
    height: "100%",
    width: 450,
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
    height: 48,
    "& h3": {
      whiteSpace: "nowrap",
      width: "calc(100% - 50px)",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  },
  content: {
    borderBottom: "1px solid #ddd"
  }
});
