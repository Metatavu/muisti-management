import * as React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render Arrow Down Icon
 */
const SearchIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M23.66,22,18.1,16.44a10.18,10.18,0,1,0-1.66,1.66L22,23.66a1.21,1.21,0,0,0,.83.34,1.23,1.23,0,0,0,.84-.34A1.2,1.2,0,0,0,23.66,22ZM2.23,10.14A7.91,7.91,0,1,1,10.14,18,7.92,7.92,0,0,1,2.23,10.14Z"/>
    </SvgIcon>
  );
}

export default SearchIcon;