import * as React from "react";

import { WithStyles, withStyles, IconButton } from "@material-ui/core";
import styles from "../../styles/view-selection-bar";
import ExhibitionIcon from "../../resources/gfx/svg-paths/exhibition-icon";
import ExhibitionLocationIcon from "../../resources/gfx/svg-paths/exhibition-location-icon";
import ExhibitionPointIcon from "../../resources/gfx/svg-paths/exhibition-point-icon";
import { Link as RouterLink } from 'react-router-dom';

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  exhibitionId: string,
  locationPath: string
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for view selection bar
 */
class ViewSelectionBar extends React.Component<Props, State> {

  /**
   * Constructor
   * 
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false
    };
  }

  /**
   * Component did mount life-cycle handler
   */
  public componentDidMount = () => {

  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, locationPath } = this.props;

    return (
      <div className={ classes.root }>
        <div className={ classes.buttonGroup }>
          <IconButton component={ RouterLink } to={ `/exhibitions/${ this.props.exhibitionId }` }>
            <ExhibitionIcon selected={ locationPath === `/exhibitions/${ this.props.exhibitionId }` }/>
          </IconButton>
          <IconButton component={ RouterLink } to={`/exhibitions/${ this.props.exhibitionId }/room`}>
            <ExhibitionLocationIcon  selected={ locationPath === `/exhibitions/${ this.props.exhibitionId }/room` }/>
          </IconButton>
          <IconButton component={ RouterLink } to={`/exhibitions/${ this.props.exhibitionId }/deviceGroup`}>
            <ExhibitionPointIcon selected={ locationPath === `/exhibitions/${ this.props.exhibitionId }/deviceGroup` }/>
          </IconButton>
          <IconButton component={ RouterLink } to={`/exhibitions/${ this.props.exhibitionId }/settings`}>
            <ExhibitionPointIcon selected={ locationPath === `/exhibitions/${ this.props.exhibitionId }/settings` }/>
          </IconButton>
        </div>
        { this.props.children }
      </div>
    );
  }
}

export default withStyles(styles)(ViewSelectionBar);