import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  tabs: {
    display: "flex",
    height: "100%",
    marginRight: "auto",
    "& a": {
      whiteSpace: "nowrap",
      borderRadius: 0,
      borderBottom: "4px solid rgba(255,255,255,0)",
      transition: "border-top-color 0.2s ease-out",
      "& p": {
        lineHeight: 0
      },
      "&.Mui-selected": {
        borderBottomColor: theme.palette.secondary.main
      }
    }
  }
});
