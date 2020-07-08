import * as React from "react";
import strings from "../../localization/strings";
// tslint:disable-next-line: max-line-length
import { WithStyles, withStyles, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, Checkbox, Table, TableContainer, TableHead, TableRow, TableCell, TableSortLabel, TableBody, Toolbar, Avatar } from "@material-ui/core";
import styles from "../../styles/components/right-panel-editors/media-library";
import theme from "../../styles/theme";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FolderIcon from "@material-ui/icons/Folder";
import AddIcon from "@material-ui/icons/Add";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  mediaType: MediaType;
  currentUrl: string;
  onUrlChange: (newUrl: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

export enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
  MEDIA = "media"
}

/**
 * Component for media library
 */
const MediaLibrary = withStyles(styles)(class MediaLibrary extends React.Component<Props, State> {

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
   * Component render method
   */
  public render() {
    const { classes } = this.props;
    return (
      <div className={ classes.root }>
        <Accordion>
          <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
            <Typography variant="h3">{ strings.mediaLibrary.title }</Typography>
            <IconButton size="small" title="Add media" onClick={ (event) => event.stopPropagation() } onFocus={ (event) => event.stopPropagation() }>
              <AddIcon />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            {/* Single folder item */}
            <Accordion>
              <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
                <div className={ classes.folder }>
                  <FolderIcon fontSize="small" />
                  <Typography style={{ marginLeft: theme.spacing(1) }} variant="h5">{ "Folder name" }</Typography>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="left" padding="default">
                          <TableSortLabel direction="asc">
                            { "Nimi" }
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="left" padding="none">
                          <TableSortLabel direction="asc">
                            { "Muokattu" }
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="left" padding="none">
                          <TableSortLabel direction="asc">
                            { "Tyyppi" }
                          </TableSortLabel>
                        </TableCell>
                        <TableCell padding="checkbox">
                          <Checkbox/>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>

                      { /* Single row item */}
                      <TableRow>
                        <TableCell component="th" scope="row" padding="default">
                          { "kuvituskuva_1" }
                        </TableCell>
                        <TableCell align="left" padding="none">
                          { "2.7.2020 12:34" }
                        </TableCell>
                        <TableCell align="left" padding="none">
                          { ".PNG" }
                        </TableCell>
                        <TableCell padding="checkbox">
                          <Checkbox />
                        </TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </TableContainer>
                <Toolbar variant="dense">
                  <Typography variant="body1">x { strings.mediaLibrary.selected }</Typography>
                </Toolbar>
              </AccordionDetails>
            </Accordion>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }
});

export default MediaLibrary;