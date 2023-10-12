import {
  DynamicPageResource,
  DynamicPageResourceDataSource,
  DynamicPageResourceType,
  ExhibitionPageResource,
  ExhibitionPageResourceType,
  PageResourceMode,
  VisitorVariable
} from "../../generated/client";
import strings from "../../localization/strings";
import { ReduxActions, ReduxState } from "../../store";
import styles from "../../styles/components/content-editor/resource-editor";
import { AccessToken, TreeObject } from "../../types";
import ResourceUtils from "../../utils/resource-utils";
import MediaLibrary from "../right-panel-editors/media-library";
import { resourceModes } from "./constants";
import DynamicResourceEditor from "./dynamic-resource-editor";
import { MenuItem, SelectChangeEvent, TextField } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import produce from "immer";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  resource: ExhibitionPageResource;
  visitorVariables: VisitorVariable[];
  component?: TreeObject;
  onUpdate: (resource: ExhibitionPageResource, component?: TreeObject) => void;
}

/**
 * Component for resource editor
 */
class ResourceEditor extends React.Component<Props, {}> {
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
  public render = () => {
    return (
      <>
        {this.renderModeSelect()}
        {this.renderEditor()}
      </>
    );
  };

  /**
   * Renders mode select
   */
  private renderModeSelect = () => {
    const { classes, resource } = this.props;

    const selectOptions = resourceModes.map((option) => {
      return (
        <MenuItem key={option} value={option}>
          {ResourceUtils.getModeDisplayName(option)}
        </MenuItem>
      );
    });

    return (
      <TextField
        label={strings.exhibition.resources.mode}
        variant="outlined"
        className={classes.field}
        fullWidth
        select
        disabled
        id={resource.id}
        onChange={this.onModeChange}
        name={"mode"}
        value={resource.mode}
      >
        {selectOptions}
      </TextField>
    );
  };

  /**
   * Renders corresponding editor based on resource mode
   */
  private renderEditor = () => {
    switch (this.props.resource.mode || PageResourceMode.Static) {
      case PageResourceMode.Dynamic:
        return this.renderDynamicEditor();
      case PageResourceMode.Scripted:
        return this.renderScriptedEditor();
      default:
        return this.renderStaticEditor();
    }
  };

  /**
   * Renders dynamic editor
   */
  private renderDynamicEditor = () => {
    const { accessToken, resource, visitorVariables } = this.props;

    return (
      <DynamicResourceEditor
        accessToken={accessToken}
        data={JSON.parse(resource.data) as DynamicPageResource}
        visitorVariables={visitorVariables}
        resourceType={resource.type}
        onUpdate={this.onUpdateDynamicResource}
      />
    );
  };

  /**
   * Renders scripted editor
   */
  private renderScriptedEditor = () => {
    return this.renderResourceField();
  };

  /**
   * Renders static editor
   */
  private renderStaticEditor = () => {
    return this.renderResourceField();
  };

  /**
   * Renders resource field based on resource type
   */
  private renderResourceField = () => {
    const { classes, accessToken, resource } = this.props;

    switch (resource.type) {
      case ExhibitionPageResourceType.Image:
      case ExhibitionPageResourceType.Video:
        return (
          <MediaLibrary
            accessToken={accessToken}
            mediaType={ResourceUtils.getResourceMediaType(resource.type)!}
            resource={resource}
            onUrlChange={this.updateResourceData}
          />
        );
      case ExhibitionPageResourceType.Text:
        return (
          <TextField
            variant="outlined"
            multiline
            fullWidth
            className={classes.field}
            label={strings.exhibition.resources.textView.properties.text}
            name="data"
            value={resource.data}
            onChange={this.onResourceDataChange}
          />
        );
      default:
        break;
    }
  };

  /**
   * Event handler for mode change
   *
   * @param event React change event
   * @param child selected child
   */
  private onModeChange = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    const { resource, component, onUpdate } = this.props;
    const mode = event.target.value as PageResourceMode;

    if (mode === resource.mode) {
      return;
    }

    onUpdate(
      produce(resource, (draft) => {
        switch (mode || PageResourceMode.Static) {
          case PageResourceMode.Dynamic:
            const dynamicData = this.createDynamicResourceDataStructure();
            draft.data = JSON.stringify(dynamicData);
            break;
          default:
            draft.data = "";
            break;
        }

        draft.mode = mode;
      }),
      component
    );
  };

  /**
   * Creates data structure for dynamic resource
   *
   * @returns empty dynamic page resource structure
   */
  private createDynamicResourceDataStructure = (): DynamicPageResource => {
    return {
      type: DynamicPageResourceType.Switch,
      params: {
        dataSource: DynamicPageResourceDataSource.UserValue,
        key: "",
        when: [
          { equals: "", value: "", default: true },
          { equals: "", value: "" }
        ]
      }
    };
  };

  /**
   * Event handler for resource data change
   *
   * @param event React change event
   */
  private onResourceDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.updateResourceData(event.target.value);
  };

  /**
   * Event handler for updating dynamic resource
   *
   * @param resourceData dynamic resource data
   */
  private onUpdateDynamicResource = (resourceData: DynamicPageResource) => {
    const dataString = JSON.stringify(resourceData);
    this.updateResourceData(dataString);
  };

  /**
   * Updates default resource
   *
   * @param value value as string
   */
  private updateResourceData = (value: string) => {
    const { resource, component, onUpdate } = this.props;

    onUpdate(
      produce(resource, (draft) => {
        draft.data = value;
      }),
      component
    );
  };
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    accessToken: state.auth.accessToken as AccessToken
  };
}

/**
 * Redux mapper for mapping component dispatches
 *
 * @param dispatch dispatch method
 */
function mapDispatchToProps(dispatch: Dispatch<ReduxActions>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ResourceEditor));
