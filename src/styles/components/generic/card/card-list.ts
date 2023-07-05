import theme from "../../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  cardView: {
    maxHeight: "100%",
    overflowY: "auto",
    paddingLeft: 85,
    paddingRight: 85,
    paddingTop: 40,
    paddingBottom: 40
  },

  cardViewAutoHeight: {
    paddingLeft: 85,
    paddingRight: 85,
    paddingTop: 40,
    paddingBottom: 40
  },

  cardList: {
    display: "grid",
    gridTemplateColumns: "repeat( auto-fill, minmax(250px, 250px) )",
    gridGap: theme.spacing(5)
  }
});
