import * as React from "react";

import { History } from "history";
import { Link as RouterLink } from "react-router-dom";
import { BreadcrumbData } from "../../types";
import { Link, Breadcrumbs as MaterialBreadcrumbs } from "@mui/material";
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import ChevronRight from "@mui/icons-material/ChevronRight";
import styles from "../../styles/components/generic/breadcrumbs";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  breadcrumbs: BreadcrumbData[];
}

/**
 * Functional component for breadcrumbs
 *
 * @param props component props
 */
const Breadcrumbs: React.FC<Props> = ({ breadcrumbs }) => {
  return (
    <MaterialBreadcrumbs separator={ <ChevronRight /> }>
      {
        breadcrumbs.map(breadcrumb => {
          return renderBreadcrumb(breadcrumb);
        })
      }
    </MaterialBreadcrumbs>
  );
};

/**
 * Renders single breadcrumb
 * 
 * @param breadcrumb breadcrumb data
 * @param isCurrentLocation is breadcrumb path current location path
 */
const renderBreadcrumb = (breadcrumb: BreadcrumbData) => {
  return breadcrumb.url ? (
    <Link key={ breadcrumb.url } component={ RouterLink } to={ breadcrumb.url || "" }>
      { breadcrumb.name ?? "" }
    </Link>
  ) : (
    <span key={ breadcrumb.name }>{ breadcrumb.name }</span>
  );
};


export default withStyles(styles)(Breadcrumbs);