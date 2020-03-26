import * as React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render Arrow Down Icon
 */
const ArrowDownIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M16.71,9.29a1,1,0,0,0-1.42,0L12,12.59,8.71,9.29a1,1,0,1,0-1.42,1.42l4,4a1,1,0,0,0,1.42,0l4-4A1,1,0,0,0,16.71,9.29Z"/>
    </SvgIcon>
  );
}

export default ArrowDownIcon;