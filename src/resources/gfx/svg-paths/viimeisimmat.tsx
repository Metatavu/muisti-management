import * as React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render Arrow Down Icon
 */
const LatestIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm0,22A10,10,0,1,1,22,12,10,10,0,0,1,12,22Z"/>
      <path d="M13,11.59V5a1,1,0,0,0-2,0v7a1,1,0,0,0,.08.38,1,1,0,0,0,.21.33l4,4a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z"/>
    </SvgIcon>
  );
}

export default LatestIcon;