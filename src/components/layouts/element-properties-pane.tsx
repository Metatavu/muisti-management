import * as React from "react";

import { Typography, IconButton } from "@mui/material";
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import styles from "../../styles/element-properties-pane";
import classNames from "classnames";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Panel title (optional)
   */
  title?: string;
  /**
   * Set panel open/closed
   */
  open?: boolean;
  /**
   * Handler for on close click
   */
  onCloseClick?: () => void;
  children: React.ReactNode;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for element properties pane
 */
class ElementPropertiesPane extends React.Component<Props, State> {

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const {
      classes,
      title,
      open,
      children,
      onCloseClick
    } = this.props;

    return (
      <div className={ classes.root } style={{ width: open ? 400 : 0 }}>
        <div className={ classNames( classes.container, this.props.open ? "" : "closed" ) }>
          { title &&
            <div className={ classes.header }>
              <Typography variant="h3">{ title }</Typography>
              { onCloseClick &&
                <IconButton onClick={ () => onCloseClick() } size="large">
                  <ChevronRightIcon />
                </IconButton>
              }
            </div>
          }
          <div className={ classes.content }>
            { children }
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ElementPropertiesPane);