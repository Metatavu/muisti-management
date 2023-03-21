import * as React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render device portrait orientation icon
 */
const PortraitIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M16,0H8a3,3,0,0,0-3,3V21a3,3,0,0,0,3,3H16a3,3,0,0,0,3-3V3A3,3,0,0,0,16,0Zm1,19.59a1,1,0,0,1-1,1H8a1,1,0,0,1-1-1V4.41a1,1,0,0,1,1-1H16a1,1,0,0,1,1,1Z"/>
    </SvgIcon>
  );
}

export default PortraitIcon;