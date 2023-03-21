import * as React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render Arrow Down Icon
 */
const ArchivedIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M21.21,4H16.09V3A3,3,0,0,0,13,.05H11A3,3,0,0,0,7.9,3V4H2.78a1,1,0,1,0,0,2H3.93l1.82,16A2.17,2.17,0,0,0,7.9,24h8.19a2.17,2.17,0,0,0,2.16-1.88L20.1,6h1.11a1,1,0,1,0,0-2ZM10,3a1,1,0,0,1,1-1h2a1,1,0,0,1,1,1V4H10Zm6.27,18.81a.18.18,0,0,1-.13.11H7.9s-.11-.07-.12-.11L6,6H18Z"/>
    </SvgIcon>
  );
}

export default ArchivedIcon;