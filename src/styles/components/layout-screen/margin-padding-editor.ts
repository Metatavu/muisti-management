import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  paddingContainer: {
    width: 180,
    border: "1px solid",
    borderColor: theme.palette.secondary.main,
    borderRadius: 4,
    padding: theme.spacing(1),
    backgroundColor: theme.palette.secondary.light
  },
  marginContainer: {
    width: 180,
    border: "1px dashed",
    borderColor: theme.palette.secondary.main,
    borderRadius: 4,
    padding: theme.spacing(1),
    backgroundColor: "#f7f7f7"
  },
  paddingInnerContainer: {
    border: "1px solid #ccc",
    padding: theme.spacing(1),
    backgroundColor: "#eee",
    borderRadius: 4
  },
  marginInnerContainer: {
    border: "1px solid",
    borderColor: theme.palette.secondary.main,
    padding: theme.spacing(1),
    backgroundColor: "#eee",
    borderRadius: 4
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
      height: 25,
      justifyContent: "center",
      borderRadius: 4,
      border: "1px solid rgba(0,0,0,0.2)",
      textAlign: "center",
      backgroundColor: "#fff"
    }
  },
  toggleLink: {
    width: 40,
    height: 30,
    padding: 0,
    margin: "0 5px",
    minWidth: 40,
    borderRadius: "50%",
    backgroundColor: "transparent"
  }
});
