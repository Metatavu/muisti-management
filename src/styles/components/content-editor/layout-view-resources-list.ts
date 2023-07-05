import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  list: {
    marginLeft: theme.spacing(4)
  },

  listItem: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff"
  },

  listItemTitle: {},
  listItemSubtitle: {}
});
