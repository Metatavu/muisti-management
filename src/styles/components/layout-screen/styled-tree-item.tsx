import { HtmlComponentType } from "../../../types";
import LocalizationUtils from "../../../utils/localization-utils";
import { TreeItem, TreeItemProps, treeItemClasses } from "@mui/lab";
import { Stack, Typography, styled } from "@mui/material";
import { ReactNode } from "react";

/**
 * Styled Tree Item Props type
 */
type StyledTreeItemProps = TreeItemProps & {
  itemType: HtmlComponentType;
  itemName: string;
  startIcon: ReactNode;
  endIcon?: ReactNode;
};

/**
 * Styled Tree Item Root styled component
 */
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    },
    "&.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)"
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.background.default
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit"
    }
  }
}));

/**
 * Styled Tree Item Component
 */
export const StyledTreeItem = ({
  itemType,
  itemName,
  startIcon,
  endIcon,
  ...other
}: StyledTreeItemProps) => (
  <StyledTreeItemRoot
    icon={startIcon}
    {...other}
    label={
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="column">
          <Typography
            variant="body2"
            sx={{
              fontWeight: "inherit",
              flexGrow: 1,
              color: "#2196F3"
            }}
          >
            {itemName}
          </Typography>
          <Typography>{LocalizationUtils.getLocalizedComponentType(itemType)}</Typography>
        </Stack>
        {endIcon}
      </Stack>
    }
  />
);
