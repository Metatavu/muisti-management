import * as React from "react";
import { ExhibitionPageResource, PageLayoutView, ExhibitionPage, PageLayout } from "../../generated/client";
import strings from "../../localization/strings";
import { WithStyles, withStyles, Typography, TextField } from "@material-ui/core";
import { ExhibitionElement, ExhibitionElementType } from '../../types';
import styles from "../../styles/exhibition-view";
import theme from "../../styles/theme";
import { ReduxActions, ReduxState } from "../../store";
import { connect } from "react-redux";
import { Dispatch } from "redux"

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

    const title = <Typography variant="h4" style={{ marginBottom: theme.spacing(2) }}>{ strings.exhibition.properties.title }</Typography>
    const widget = this.findResourceLayoutViewWidget(resource.id);

    if ("ImageView" === widget) {
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
    } else if ("TextView" === widget) {
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
    }

    return <div>{ title }{ widget }</div>;
  }

  /**
   * Attempts to find a layout view widget for given resource
   *
   * @param resourceId resource id
   * @returns view widget or null if not found
   */
  private findResourceLayoutViewWidget(resourceId: string): string | null {
    const view = this.findResourceLayoutView(resourceId);
    return view?.widget || null;
  }

  /**
   * Attempts to find a layout view for given resource
   *
   * @param resourceId resource id
   * @returns view or null if not found
   */
  private findResourceLayoutView(resourceId: string): PageLayoutView | null {
    const { selectedElement } = this.props;
    if (!selectedElement || selectedElement.type !== ExhibitionElementType.PAGE) {
      return null;
    }

    const pageData = selectedElement.data as ExhibitionPage;
    const layout = this.props.layouts.find(item => item.id === pageData.layoutId);
    if (!layout) {
      return null;
    }

    const propertyValue = `@resources/${resourceId}`;
    const root = layout.data;
    if (root.properties.findIndex(property => property.value === propertyValue) > -1) {
      return root;
    }

    return this.findLayoutViewByPropertyValue(root, propertyValue);
  }

  /**
   * Attempts to find a child view with given property value
   *
   * @param view root view
   * @param propertyValue property value
   * @returns view or null if not found
   */
  private findLayoutViewByPropertyValue(view: PageLayoutView, propertyValue: string): PageLayoutView | null  {
    for (let i = 0; i < view.children.length; i++) {
      const child = view.children[i];
      if (child.properties.findIndex(property => property.value === propertyValue) > -1) {
        return child;
      }

      const result = this.findLayoutViewByPropertyValue(child, propertyValue);
      if (result) {
        return result;
      }
    }

    return null;
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