import * as React from "react";

import { WithStyles, withStyles, Typography, Box, IconButton } from "@material-ui/core";
import styles from "../../styles/element-navigation-pane";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  /**
   * Panel title (optional)
   */
  title?: string;
  /**
   * Panel width (optional)
   *
   * default: 400px
   */
  width?: number;
  actionButtonIcon?: JSX.Element;
  actionButtonTitle?: string;
  actionButtonClick?: () => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for element navigation pane
 */
class ElementNavigationPane extends React.Component<Props, State> {

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
      width,
      children,
      actionButtonIcon,
      actionButtonTitle,
      actionButtonClick
    } = this.props;

    return (
      <Box className={ classes.root } style={{ width: width ?? 400 }}>
        <Box className={ classes.container }>
          { title && 
            <Box className={ classes.header }>
              <Typography variant="h3">
                { title }
              </Typography>
              { actionButtonClick &&
                <IconButton
                  color="primary"
                  title={ actionButtonTitle }
                  onClick={ actionButtonClick }
                >
                  { actionButtonIcon }
                </IconButton>
              }
            </Box>
          }
          <Box className={ classes.content }>
            { children }
          </Box>
        </Box>
      </Box>
    );
  }
}

export default withStyles(styles)(ElementNavigationPane);
