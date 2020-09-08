import { createStyles } from "@material-ui/core";
import theme from "../../theme";

export default createStyles({

  fieldLabel: {
    marginLeft: theme.spacing(1)
  },

  field: {
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
    padding: `${theme.spacing(1)}px ${theme.spacing(3)}px`
  },

  mediaLibraryDialogTitle: {
    marginBottom: theme.spacing(1),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }

});