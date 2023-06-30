import { ExhibitionPageResourceType } from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/exhibition-view";
// TODO: Code mirror related imports.
// import "codemirror/lib/codemirror.css";
// import "codemirror/theme/material.css";
// import "codemirror/mode/javascript/javascript";
// import "codemirror/addon/lint/lint.css";
// import "codemirror/addon/lint/lint";
import theme from "../../styles/theme";
import { AccessToken } from "../../types";
import GenericUtils from "../../utils/generic-utils";
import ResourceUtils from "../../utils/resource-utils";
import GenericDialog from "../generic/generic-dialog";
import MediaLibrary from "../right-panel-editors/media-library";
import { ExhibitionPageTab, ExhibitionPageTabResource } from "./constants";
import { Button, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import CKEditor from "ckeditor4-react";
import * as React from "react";

(CKEditor as any).editorUrl = "/ckeditor/ckeditor.js";

/**
 * Component props
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  selectedTab: ExhibitionPageTab;
  onSave: (updatedTab: ExhibitionPageTab) => void;
}

/**
 * Component state
 */
interface State {
  error?: Error;
  loading: boolean;
  selectedResourceType?: ExhibitionPageResourceType;
  showCKEditorModal: boolean;
}

/**
 * Component for tab editor
 */
class TabEditor extends React.Component<Props, State> {
  /**
   * CKEditor configurations
   */
  private CKEditorConfig = {
    toolbar: [
      { name: "document", items: ["Source", "DocProps"] },
      { name: "clipboard", items: ["Undo", "Redo"] },
      {
        name: "forms",
        items: [
          "Form",
          "Checkbox",
          "Radio",
          "TextField",
          "Textarea",
          "Select",
          "Button",
          "ImageButton",
          "HiddenField"
        ]
      },
      { name: "basicstyles", items: ["Bold", "Italic", "Underline"] },
      {
        name: "paragraph",
        items: [
          "NumberedList",
          "BulletedList",
          "-",
          "Outdent",
          "Indent",
          "-",
          "Blockquote",
          "CreateDiv",
          "-",
          "JustifyLeft",
          "JustifyCenter",
          "JustifyRight",
          "JustifyBlock",
          "-",
          "BidiLtr",
          "BidiRtl",
          "Language"
        ]
      },
      { name: "insert", items: ["Table", "SpecialChar", "PageBreak"] },
      { name: "styles", items: ["Styles", "Format"] },
      { name: "colors", items: ["TextColor", "BGColor"] },
      { name: "tools", items: ["Maximize", "ShowBlocks"] }
    ],
    fullPage: true,
    allowedContent: true
  };

  /**
   * Constructor
   *
   * @param props component properties
   */
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      showCKEditorModal: false
    };
  }

  /**
   * Component did mount life cycle method
   */
  public componentDidMount = () => {
    const { selectedTab } = this.props;

    if (selectedTab.resources[0]) {
      this.setState({
        selectedResourceType: selectedTab.resources[0].type
      });
    }
  };

  /**
   * Component did update life cycle method
   */
  public componentDidUpdate = (prevProps: Props) => {
    const { selectedTab } = this.props;

    if (prevProps.selectedTab !== selectedTab) {
      if (selectedTab.resources[0]) {
        this.setState({
          selectedResourceType: selectedTab.resources[0].type
        });
      }
    }
  };

  /**
   * Component render method
   */
  public render() {
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        {this.renderTabLabel()}
        {this.renderTabResources()}
        {this.renderModifyButton()}
      </div>
    );
  }

  /**
   * Render tab label
   */
  private renderTabLabel = () => {
    const { selectedTab, classes } = this.props;
    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <TextField
          label={strings.contentEditor.editor.tabs.label}
          name="name"
          className={classes.textResourceEditor}
          value={selectedTab?.label ?? ""}
          onChange={this.onLabelChange}
        />
      </div>
    );
  };

  /**
   * Render tab resources
   */
  private renderTabResources = () => {
    const resourceSelectItems = this.getResourceSelectOptions();
    const resourceItems = this.getResourceItems();

    return (
      <div style={{ marginTop: theme.spacing(2) }}>
        <Typography variant="h6">{strings.contentEditor.editor.tabs.contentType}</Typography>
        {resourceSelectItems}
        <div key={"resourceContainer"}>{resourceItems}</div>
      </div>
    );
  };

  /**
   * Render modify button
   */
  private renderModifyButton = () => {
    const { selectedResourceType, showCKEditorModal } = this.state;
    if (!selectedResourceType || selectedResourceType !== ExhibitionPageResourceType.Html) {
      return null;
    }

    return (
      <GenericDialog
        open={showCKEditorModal}
        error={false}
        title={strings.contentEditor.editor.tabs.edit}
        onClose={this.onEditModalClose}
        onCancel={this.onEditModalClose}
        onConfirm={this.onEditModalClose}
        positiveButtonText={strings.errorDialog.close}
        fullScreen={true}
        disableEnforceFocus={true}
      >
        {this.renderDialogContent()}
      </GenericDialog>
    );
  };

  /**
   * Render dialog content
   */
  private renderDialogContent = () => {
    const { selectedTab } = this.props;
    const { resources } = selectedTab;

    if (!resources[0]) {
      return null;
    }

    return (
      <CKEditor
        data={resources[0].data}
        config={this.CKEditorConfig}
        onChange={this.onCKEditorChange}
        type="classic"
        readOnly={false}
      />
    );
  };

  /**
   * Get resource select options
   */
  private getResourceSelectOptions = () => {
    const { selectedTab } = this.props;

    const values = GenericUtils.enumValues(ExhibitionPageResourceType);
    const keys = GenericUtils.enumKeys(ExhibitionPageResourceType);

    const items = keys.map((key, index) => {
      return (
        <MenuItem key={key} value={values[index] as ExhibitionPageResourceType[]}>
          {key}
        </MenuItem>
      );
    });

    const currentValue = selectedTab.resources ? selectedTab.resources[0] : undefined;

    return (
      <Select
        fullWidth
        onChange={this.handleSelectChange}
        name="type"
        value={currentValue?.type || ""}
      >
        {items}
      </Select>
    );
  };

  /**
   * Get resource items
   */
  private getResourceItems = () => {
    const { accessToken, selectedTab } = this.props;

    if (!selectedTab.resources) {
      return null;
    }

    return selectedTab.resources.map((resource) => {
      switch (resource.type) {
        case ExhibitionPageResourceType.Text:
          return (
            <div style={{ marginTop: theme.spacing(2) }}>
              <Typography variant="h6">
                {strings.contentEditor.editor.tabs.textContentHelp}
              </Typography>
              <TextField onChange={this.onDataChange} value={resource.data} />
            </div>
          );
        case ExhibitionPageResourceType.Image:
        case ExhibitionPageResourceType.Video:
        case ExhibitionPageResourceType.Svg:
          return (
            <MediaLibrary
              accessToken={accessToken}
              mediaType={ResourceUtils.getResourceMediaType(resource.type)!}
              resource={resource}
              onUrlChange={this.onMediaUrlChange}
            />
          );
        case ExhibitionPageResourceType.Html:
          return (
            <Button
              color="primary"
              style={{ marginTop: theme.spacing(2) }}
              variant="contained"
              onClick={this.openEditModalClick}
            >
              {strings.contentEditor.editor.tabs.edit}
            </Button>
          );
        default:
          return null;
      }
    });
  };

  /**
   * Event handler for tab label change
   *
   * @param event react change event
   */
  private onLabelChange = (
    event: React.ChangeEvent<HTMLInputElement | { name?: string; value: any }>
  ) => {
    const { onSave } = this.props;

    const tab: ExhibitionPageTab = { ...this.props.selectedTab };
    const key = event.target.name;
    const value = event.target.value as string;
    if (!key) {
      return;
    }

    tab.label = value;
    onSave(tab);
  };

  /**
   * Event handler for select change
   *
   * @param event change event
   */
  private handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { onSave } = this.props;

    const key = event.target.name;
    const value = event.target.value as ExhibitionPageResourceType;

    if (!key) {
      return;
    }

    const tabToUpdate = { ...this.props.selectedTab } as ExhibitionPageTab;

    if (!tabToUpdate.resources[0]) {
      const newResource: ExhibitionPageTabResource = {
        id: "src",
        data: "",
        type: value
      };
      tabToUpdate.resources.push(newResource);
    } else {
      tabToUpdate.resources[0].type = value;
      tabToUpdate.resources[0].data = "";
    }

    this.setState({
      selectedResourceType: value
    });

    onSave(tabToUpdate);
  };

  /**
   * Event handler for open edit modal click
   */
  private openEditModalClick = () => {
    this.setState({
      showCKEditorModal: true
    });
  };

  /**
   * Event handler for edit modal close
   */
  private onEditModalClose = () => {
    this.setState({
      showCKEditorModal: false
    });
  };

  /**
   * Event handler for CKEditor change
   *
   * @param event event
   * @param editor editor data
   */
  private onCKEditorChange = (event: any) => {
    const { onSave } = this.props;
    const data = event.editor.getData() as string;

    const tabToUpdate = { ...this.props.selectedTab } as ExhibitionPageTab;
    tabToUpdate.resources[0].data = data;
    onSave(tabToUpdate);
  };

  /**
   * Event handler for media library value change
   *
   * @param newUrl  new media url
   */
  private onMediaUrlChange = (newUrl: string) => {
    const { onSave } = this.props;

    const tabToUpdate = { ...this.props.selectedTab } as ExhibitionPageTab;
    tabToUpdate.resources[0].data = newUrl;
    onSave(tabToUpdate);
  };

  /**
   * Event handler for data change
   *
   * @param event react text field event
   */
  private onDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { onSave } = this.props;
    const value = event.target.value;
    const tabToUpdate = { ...this.props.selectedTab } as ExhibitionPageTab;

    tabToUpdate.resources[0].data = value;
    onSave(tabToUpdate);
  };
}

export default withStyles(styles)(TabEditor);
