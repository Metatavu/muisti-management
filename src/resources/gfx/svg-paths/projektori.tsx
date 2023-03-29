import * as React from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {}

/**
 * Render Arrow Down Icon
 */
const ProjectorIcon = (props: Props) => {
  return (
    <SvgIcon {...props}>
      <path d="M22,7H20.9a5,5,0,0,0-9.8,0H2A2,2,0,0,0,0,9v9a2,2,0,0,0,2,2H3a1,1,0,0,0,1,1H7a1,1,0,0,0,1-1h8a1,1,0,0,0,1,1h3a1,1,0,0,0,1-1h1a2,2,0,0,0,2-2V9A2,2,0,0,0,22,7ZM16,5a3,3,0,1,1-3,3A3,3,0,0,1,16,5Zm6,13H2V9h9.1a5,5,0,0,0,9.8,0H22Z"/>
      <path d="M16,9a1,1,0,0,0,0-2h0a1,1,0,1,0,0,2Z"/>
      <path d="M8,11H4a1,1,0,0,0,0,2H8a1,1,0,0,0,0-2Z"/>
      <path d="M8,14H4a1,1,0,0,0,0,2H8a1,1,0,0,0,0-2Z"/>
    </SvgIcon>
  );
}

export default ProjectorIcon;