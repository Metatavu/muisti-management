import { LayoutType } from "../../../generated/client";
import theme from "../../../styles/theme";
import { Android as AndroidIcon, Html as HtmlIcon } from "@mui/icons-material/";
import { Badge } from "@mui/material";
import { ReactNode } from "react";

/**
 * Components properties
 */
interface Props {
  type: LayoutType;
  children: ReactNode;
}

/**
 * Layout Card Badge component
 */
const LayoutCardBadge = ({ type, children }: Props) => {
  return (
    <Badge
      sx={{ position: "relative" }}
      slotProps={{ badge: { style: { zIndex: theme.zIndex.modal - 1 } } }}
      badgeContent={
        type === LayoutType.Android ? <AndroidIcon sx={{ color: "#3DDC84" }} /> : <HtmlIcon />
      }
    >
      {children}
    </Badge>
  );
};

export default LayoutCardBadge;
