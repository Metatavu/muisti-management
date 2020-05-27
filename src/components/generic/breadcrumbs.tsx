import * as React from "react";

import { History } from "history";
import { Link as RouterLink } from "react-router-dom";
import { BreadcrumbData } from "../../types";
import { WithStyles, withStyles, Link, Breadcrumbs as MaterialBreadcrumbs } from "@material-ui/core";
import ChevronRight from "@material-ui/icons/ChevronRight";
import styles from "../../styles/basic-layout";
import strings from "../../localization/strings";
import { Exhibition, ExhibitionRoom } from "../../generated/client";
import { connect } from "react-redux";
import { ReduxState, ReduxActions } from "../../store";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  history: History;
  selectedExhibition?: Exhibition;
  selectedRoom?: ExhibitionRoom;
}

/**
 * Functional component for custom breadcrumbs
 * 
 * @param props component props
 */
const Breadcrumbs: React.FC<Props> = props => {
  return (
    <MaterialBreadcrumbs separator={ <ChevronRight /> }>
      {
        getBreadcrumbsData(props).map((breadcrumb, index, array) => {
          const isLastIndex = index >= array.length - 1;
          return renderBreadCrumb(breadcrumb, isLastIndex);
        })
      }
    </MaterialBreadcrumbs>
  );
}

/**
 * Renders single breadcrumb
 * @param breadcrumb breadcrumb data
 * @param isCurrentLocation is breadcrumb path current location path
 */
const renderBreadCrumb = (breadcrumb: BreadcrumbData, isCurrentLocation: boolean) => {
  return isCurrentLocation ? (
    <span>{ breadcrumb.name }</span>
  ) : (
    <Link component={ RouterLink } to={ breadcrumb.url }>
      { breadcrumb.name }
    </Link>
  );
}

/**
 * Gets breadcrumbs data from current path
 * 
 * @param props component props
 * @returns breadcrumbs data as array
 */
const getBreadcrumbsData = (props: Props): BreadcrumbData[] => {
  const { history, selectedExhibition, selectedRoom } = props;
  const pathname = history.location.pathname;
  const pathParts = pathname.split('/').filter(val => !!val);
  const breadcrumbs: BreadcrumbData[] = [];

  /**
   * TODO:
   * Remove this when v4 prefix can be removed from route
   */
  if (!pathParts.find(part => part === "v4")) {
    return [];
  }

  if (!!pathParts.find(part => part === "exhibitions") && selectedExhibition) {
    breadcrumbs.push(
      { name: strings.exhibitions.listTitle, url: "/v4/exhibitions" },
      { name: selectedExhibition.name, url: `/v4/exhibitions/${selectedExhibition.id}` }
    );

    if (!!pathParts.find(part => part === "rooms") && selectedRoom) {
      breadcrumbs.push({
        name: selectedRoom.name,
        url: `/v4/exhibitions/${selectedExhibition.id}/rooms/${selectedRoom.id}`
      });
    }
  }

  return breadcrumbs;
}


/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    selectedExhibition: state.exhibitions.selectedExhibition,
    selectedRoom: state.exhibitions.selectedRoom
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: React.Dispatch<ReduxActions>) {
  return {
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Breadcrumbs));