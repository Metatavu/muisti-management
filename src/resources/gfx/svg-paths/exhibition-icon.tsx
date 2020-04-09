import * as React from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";
import theme from "../../../styles/theme"

/**
 * Interface representing component properties
 */
interface Props extends SvgIconProps {
  selected?: boolean
}

/**
 * Render Exhibition Icon
 */
const ExhibitionIcon = (props: Props) => {
  const { selected } = props;
  return (
    <SvgIcon {...props}>
      <rect opacity="0.5" x="2" y="2" width="7" height="9" fill={ selected ? theme.palette.secondary.light : "#eee" }/>
      <rect opacity="0.5" x="15" y="2" width="7" height="5" fill={ selected ? theme.palette.secondary.light : "#eee" }/>
      <rect opacity="0.5" x="2" y="17" width="7" height="5" fill={ selected ? theme.palette.secondary.light : "#eee" }/>
      <rect opacity="0.5" x="15" y="13" width="7" height="9" fill={ selected ? theme.palette.secondary.light : "#eee" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M2 11H9V2H2V11ZM10 13H1C0.447 13 0 12.552 0 12V1C0 0.448 0.447 0 1 0H10C10.553 0 11 0.448 11 1V12C11 12.552 10.553 13 10 13Z" fill={ selected ? theme.palette.secondary.main : theme.palette.text.primary }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M2 22H9V17H2V22ZM10 24H1C0.447 24 0 23.552 0 23V16C0 15.448 0.447 15 1 15H10C10.553 15 11 15.448 11 16V23C11 23.552 10.553 24 10 24Z" fill={ selected ? theme.palette.secondary.main : theme.palette.text.primary }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.063 22H22.063V13H15.063V22ZM23.063 24H14.063C13.51 24 13.063 23.552 13.063 23V12C13.063 11.448 13.51 11 14.063 11H23.063C23.615 11 24.063 11.448 24.063 12V23C24.063 23.552 23.615 24 23.063 24Z" fill={ selected ? theme.palette.secondary.main : theme.palette.text.primary }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.063 7H22.063V2H15.063V7ZM23.063 9H14.063C13.51 9 13.063 8.552 13.063 8V1C13.063 0.448 13.51 0 14.063 0H23.063C23.615 0 24.063 0.448 24.063 1V8C24.063 8.552 23.615 9 23.063 9Z" fill={ selected ? theme.palette.secondary.main : theme.palette.text.primary }/>
    </SvgIcon>
  );
}

export default ExhibitionIcon;