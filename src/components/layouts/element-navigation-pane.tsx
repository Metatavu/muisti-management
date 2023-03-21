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
  children: React.ReactNode;
}

/**
 * Component for element navigation pane
 *
 * @param props component properties
 */
const ElementNavigationPane: React.FC<Props> = ({
  children,
  classes,
  title,
  width,
  actionButtonIcon,
  actionButtonTitle,
  actionButtonClick
}) => {
  return (
    <Box
      className={ classes.root }
      style={{ width: width ?? 400 }}
    >
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

export default withStyles(styles)(ElementNavigationPane);
