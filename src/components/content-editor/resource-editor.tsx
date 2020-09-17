import * as React from "react";
// tslint:disable-next-line: max-line-length
import { ExhibitionPageResource, ExhibitionPageResourceType, PageResourceMode, DynamicPageResource, DynamicPageResourceType, DynamicPageResourceDataSource } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, TextField, Select, MenuItem, FormControl, InputLabel } from "@material-ui/core";
import styles from "../../styles/components/content-editor/resource-editor";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import MediaLibrary from "../right-panel-editors/media-library";
import produce from "immer";
import { AccessToken } from "../../types";
import ResourceUtils from "../../utils/resource-utils";
import DynamicResourceEditor from "./dynamic-resource-editor";
import { resourceModes } from "./constants";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  resource: ExhibitionPageResource;
  onUpdate: (resource: ExhibitionPageResource) => void;
}

/**
 * Interface representing component state
 */
interface State {
}

/**
 * Component for resource editor
 */
class ResourceEditor extends React.Component<Props, State> {

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
        { this.renderModeSelect() }
        { this.renderEditor() }
      </>
    );
  }

  /**
   * Renders mode select
   */
  private renderModeSelect = () => {
    const { classes, resource } = this.props;

    const selectOptions = resourceModes.map(option => {
      return (
        <MenuItem key={ option } value={ option }>
          { ResourceUtils.getModeDisplayName(option) }
        </MenuItem>
      );
    });

    return (
        <FormControl variant="outlined">
          <InputLabel id="modeLabel">{ strings.exhibition.resources.mode }</InputLabel>
          <Select
            label={ strings.exhibition.resources.mode }
            labelId="modeLabel"
            variant="outlined"
            className={ classes.field }
            fullWidth
            id={ resource.id }
            onChange={ this.onModeChange }
            name={ "mode" }
            value={ resource.mode }
            >
            { selectOptions }
        </Select>
      </FormControl>
    );
  }

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
  }

  /**
   * Renders dynamic editor
   */
  private renderDynamicEditor = () => {
    const { accessToken, resource } = this.props;

    return (
      <DynamicResourceEditor
        accessToken={ accessToken }
        data={ JSON.parse(resource.data) as DynamicPageResource }
        resourceType={ resource.type }
        onUpdate={ this.onUpdateDynamicResource }
      />
    );
  }

  /**
   * Renders scripted editor
   */
  private renderScriptedEditor = () => {
    return this.renderResourceField();
  }

  /**
   * Renders static editor
   */
  private renderStaticEditor = () => {
    return this.renderResourceField();
  }

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
            accessToken={ accessToken }
            mediaType={ ResourceUtils.getResourceMediaType(resource.type)! }
            resource={ resource }
            onUrlChange={ this.updateResourceData }
          />
        );
      case ExhibitionPageResourceType.Text:
        return (
          <TextField
            variant="outlined"
            multiline
            className={ classes.field }
            label={ strings.exhibition.resources.textView.properties.text }
            name="data"
            value={ resource.data }
            onChange={ this.onResourceDataChange }
          />
        );
      default:
      break;
    }
  }

  /**
   * Event handler for mode change
   * 
   * @param event React change event
   * @param child selected child
   */
  private onModeChange = (event: React.ChangeEvent<{ name?: string, value: any }>, child: React.ReactNode) => {
    const { resource, onUpdate } = this.props;
    const mode = event.target.value as PageResourceMode;

    if (mode === resource.mode) {
      return;
    }

    onUpdate(
      produce(resource, draft => {
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
      })
    );
  }

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
          { equals: "", value:  "", default: true },
          { equals: "", value:  "" }
        ]
      }
    };
  }

  /**
   * Event handler for resource data change
   *
   * @param event React change event
   */
  private onResourceDataChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.updateResourceData(event.target.value);
  }

  /**
   * Event handler for updating dynamic resource
   * 
   * @param resourceData dynamic resource data
   */
  private onUpdateDynamicResource = (resourceData: DynamicPageResource) => {
    const dataString = JSON.stringify(resourceData);
    this.updateResourceData(dataString);
  }

  /**
   * Updates default resource
   *
   * @param value value as string
   */
  private updateResourceData = (value: string) => {
    const { resource, onUpdate } = this.props;

    onUpdate(
      produce(resource, draft => {
        draft.data = value;
      })
    );
  }
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
  return { };
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ResourceEditor));
