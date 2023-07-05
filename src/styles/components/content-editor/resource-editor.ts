import theme from "../../theme";
import createStyles from "@mui/styles/createStyles";

export default createStyles({
  fieldLabel: {
    marginLeft: theme.spacing(1)
  },

  field: {
    backgroundColor: "#fff",
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(2),
    "&:last-child": {
      marginRight: 0
    }
  },

  iconButton: {
    marginBottom: theme.spacing(2)
  },

  resourceSwitchWhenList: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  decorativeIcon: {
    marginRight: theme.spacing(1)
  },

  mediaLibraryDialog: {
    width: 500,
    height: 800,
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`
  },

  mediaLibraryDialogTitle: {
    marginBottom: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
