import * as React from "react";

import { WithStyles, withStyles, List, ListItem, Typography, ListItemText } from "@material-ui/core";
import styles from "../../styles/components/content-editor/layout-view-resources-list";
import { ExhibitionPageResource } from "../../generated/client/models";
import ResourceUtils from "../../utils/resource-utils";
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import strings from "../../localization/strings";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  resources: ExhibitionPageResource[];
  selectedResource?: ExhibitionPageResource;
  onClick?: (resource: ExhibitionPageResource) => () => void;
}

/**
 * Functional component for timeline devices list
 *
 * @param props component props
 */
const LayoutViewResourcesList: React.FC<Props> = ({
  resources,
  selectedResource,
  onClick,
  classes
}) => {
  return (
    <List className={ classes.list }>
      {
        resources.map(resource =>
          <ListItem
            key={ resource.id }
            button
            className={ classes.listItem }
            selected={ selectedResource?.id === resource.id }
            onClick={ onClick && onClick(resource) }
          >
            <ListItemText
              primary={ strings.contentEditor.editor.resource }
              secondary={ ResourceUtils.getModeDisplayName(resource.mode) }
            />
            <ChevronRightIcon />
          </ListItem>
        )
      }
    </List>
  );
};

export default withStyles(styles)(LayoutViewResourcesList);