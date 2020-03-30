import * as React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render Arrow Down Icon
 */
const DashboardIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M23,0H17.74a1,1,0,0,0-1,1V23a1,1,0,0,0,1,1H23a1,1,0,0,0,1-1V1A1,1,0,0,0,23,0ZM21.91,22H18.78V2h3.13Z"/>
      <path d="M14.61,12H9.39a1,1,0,0,0-1,1V23a1,1,0,0,0,1,1h5.22a1,1,0,0,0,1-1V13A1,1,0,0,0,14.61,12Zm-1,10H10.43V14h3.14Z"/>
      <path d="M6.26,7H1A1,1,0,0,0,0,8V23a1,1,0,0,0,1,1H6.26a1,1,0,0,0,1-1V8A1,1,0,0,0,6.26,7Zm-1,15H2.09V9H5.22Z"/>
    </SvgIcon>
  );
}

export default DashboardIcon;