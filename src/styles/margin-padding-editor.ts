import { createStyles } from "@material-ui/core";
import theme from "./theme";

export default createStyles({
  paddingContainer: {
    width: 180,
    border: "1px solid #222",
    borderRadius: 4,
    padding: theme.spacing(2),
    backgroundColor: "#d7ffd4"
  },
  marginContainer: {
    width: 180,
    border: "1px dashed #222",
    borderRadius: 4,
    padding: theme.spacing(2),
    backgroundColor: "#fff4d4"
  },
  paddingInnerContainer: {
    border: "1px dashed #222",
    padding: theme.spacing(1),
    backgroundColor: "#eee"
  },
  marginInnerContainer: {
    border: "1px solid #222",
    padding: theme.spacing(1),
    backgroundColor: "#eee"
  },
  topRow: {
    display: "flex",
    justifyContent: "center"
  },
  middleRow: {
    display: "flex",
    height: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomRow: {
    display: "flex",
    justifyContent: "center"
  },
  input: {
    "& input": {
      display: "flex",
      padding: 2,
      width: 40,
      height: 30,
      justifyContent: "center",
      borderRadius: 4,
      border: "1px solid rgba(0,0,0,0.2)",
      textAlign: "center",
      backgroundColor: "#fff"
    }
  },
  toggleLink: {
    width: 50,
    minWidth: 50,
    height: 30,
    padding: 0,
    borderRadius: 0,
    backgroundColor: "transparent"
  }
});