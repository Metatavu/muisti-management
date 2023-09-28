import { ExhibitionPageResource } from "../../generated/client/models";
import strings from "../../localization/strings";
import styles from "../../styles/components/content-editor/layout-view-resources-list";
import { TreeObject } from "../../types";
import ResourceUtils from "../../utils/resource-utils";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { List, ListItem, ListItemText } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  resources: ExhibitionPageResource[];
  selectedResource?: ExhibitionPageResource;
  component?: TreeObject;
  onClick?: (resource: ExhibitionPageResource, component?: TreeObject) => () => void;
}

/**
 * Functional component for timeline devices list
 *
 * @param props component props
 */
const LayoutViewResourcesList: React.FC<Props> = ({
  resources,
  selectedResource,
  component,
  onClick,
  classes
}) => {
  return (
    <List className={classes.list}>
      {resources.map((resource) => (
        <ListItem
          key={resource.id}
          button
          className={classes.listItem}
          selected={selectedResource?.id === resource.id}
          onClick={onClick?.(resource, component)}
        >
          <ListItemText
            primary={strings.contentEditor.editor.resource}
            secondary={ResourceUtils.getModeDisplayName(resource.mode)}
          />
          <ChevronRightIcon />
        </ListItem>
      ))}
    </List>
  );
};

export default withStyles(styles)(LayoutViewResourcesList);
