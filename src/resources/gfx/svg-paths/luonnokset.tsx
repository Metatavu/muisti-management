import * as React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render Arrow Down Icon
 */
const DraftsIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M23,2H7A1,1,0,0,0,6,3V15a1,1,0,0,0,1,1H23a1,1,0,0,0,1-1V3A1,1,0,0,0,23,2ZM22,14H8V4H22Z"/>
      <path d="M20,17H5V6A1,1,0,0,0,3,6V18a1,1,0,0,0,1,1H20a1,1,0,0,0,0-2Z"/>
      <path d="M17,20H2V9A1,1,0,0,0,0,9V21a1,1,0,0,0,1,1H17a1,1,0,0,0,0-2Z"/>
    </SvgIcon>
  );
}

export default DraftsIcon;