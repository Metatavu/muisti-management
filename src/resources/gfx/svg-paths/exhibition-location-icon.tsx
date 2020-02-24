import * as React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";
import theme from "../../../styles/theme"

interface Props extends SvgIconProps {
  selected?: boolean
}

const ExhibitionLocationIcon = (props: Props) => {
  const { selected } = props;
  return (
    <SvgIcon {...props}>
      <rect x="2" y="2" width="20" height="20" fill={ selected ? theme.palette.secondary.light : "#eee" }/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2 2V22H21.997L22 2H2ZM22 22V23V22ZM22 24H2C0.897 24 0 23.103 0 22V2C0 0.897 0.897 0 2 0H22C23.103 0 24 0.897 24 2V22C24 23.103 23.103 24 22 24Z" fill={ selected ? theme.palette.secondary.main : theme.palette.text.primary }/>
    </SvgIcon>
  );
}

export default ExhibitionLocationIcon;