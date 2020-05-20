import * as React from "react";
import { ExhibitionPageResource, PageLayout, ExhibitionPageResourceType } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, Typography, TextField } from "@material-ui/core";
import { ExhibitionElement } from '../../types';
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  resource: ExhibitionPageResource;
  selectedElement?: ExhibitionElement;
  layouts: PageLayout[];
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
  public render() {
    const { classes, resource, onChange } = this.props;

    const title = <Typography variant="h6" style={{ marginBottom: theme.spacing(2) }}>{ strings.exhibition.properties.title }</Typography>
    switch (resource.type) {
      case ExhibitionPageResourceType.Image:
        return (
          <>
            { title }
            <TextField
              type="url"
              className={ classes.textResourceEditor } 
              label={ strings.exhibition.resources.imageView.properties.imageUrl }
              variant="filled"
              value={ resource.data }
              onChange={ onChange }
            />
          </>
        );
      case ExhibitionPageResourceType.Video:
        return (
          <>
            { title }
            <TextField
              type="url"
              className={ classes.textResourceEditor } 
              label={ strings.exhibition.resources.mediaView.properties.imageOrVideoUrl }
              variant="filled"
              value={ resource.data }
              onChange={ onChange }
            />
          </>
        );
      case ExhibitionPageResourceType.Text:
        return (
          <>
            { title }
            <TextField
              multiline
              className={ classes.textResourceEditor } 
              label={ strings.exhibition.resources.textView.properties.text }
              variant="filled"
              value={ resource.data }
              onChange={ onChange }
            />
          </>
        );
      default: return <div>{ title }</div>;
    }
  }
}

/**
 * Redux mapper for mapping store state to component props
 *
 * @param state store state
 */
function mapStateToProps(state: ReduxState) {
  return {
    layouts: state.layouts.layouts
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