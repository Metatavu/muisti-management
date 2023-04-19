import { SubdirectoryArrowRightRounded } from "@mui/icons-material";
import { TreeItem, treeItemClasses, TreeItemProps } from "@mui/lab";
import { Stack, styled, SvgIcon, Typography } from "@mui/material";
import theme from "../../theme";
import ParentTreeIcon from "./parent-tree-icon";

type StyledTreeItemProps = TreeItemProps & {
  itemType: string;
  itemName: string;
  isLayoutComponent: boolean;
  isRoot?: boolean;
  isRootSubdirectory?: boolean;
  hasChildren?: boolean;
};

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
}
));

export const StyledTreeItem = ({
  itemType,
  itemName,
  isLayoutComponent,
  isRoot,
  isRootSubdirectory,
  hasChildren,
  ...other
}: StyledTreeItemProps) => {

  return (
    <StyledTreeItemRoot
      label={
        <Stack direction="row" justifyContent="space-between" >
          <div style={{ display: "flex", flexDirection: "row" }}>
            { (isRootSubdirectory) &&
              <SubdirectoryArrowRightRounded
                sx={{
                  color: "#BDBDBD",
                  alignSelf: "center",
                  marginRight: theme.spacing(2),
                }}
              />
            }
            { (!isRoot && !isRootSubdirectory) &&
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
                { itemName }
              </Typography>
              <Typography>
                { itemType }
              </Typography>
            </Stack>
            { hasChildren &&
            <ParentTreeIcon /> }
          </div>

        </Stack>
      }
      {...other}
    />
  );
}