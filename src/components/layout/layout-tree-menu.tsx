import { PageLayoutView, SubLayout } from "../../generated/client";
import { PageLayoutWidgetType } from "../../generated/client/models/PageLayoutWidgetType";
import strings from "../../localization/strings";
import SearchIcon from "../../resources/gfx/svg-paths/hae";
import styles from "../../styles/exhibition-tree-menu";
import theme from "../../styles/theme";
import GenericDialog from "../generic/generic-dialog";
import { getInitializedPageLayoutViewByWidgetType } from "./utils/tree-data-utils";
import AddIcon from "@mui/icons-material/AddCircle";
import ExpandMoreIcon from "@mui/icons-material/ArrowDropDown";
import ChevronRightIcon from "@mui/icons-material/ArrowRight";
import {
  Box,
  Divider,
  FilledInput,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import classNames from "classnames";
import * as React from "react";
import TreeMenu, { TreeMenuItem, TreeNodeInArray } from "react-simple-tree-menu";
import { v4 as uuid } from "uuid";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  editingSubLayout: boolean;
  subLayouts: SubLayout[];
  treeData: TreeNodeInArray[];
  onSelect: (element: PageLayoutView, type: PageLayoutWidgetType, path: string) => void;
  onAdd: (pageLayoutView: PageLayoutView, path: string) => void;
}

/**
 * Interface representing component state
 */
interface State {
  addPropertyDialogOpen: boolean;
  newPageLayoutViewPath?: string;
  newPageLayoutView?: PageLayoutView;
  selectedSubLayoutId?: string;
}

/**
 * Component for exhibition tree menu
 */
class LayoutTreeMenu extends React.Component<Props, State> {
  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      addPropertyDialogOpen: false
    };
  }

  /**
   * Render basic layout
   */
  public render() {
    const { classes, treeData } = this.props;

    return (
      <>
        <div className={classes.treeView}>
          <TreeMenu
            data={treeData}
            onClickItem={({ key, label, ...props }) => {
              props.onSelect(props.element, props.type, props.path);
            }}
          >
            {({ search, items }) => (
              <>
                <FilledInput
                  onChange={(e) => search && search(e.target.value)}
                  placeholder={strings.exhibition.navigation.search}
                  className={classes.searchBar}
                  fullWidth
                  endAdornment={
                    <InputAdornment position="end">
                      <SearchIcon />
                    </InputAdornment>
                  }
                />
                <List>{items.map((item) => this.renderTreeMenuItem(item))}</List>
              </>
            )}
          </TreeMenu>
        </div>
        <GenericDialog
          cancelButtonText={strings.layoutEditor.addLayoutViewDialog.cancel}
          positiveButtonText={strings.layoutEditor.addLayoutViewDialog.confirm}
          title={strings.layoutEditor.addLayoutViewDialog.title}
          error={false}
          onConfirm={this.onConfirmClick}
          onCancel={this.onCloseOrCancelClick}
          open={this.state.addPropertyDialogOpen}
          onClose={this.onCloseOrCancelClick}
        >
          {this.renderDialogContent()}
        </GenericDialog>
      </>
    );
  }

  /**
   * Renders tree menu item
   *
   * @param item tree menu item
   */
  private renderTreeMenuItem = ({
    level,
    focused,
    hasNodes,
    toggleNode,
    isOpen,
    label,
    name,
    path,
    active,
    ...otherProps
  }: TreeMenuItem) => {
    const { classes } = this.props;
    const toggleIcon = (on: boolean) =>
      on ? (
        <ExpandMoreIcon htmlColor={focused ? "#fff" : "#888"} />
      ) : (
        <ChevronRightIcon htmlColor={focused ? "#fff" : "#888"} />
      );
    return (
      <ListItem
        {...otherProps}
        className={classNames(classes.listItem, focused ? "focused" : "")}
        style={{ paddingLeft: level * 10 }}
      >
        {hasNodes ? (
          <div style={{ display: "inline-block" }} onClick={this.onNodeClick(hasNodes, toggleNode)}>
            {toggleIcon(isOpen)}
          </div>
        ) : (
          <div style={{ display: "inline-block", marginLeft: 25 }} />
        )}
        <ListItemText primary={name} secondary={label} />
        <ListItemSecondaryAction>
          <IconButton
            size="small"
            edge="end"
            aria-label="add"
            onClick={() => this.onLayoutViewPropertyAddClick(path)}
          >
            <AddIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  /**
   * Render dialog content based on editingSubLayout boolean
   */
  private renderDialogContent = () => {
    const { editingSubLayout } = this.props;

    if (editingSubLayout) {
      return this.renderSubLayoutDialog();
    } else {
      return this.renderLayoutDialog();
    }
  };

  /**
   * Render layout view dialog
   */
  private renderLayoutDialog = () => {
    const { subLayouts } = this.props;
    const { newPageLayoutView, selectedSubLayoutId } = this.state;

    const subLayoutItems = subLayouts.map((layout) => {
      return (
        <MenuItem key={layout.id} value={layout.id}>
          {layout.name}
        </MenuItem>
      );
    });

    const widgetItems = Object.keys(PageLayoutWidgetType).map((widget) => {
      return (
        <MenuItem key={widget} value={widget}>
          {widget}
        </MenuItem>
      );
    });

    return (
      <Grid container spacing={2} style={{ marginBottom: theme.spacing(1) }}>
        <Grid item xs={12}>
          <FormControl variant="outlined">
            <InputLabel id="widget" style={{ marginBottom: theme.spacing(2) }}>
              {strings.layoutEditor.addLayoutViewDialog.widget}
            </InputLabel>
            <Select
              labelId="widget"
              label={strings.layoutEditor.addLayoutViewDialog.widget}
              name="widget"
              value={!selectedSubLayoutId && newPageLayoutView ? newPageLayoutView.widget : ""}
              onChange={this.onWidgetChange}
            >
              {widgetItems}
            </Select>
            <FormHelperText>{this.helpTextBySelectedWidget()}</FormHelperText>
          </FormControl>
        </Grid>
        <div style={{ display: "flex", flex: 1, justifyContent: "center" }}>
          <Typography variant="h6">{strings.layoutEditor.addLayoutViewDialog.or}</Typography>
        </div>
        <Grid item xs={12}>
          <FormControl variant="outlined">
            <InputLabel id="subLayout" style={{ marginBottom: theme.spacing(2) }}>
              {strings.layoutEditor.addLayoutViewDialog.subLayout}
            </InputLabel>
            <Select
              labelId="subLayout"
              label={strings.layoutEditor.addLayoutViewDialog.subLayout}
              name="subLayout"
              value={selectedSubLayoutId && newPageLayoutView ? selectedSubLayoutId : ""}
              onChange={this.onSubLayoutChange}
            >
              {subLayoutItems}
            </Select>
          </FormControl>
          <Box mt={2}>
            <TextField
              helperText={strings.helpTexts.layoutEditor.giveElementName}
              style={{ marginTop: theme.spacing(2) }}
              label={strings.layoutEditor.addLayoutViewDialog.name}
              type="text"
              name="name"
              disabled={newPageLayoutView ? false : true}
              value={newPageLayoutView ? newPageLayoutView.name : ""}
              onChange={this.onNameChange}
            />
          </Box>
        </Grid>
      </Grid>
    );
  };

  /**
   * Render help text according to selected widget
   */
  private helpTextBySelectedWidget = (): string => {
    const { newPageLayoutView } = this.state;

    if (!newPageLayoutView) {
      return "";
    }

    switch (newPageLayoutView.widget) {
      case PageLayoutWidgetType.Button:
        return strings.helpTexts.layoutEditor.buttonDescription;
      case PageLayoutWidgetType.TextView:
        return strings.helpTexts.layoutEditor.textViewDescription;
      case PageLayoutWidgetType.FlowTextView:
        return strings.helpTexts.layoutEditor.flowTextViewDescription;
      case PageLayoutWidgetType.ImageView:
        return strings.helpTexts.layoutEditor.imageViewDescription;
      case PageLayoutWidgetType.MediaView:
        return strings.helpTexts.layoutEditor.mediaViewDescription;
      case PageLayoutWidgetType.PlayerView:
        return strings.helpTexts.layoutEditor.playerViewDescrption;
      case PageLayoutWidgetType.LinearLayout:
        return strings.helpTexts.layoutEditor.linearLayoutDescription;
      case PageLayoutWidgetType.RelativeLayout:
        return strings.helpTexts.layoutEditor.relativeLayoutDescription;
      case PageLayoutWidgetType.FrameLayout:
        return strings.helpTexts.layoutEditor.frameLayoutDescription;
      case PageLayoutWidgetType.MapView:
        return strings.helpTexts.layoutEditor.mapViewDescription;
      case PageLayoutWidgetType.MaterialTabLayout:
        return strings.helpTexts.layoutEditor.materialTabViewDescription;
      case PageLayoutWidgetType.VisitorsView:
        return strings.helpTexts.layoutEditor.visitorsViewDescription;
      case PageLayoutWidgetType.WebView:
        return strings.helpTexts.layoutEditor.webViewDescription;
      default:
        return "";
    }
  };

  /**
   * Render sub layout view dialog
   */
  private renderSubLayoutDialog = () => {
    const { newPageLayoutView } = this.state;

    const widgetItems = Object.keys(PageLayoutWidgetType).map((widget) => {
      return (
        <MenuItem key={widget} value={widget}>
          {widget}
        </MenuItem>
      );
    });

    return (
      <Grid container spacing={2} style={{ marginBottom: theme.spacing(1) }}>
        <Grid item xs={12}>
          <InputLabel id="widget" style={{ marginBottom: theme.spacing(2) }}>
            {strings.layoutEditor.addLayoutViewDialog.widget}
          </InputLabel>
          <Select
            variant="filled"
            labelId="widget"
            fullWidth
            name="widget"
            value={newPageLayoutView ? newPageLayoutView.widget : ""}
            onChange={this.onWidgetChange}
          >
            {widgetItems}
          </Select>
          <Divider
            variant="fullWidth"
            color="rgba(0,0,0,0.1)"
            style={{ marginTop: 19, width: "100%" }}
          />
        </Grid>
      </Grid>
    );
  };

  /**
   * Event handler for node click event
   *
   * @param hasNodes has nodes
   * @param toggleNode handler method for toggle node
   */
  private onNodeClick =
    (hasNodes: boolean, toggleNode: (() => void) | undefined) =>
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (hasNodes && toggleNode) {
        toggleNode();
      }
      event.stopPropagation();
    };

  /**
   * Event handler for layout view property add click
   *
   * @param path path to the parent element where the new child item will be added
   */
  private onLayoutViewPropertyAddClick = (path: string) => {
    this.setState({
      addPropertyDialogOpen: true,
      newPageLayoutViewPath: path
    });
  };

  /**
   * Event handler for dialog confirm click
   */
  private onConfirmClick = () => {
    const { newPageLayoutView, newPageLayoutViewPath } = this.state;
    if (!newPageLayoutView || !newPageLayoutViewPath) {
      return;
    }

    this.props.onAdd(newPageLayoutView, newPageLayoutViewPath);

    this.setState({
      addPropertyDialogOpen: false,
      newPageLayoutView: undefined,
      newPageLayoutViewPath: ""
    });
  };

  /**
   * Event handler for dialog close or cancel click
   */
  private onCloseOrCancelClick = () => {
    this.setState({
      addPropertyDialogOpen: false,
      newPageLayoutView: undefined,
      newPageLayoutViewPath: "",
      selectedSubLayoutId: undefined
    });
  };

  /**
   * Event handler for widget change event
   *
   * @param event React change event
   */
  private onWidgetChange = (event: SelectChangeEvent<string>) => {
    const widget = event.target.value as PageLayoutWidgetType;

    const pageLayoutView = getInitializedPageLayoutViewByWidgetType(widget);

    this.setState({
      newPageLayoutView: pageLayoutView,
      selectedSubLayoutId: undefined
    });
  };

  /**
   * On name change handler
   *
   * @param event react text field event
   */
  private onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { newPageLayoutView } = this.state;

    const key = event.target.name;
    const value = event.target.value;
    if (!newPageLayoutView || !key) {
      return;
    }

    this.setState({
      newPageLayoutView: { ...newPageLayoutView, [key]: value }
    });
  };

  /**
   * Event handler for sub layout change event
   *
   * @param event React change event
   */
  private onSubLayoutChange = (event: SelectChangeEvent<string>) => {
    const { subLayouts } = this.props;
    const subLayoutId = event.target.value;

    if (!subLayoutId) {
      return;
    }

    const subLayout = subLayouts.find((layout) => layout.id === subLayoutId);

    if (!subLayout) {
      return;
    }

    const pageLayoutView: PageLayoutView = {
      ...subLayout.data,
      id: uuid(),
      sublayoutId: subLayoutId
    };

    this.setState({
      newPageLayoutView: pageLayoutView,
      selectedSubLayoutId: subLayoutId
    });
  };
}

export default withStyles(styles)(LayoutTreeMenu);
