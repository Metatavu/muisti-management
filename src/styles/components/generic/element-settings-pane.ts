import createStyles from "@mui/styles/createStyles";

export default createStyles({
  root: {
    height: "100%",
    position: "relative",
    gridArea: "properties",
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
    maxHeight: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto 1fr",
    flexDirection: "column",
    overflow: "hidden",
    backgroundColor: "#fbfbfb",
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
    overflowY: "auto",
    maxHeight: "100%",
    height: "100%"
  }
});
