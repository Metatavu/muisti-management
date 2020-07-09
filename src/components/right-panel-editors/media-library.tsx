import * as React from "react";
import strings from "../../localization/strings";
// tslint:disable-next-line: max-line-length
import { WithStyles, withStyles, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, Checkbox, Table, TableContainer, TableHead, TableRow, TableCell, TableSortLabel, TableBody, Toolbar, Avatar } from "@material-ui/core";
import styles from "../../styles/components/right-panel-editors/media-library";
import theme from "../../styles/theme";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FolderIcon from "@material-ui/icons/Folder";
import RefreshIcon from "@material-ui/icons/Refresh";
import PostAddIcon from '@material-ui/icons/PostAdd';
import AddIcon from "@material-ui/icons/Add";
import { AccessToken } from "../../types";
import Api from "../../api/api";
import { StoredFile } from "../../generated/client";
import FileUploader from "../generic/file-uploader";
import FileUpload from "../../utils/file-upload";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  mediaType: MediaType;
  currentUrl: string;
  onUrlChange: (newUrl: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
  loading: boolean;
  folders: StoredFile[];
  files?: StoredFile[];
  openFolders: Map<string, StoredFile[]>;
  uploadOpen: boolean;
  selectedUploadFolder?: StoredFile;
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
      loading: false,
      folders: [],
      openFolders: new Map(),
      uploadOpen: false
    };
  }

  public componentDidMount = () => {
    this.getRootMedia();
  }

  /**
   * Component render method
   */
  public render() {
    const { classes } = this.props;

    const folders = this.constructFolders();

    return (
      <div className={ classes.root }>
        <Accordion>
          <AccordionSummary expandIcon={ <ExpandMoreIcon /> }>
            <Typography variant="h3">{ strings.mediaLibrary.title }</Typography>
            {/* TODO: Needs API support */}
            {/* <IconButton size="small" title="Add media" onClick={ this.onFolderAddClick() } onFocus={ event => event.stopPropagation() }>
              <AddIcon />
            </IconButton> */}
          </AccordionSummary>
          <AccordionDetails>
            { folders }
          </AccordionDetails>
        </Accordion>
        { this.renderUploadDialog() }
      </div>
    );
  }

  private constructFolders = () => {
    const { classes } = this.props;
    const { folders } = this.state;

    return folders.map(folder => {
      return (
        <Accordion onClick={ this.onFolderClick(folder) }>
          <AccordionSummary expandIcon={ <ExpandMoreIcon/> }>
            <div className={ classes.folder }>
              <FolderIcon fontSize="small" />
              <Typography style={{ marginLeft: theme.spacing(1) }} variant="h5">{ folder.fileName }</Typography>
              <RefreshIcon onClick={ this.onRefreshFolderClick(folder) }/>
              <PostAddIcon onClick={ this.openDialog(folder) }/>
            </div>
          </AccordionSummary>
          { this.constructFiles(folder) }
        </Accordion>
      );
    });
  }

  private constructFiles = (folder: StoredFile) => {
    const { openFolders } = this.state;

    if (!openFolders.has(folder.uri)) {
      return null;
    }

    const files = openFolders.get(folder.uri);

    if (!files) {
      return null;
    }

    const filteredFiles = files.filter(file => (file.contentType !== "inode/directory" && file.contentType !== "application/x-directory"));

    const fileItems = filteredFiles.map(file => {
      const displayName = file.fileName.includes(folder.fileName) ? file.fileName.split(`${folder.fileName}/`)[1] : file.fileName;
      return(
        <TableRow onClick={ this.onFileClick(file) }>
          <TableCell component="th" scope="row" padding="default">
            { displayName }
          </TableCell>
          <TableCell align="left" padding="default">
            { file.contentType }
          </TableCell>
          {/* TODO: Add support for image carousel */}
          {/* <TableCell padding="checkbox">
            <Checkbox />
          </TableCell> */}
        </TableRow>
      );
    });

    return(
      <AccordionDetails>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="left" padding="default">
                  <TableSortLabel direction="asc">
                    { strings.mediaLibrary.files.name }
                  </TableSortLabel>
                </TableCell>
                <TableCell align="left" padding="default">
                  <TableSortLabel direction="asc">
                    { strings.mediaLibrary.files.type }
                  </TableSortLabel>
                </TableCell>
                {/* TODO: Add support for image carousel */}
                {/* <TableCell padding="checkbox">
                  <Checkbox/>
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              { fileItems }
            </TableBody>
          </Table>
        </TableContainer>
        <Toolbar variant="dense">
          <Typography variant="body1">x { strings.mediaLibrary.selected }</Typography>
        </Toolbar>
      </AccordionDetails>
    );
  }

  private renderUploadDialog = () => {
    const { uploadOpen } = this.state;
    return(
      <FileUploader
        controlled
        open={ uploadOpen }
        onClose={ this.closeDialog }
        buttonText={ strings.mediaLibrary.addMedia }
        allowedFileTypes={ [] }
        onSave={ this.onUploadSave }
      />
    );
  }

  private onFolderClick = (folder: StoredFile) => async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { openFolders } = this.state;
    if (openFolders.has(folder.uri)) {
      return;
    }

    this.fetchFolderData(folder.uri);

  }

  private onRefreshFolderClick = (folder: StoredFile) => async (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event.stopPropagation();
    this.fetchFolderData(folder.uri);
  }

  private onFileClick = (file: StoredFile) => (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    console.log(file);
    this.props.onUrlChange(file.uri);
  }

  /**
   * Toggle upload new image dialog
   */
  private openDialog = (folder: StoredFile) => () => {
    this.setState({
      uploadOpen: true,
      selectedUploadFolder: folder
    });
  }

  /**
   * Toggle upload new image dialog
   */
  private closeDialog = () => {
    this.setState({
      uploadOpen: false,
    });
  }

  /**
   * Event handler for upload save click
   *
   * @param files files
   * @param key upload key
   */
  private onUploadSave = async (files: File[], _key?: string) => {
    const { selectedUploadFolder } = this.state;

    if (!selectedUploadFolder) {
      return;
    }

    const file = files[0];
    if (file) {

      const uploadedFile = await FileUpload.uploadFile(file, `${selectedUploadFolder.fileName}`);

      this.setState({
        uploadOpen: false
      });
    }
  }

  private fetchFolderData = async (folderUri: string) => {
    const { accessToken } = this.props;
    const { openFolders } = this.state;

    const mediaApi = Api.getStoredFilesApi(accessToken);

    const files = await mediaApi.listStoredFiles({
      folder: folderUri.split("staging-muisti-cdn.metatavu.io")[1]
    });

    const tempMap = new Map(openFolders);
    tempMap.set(folderUri, files);

    this.setState({
      openFolders: tempMap
    });
  }

  /**
   * Load media folders from API/S3
   */
  private getRootMedia = async () => {
    const { accessToken } = this.props;
    const mediaApi = Api.getStoredFilesApi(accessToken);
    const folders = await mediaApi.listStoredFiles({
      folder: "/"
    });

    const filteredFolders = folders.filter(folder => folder.fileName !== "");

    this.setState({
      folders: filteredFolders
    });
  }
});

export default MediaLibrary;