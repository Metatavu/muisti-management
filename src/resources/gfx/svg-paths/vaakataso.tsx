import * as React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render device landscape orientation icon
 */
const LandscapeIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M21,4.94H3A3,3,0,0,0,0,8V16a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V8A3,3,0,0,0,21,4.94ZM20.59,16a1,1,0,0,1-1,1H4.43a1,1,0,0,1-1-1V8a1,1,0,0,1,1-1H19.59a1,1,0,0,1,1,1Z"/>
    </SvgIcon>
  );
}

export default LandscapeIcon;