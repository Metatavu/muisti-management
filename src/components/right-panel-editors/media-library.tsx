import strings from "../../localization/strings";
import styles from "../../styles/components/right-panel-editors/media-library";
import theme from "../../styles/theme";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

import Api from "../../api/api";
import { Config } from "../../constants/configuration";
import { ExhibitionPageResource, StoredFile } from "../../generated/client";
import { AccessToken, MediaType } from "../../types";
import FileUpload from "../../utils/file-upload";
import FileUploader from "../generic/file-uploader";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOpenIcon from "@mui/icons-material/FolderOpenOutlined";
import FolderClosedIcon from "@mui/icons-material/FolderOutlined";
import PostAddIcon from "@mui/icons-material/PostAdd";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  mediaType: MediaType;
  currentUrl?: string;
  resource?: ExhibitionPageResource;
  startsOpen?: boolean;
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
  expanded: boolean;
}

/**
 * Component for media library
 */
const MediaLibrary = withStyles(styles)(
  class MediaLibrary extends React.Component<Props, State> {
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
        uploadOpen: false,
        expanded: props.startsOpen ?? false
      };
    }

    /**
     * Component did mount life cycle handler
     */
    public componentDidMount = () => {
      this.getRootMedia();
    };

    /**
     * Component render method
     */
    public render() {
      const { classes } = this.props;
      const { expanded } = this.state;

      const folders = this.constructFolders();

      return (
        <div className={classes.root}>
          <Accordion expanded={expanded}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              onClick={() => this.setState({ expanded: !expanded })}
            >
              <Typography variant="h3">{strings.mediaLibrary.title}</Typography>
              {/* TODO: Needs API support creating new folders */}
              {/* <IconButton size="small" title="Add media" onClick={ this.onFolderAddClick() } onFocus={ event => event.stopPropagation() }>
              <AddIcon />
            </IconButton> */}
            </AccordionSummary>
            <AccordionDetails>{folders}</AccordionDetails>
          </Accordion>
          {this.renderUploadDialog()}
        </div>
      );
    }

    /**
     * Construct folder structure
     */
    private constructFolders = () => {
      const { classes } = this.props;
      const { folders, openFolders } = this.state;

      return folders.map((folder) => {
        const folderOpen = openFolders.has(folder.uri);
        // TODO: Make this into a component which would handle it's own state -> can have individual loaders while fetching content
        return (
          <Accordion key={folder.uri} onClick={this.onFolderClick(folder)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div className={classes.folder}>
                {folderOpen ? (
                  <FolderOpenIcon fontSize="small" />
                ) : (
                  <FolderClosedIcon fontSize="small" />
                )}
                <Typography style={{ marginLeft: theme.spacing(1) }} variant="h5">
                  {folder.fileName}
                </Typography>
                <Button
                  title={strings.generic.refresh}
                  className={classes.refreshButton}
                  onClick={this.onRefreshFolderClick(folder)}
                >
                  <RefreshIcon />
                </Button>
                <Button
                  title={strings.mediaLibrary.addFile}
                  className={classes.addButton}
                  onClick={this.openDialog(folder)}
                >
                  <PostAddIcon />
                </Button>
              </div>
            </AccordionSummary>
            {this.renderFiles(folder)}
          </Accordion>
        );
      });
    };

    /**
     * Renders files under given folder
     *
     * @param folder folder to process
     */
    private renderFiles = (folder: StoredFile) => {
      const { openFolders } = this.state;

      if (!openFolders.has(folder.uri)) {
        return null;
      }

      const files = openFolders.get(folder.uri);

      if (!files) {
        return null;
      }

      const fileItems = this.getFileItems(files, folder);

      return (
        <AccordionDetails>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="left" padding="normal">
                    <TableSortLabel direction="asc">
                      {strings.mediaLibrary.files.name}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="left" padding="normal">
                    <TableSortLabel direction="asc">
                      {strings.mediaLibrary.files.type}
                    </TableSortLabel>
                  </TableCell>
                  {/* TODO: Add support for image carousel */}
                  {/* <TableCell padding="checkbox">
                  <Checkbox/>
                </TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>{fileItems}</TableBody>
            </Table>
          </TableContainer>
          {/* TODO: Add support for image carousel */}
          {/* <Toolbar variant="dense">
          <Typography variant="body1">x { strings.mediaLibrary.selected }</Typography>
        </Toolbar> */}
        </AccordionDetails>
      );
    };

    /**
     * Get all file items
     *
     * @param filteredFiles filtered list of files
     * @param folder folder where files are
     */
    private getFileItems = (filteredFiles: StoredFile[], folder: StoredFile) => {
      const { currentUrl, resource } = this.props;

      return filteredFiles.map((file) => {
        const displayName = file.fileName.includes(folder.fileName)
          ? file.fileName.split(`${folder.fileName}/`)[1]
          : file.fileName;
        const selected = decodeURI(currentUrl ?? resource!.data ?? "") === file.uri;

        return (
          <TableRow
            key={file.uri}
            onClick={this.onFileClick(file)}
            hover={true}
            selected={selected}
          >
            <TableCell component="th" scope="row" padding="normal">
              {displayName}
            </TableCell>
            <TableCell align="left" padding="normal">
              {file.contentType}
            </TableCell>
            {/* TODO: Add support for image carousel */}
            {/* <TableCell padding="checkbox">
            <Checkbox />
          </TableCell> */}
          </TableRow>
        );
      });
    };

    /**
     * Render upload dialog
     */
    private renderUploadDialog = () => {
      const { uploadOpen } = this.state;

      return (
        <FileUploader
          controlled
          filesLimit={1000}
          maxFileSize={1073741824}
          open={uploadOpen}
          onClose={this.closeDialog}
          buttonText={strings.mediaLibrary.addMedia}
          allowedFileTypes={[]}
          onSave={this.onUploadSave}
        />
      );
    };

    /**
     * On folder click handler
     *
     * @param folder clicked folder
     */
    private onFolderClick = (folder: StoredFile) => () => {
      const { openFolders } = this.state;
      if (openFolders.has(folder.uri)) {
        return;
      }

      this.fetchFolderData(folder.uri);
    };

    /**
     * On refresh folder click handler
     *
     * @param folder clicked folder
     */
    private onRefreshFolderClick =
      (folder: StoredFile) => async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        this.fetchFolderData(folder.uri);
      };

    /**
     * On file click handler
     *
     * @param file clicked file
     */
    private onFileClick = (file: StoredFile) => () => {
      this.props.onUrlChange(file.uri);
    };

    /**
     * Open upload dialog
     *
     * @param folder folder where new image will be stored
     */
    private openDialog =
      (folder: StoredFile) => (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        this.setState({
          uploadOpen: true,
          selectedUploadFolder: folder
        });
      };

    /**
     * Close upload dialog
     */
    private closeDialog = () => {
      this.setState({
        uploadOpen: false
      });
    };

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

      await Promise.all(
        files.map(async (file) => {
          const presignedPostResponse = await FileUpload.getPresignedPostData(
            selectedUploadFolder.fileName,
            file
          );
          if (presignedPostResponse.error) {
            throw new Error(
              presignedPostResponse.message || "Error when creating presigned post request"
            );
          }

          await FileUpload.uploadFileToS3(presignedPostResponse.data, file);
        })
      );

      this.fetchFolderData(selectedUploadFolder.uri);
      this.setState({
        uploadOpen: false
      });
    };

    /**
     * Fetch file data from given folder path
     *
     * @param folderUri path to folder
     */
    private fetchFolderData = async (folderUri: string) => {
      const { accessToken } = this.props;
      const { openFolders } = this.state;

      const mediaApi = Api.getStoredFilesApi(accessToken);

      const files = await mediaApi.listStoredFiles({
        folder: folderUri.split(Config.getConfig().cdnBasePath)[1]
      });

      const tempMap = new Map(openFolders);
      tempMap.set(folderUri, files);

      this.setState({
        openFolders: tempMap
      });
    };

    /**
     * Load media folders from API/S3
     */
    private getRootMedia = async () => {
      const { accessToken } = this.props;
      const mediaApi = Api.getStoredFilesApi(accessToken);
      const folders = await mediaApi.listStoredFiles({
        folder: "/"
      });

      const filteredFolders = folders.filter((folder) => folder.fileName !== "");

      this.setState({
        folders: filteredFolders
      });
    };
  }
);

export default MediaLibrary;
