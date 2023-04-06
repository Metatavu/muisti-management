import { SubdirectoryArrowRightRounded } from "@mui/icons-material";
import { TreeItem, treeItemClasses, TreeItemProps } from "@mui/lab";
import { Stack, styled, SvgIcon, Typography } from "@mui/material";
import strings from "../../../localization/strings";
import theme from "../../theme";

/**
 * Styled tree item component props
 */
type StyledTreeItemProps = TreeItemProps & {
  labelText: string;
  isLayoutComponent: boolean;
  isRoot?: boolean;
  hasChildren?: boolean;
};

/**
 * Styled tree item theme
 */
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightMedium,
    "&.Mui-expanded": {
      fontWeight: theme.typography.fontWeightRegular,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused": {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: "var(--tree-view-color)",
    },
    "&.Mui-selected": {
      backgroundColor: theme.palette.background.default
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: "inherit",
      color: "inherit",
    },
  }
}));

/**
 * Styled tree item component
 */
const StyledTreeItem = ({
  labelText,
  isLayoutComponent,
  isRoot,
  hasChildren,
  ...other
}: StyledTreeItemProps) => {

  return (
    <StyledTreeItemRoot
      label={
        <Stack direction="row" justifyContent="space-between">
          <div style={{ display: "flex", flexDirection: "row" }}>
        {   (hasChildren) ?
            <SubdirectoryArrowRightRounded
              sx={{
                color: "#BDBDBD",
                alignSelf: "center",
                marginRight: theme.spacing(2)
              }}
            /> :
            <div style={{ marginRight: theme.spacing(5) }}/>
            }
            <Stack direction="column">
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "inherit",
                  flexGrow: 1,
                  color: "#2196F3"
                }}
              >
                { labelText }
              </Typography>
              <Typography>
                { strings.comingSoon }
              </Typography>
            </Stack>
          </div>
          { isLayoutComponent &&
            <SvgIcon fontSize="large" sx={{ alignSelf: "center", justifySelf: "center" }}>
              <path d="M0.766699 12.5839C1.0917 12.9089 1.6167 12.9089 1.9417 12.5839L4.00003 10.5256L6.05837 12.5839C6.38337 12.9089 6.90837 12.9089 7.23337 12.5839C7.55837 12.2589 7.55837 11.7339 7.23337 11.4089L4.5917 8.76727C4.2667 8.44227 3.7417 8.44227 3.4167 8.76727L0.775033 11.4089C0.441699 11.7256 0.441699 12.2589 0.766699 12.5839ZM7.23337 0.417273C6.90837 0.092273 6.38337 0.092273 6.05837 0.417273L4.00003 2.47561L1.9417 0.417273C1.6167 0.092273 1.0917 0.092273 0.766699 0.417273C0.441699 0.742273 0.441699 1.27561 0.766699 1.60061L3.40837 4.24227C3.73337 4.56727 4.25837 4.56727 4.58337 4.24227L7.22503 1.60061C7.55836 1.27561 7.55837 0.742273 7.23337 0.417273Z" fill="#2196F3"/>
            </SvgIcon>
          }
        </Stack>
      }
      {...other}
    />
  );
};

export default StyledTreeItem;