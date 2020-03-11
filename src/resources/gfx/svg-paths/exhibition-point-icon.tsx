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
 * Render Exhibition Point Icon
 */
const ExhibitionPointIcon = (props: Props) => {
  const { selected } = props;
  return (
    <SvgIcon {...props}>
      <rect x="2" y="2" width="20" height="20" fill={ selected ? theme.palette.secondary.light : "#eee" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M2 22H10V14H2V22ZM11 24H1C0.448 24 0 23.552 0 23V13C0 12.448 0.448 12 1 12H11C11.552 12 12 12.448 12 13V23C12 23.552 11.552 24 11 24Z" fill={ selected ? theme.palette.secondary.main : theme.palette.text.primary }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M1 5C0.448 5 0 4.552 0 4V1C0 0.448 0.448 0 1 0H4C4.552 0 5 0.448 5 1C5 1.552 4.552 2 4 2H2V4C2 4.552 1.552 5 1 5Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23 5C22.448 5 22 4.552 22 4V2H20C19.448 2 19 1.552 19 1C19 0.448 19.448 0 20 0H23C23.552 0 24 0.448 24 1V4C24 4.552 23.552 5 23 5Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2H7C6.448 2 6 1.552 6 1C6 0.448 6.448 0 7 0H10C10.552 0 11 0.448 11 1C11 1.552 10.552 2 10 2Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M1 11C0.448 11 0 10.552 0 10V7C0 6.448 0.448 6 1 6C1.552 6 2 6.448 2 7V10C2 10.552 1.552 11 1 11Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M17 2H14C13.448 2 13 1.552 13 1C13 0.448 13.448 0 14 0H17C17.552 0 18 0.448 18 1C18 1.552 17.552 2 17 2Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M17 24H14C13.448 24 13 23.552 13 23C13 22.448 13.448 22 14 22H17C17.552 22 18 22.448 18 23C18 23.552 17.552 24 17 24Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23 24H20C19.448 24 19 23.552 19 23C19 22.448 19.448 22 20 22H22V20C22 19.448 22.448 19 23 19C23.552 19 24 19.448 24 20V23C24 23.552 23.552 24 23 24Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23 11C22.448 11 22 10.552 22 10V7C22 6.448 22.448 6 23 6C23.552 6 24 6.448 24 7V10C24 10.552 23.552 11 23 11Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23 18C22.448 18 22 17.552 22 17V14C22 13.448 22.448 13 23 13C23.552 13 24 13.448 24 14V17C24 17.552 23.552 18 23 18Z" fill={ selected ? theme.palette.secondary.main : "#CCC" }/>
    </SvgIcon>
  );
}

export default ExhibitionPointIcon;