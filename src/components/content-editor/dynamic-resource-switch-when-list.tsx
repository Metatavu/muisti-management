import {
  DynamicPageResourceSwitchWhen,
  ExhibitionPageResourceType,
  VisitorVariable,
  VisitorVariableType
} from "../../generated/client";
import strings from "../../localization/strings";
import styles from "../../styles/components/content-editor/resource-editor";
import { AccessToken, MediaType } from "../../types";
import ResourceUtils from "../../utils/resource-utils";
import MediaLibraryButton from "./media-library-button";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Button, IconButton, MenuItem, TextField, TextFieldProps, Typography } from "@mui/material";
import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import produce from "immer";
import * as React from "react";

/**
 * Interface representing component properties
 */
interface Props extends WithStyles<typeof styles> {
  accessToken: AccessToken;
  resourceType: ExhibitionPageResourceType;
  whenList: DynamicPageResourceSwitchWhen[];
  visitorVariable?: VisitorVariable;
  onUpdate: (whenList: DynamicPageResourceSwitchWhen[]) => void;
}

/**
 * Component for dynamic resource switch when list
 *
 * @param props component props
 */
const DynamicResourceSwitchWhenList: React.FC<Props> = (props: Props) => {
  return (
    <>
      {props.whenList.map((when, index) => renderWhenRow(index, when, props))}
      {renderAddWhen(props)}
    </>
  );
};

/**
 * Renders when row
 *
 * @param index row index
 * @param when single when data
 * @param props component props
 */
const renderWhenRow = (index: number, when: DynamicPageResourceSwitchWhen, props: Props) => {
  const { accessToken, resourceType, classes, onUpdate, whenList } = props;

  const isMediaResource = isMediaType(resourceType);

  return (
    <div key={index} className={classes.resourceSwitchWhenList}>
      {renderVisitorVariableValueInput(index, when, props)}
      <TextField
        className={classes.field}
        label={strings.exhibition.resources.dynamic.value}
        name="value"
        value={when.value}
        disabled={isMediaResource}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          if (!isMediaResource) {
            const row = updateWhenRow(when, "value", event.target.value as string);
            onUpdate(getUpdatedWhenList(whenList, { updatedRow: { index, row } }));
          }
        }}
      />
      {isMediaResource && (
        <MediaLibraryButton
          accessToken={accessToken}
          currentUrl={when.value}
          mediaType={ResourceUtils.getResourceMediaType(resourceType) ?? MediaType.MEDIA}
          onUpdate={(url: string) => {
            const row = updateWhenRow(when, "value", url);
            onUpdate(getUpdatedWhenList(whenList, { updatedRow: { index, row } }));
          }}
        />
      )}
      <IconButton
        className={classes.iconButton}
        onClick={() => onUpdate(getUpdatedWhenList(whenList, { deletedIndex: index }))}
        size="large"
      >
        <DeleteOutlineIcon />
      </IconButton>
    </div>
  );
};

/**
 * Renders visitor variable value input
 *
 * @param index index of when row
 * @param when dynamic page resource switch when object
 * @param props component properties
 */
const renderVisitorVariableValueInput = (
  index: number,
  when: DynamicPageResourceSwitchWhen,
  props: Props
) => {
  const { classes, visitorVariable, whenList, onUpdate } = props;

  if (!visitorVariable) {
    return null;
  }

  const textFieldProps: TextFieldProps = {
    className: classes.field,
    fullWidth: true,
    label: strings.exhibition.resources.dynamic.equals,
    name: "equals",
    value: when.equals,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      const row = updateWhenRow(when, "equals", event.target.value);
      onUpdate(getUpdatedWhenList(whenList, { updatedRow: { index, row } }));
    }
  };

  switch (visitorVariable.type) {
    case VisitorVariableType.Enumerated:
      return (
        <TextField {...textFieldProps} select>
          {visitorVariable._enum?.map((value, index) => (
            <MenuItem key={index} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
      );
    case VisitorVariableType.Boolean:
      return (
        <TextField {...textFieldProps} select>
          <MenuItem key="true" value="true">
            {strings.visitorVariables.booleanValues.true}
          </MenuItem>
          <MenuItem key="false" value="false">
            {strings.visitorVariables.booleanValues.false}
          </MenuItem>
        </TextField>
      );
    case VisitorVariableType.Number:
      return <TextField {...textFieldProps} type="number" />;
    case VisitorVariableType.Text:
    default:
      return <TextField {...textFieldProps} />;
  }
};

/**
 * Renders add when row
 *
 * @param props component props
 */
const renderAddWhen = (props: Props) => {
  const { classes, whenList, onUpdate } = props;
  const newRow = { equals: "", value: "" };

  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Button
        onClick={() => {
          onUpdate(getUpdatedWhenList(whenList, { addedRow: newRow }));
        }}
      >
        <AddIcon className={classes.decorativeIcon} />
        <Typography>{strings.exhibition.resources.dynamic.addNewWhen}</Typography>
      </Button>
    </div>
  );
};

/**
 * Updates when row
 *
 * @param when when data
 * @param key property key
 * @param value property value
 * @returns updated when row
 */
const updateWhenRow = (
  when: DynamicPageResourceSwitchWhen,
  key: keyof DynamicPageResourceSwitchWhen,
  value: string
): DynamicPageResourceSwitchWhen => {
  return { ...when, [key]: value };
};

/**
 * Returns updated when list
 *
 * @param whenList when list
 * @param actions possible list modify actions
 * @param addedRow row to be added to list
 * @param updatedRow row to be updated, needs to include row index and updated row data
 * @param deletedIndex index for row to be deleted
 * @returns updated when list
 */
const getUpdatedWhenList = (
  whenList: DynamicPageResourceSwitchWhen[],
  actions: {
    addedRow?: DynamicPageResourceSwitchWhen;
    updatedRow?: { index: number; row: DynamicPageResourceSwitchWhen };
    deletedIndex?: number;
  }
): DynamicPageResourceSwitchWhen[] => {
  return produce(whenList, (draft) => {
    if (actions.addedRow) {
      draft.push(actions.addedRow);
    }
    if (actions.updatedRow) {
      const { index, row } = actions.updatedRow;
      draft[index] = row;
    }
    if (actions.deletedIndex) {
      draft.splice(actions.deletedIndex, 1);
    }
  });
};

/**
 * Is resource media type
 *
 * @param type resource type
 * @returns true if resource type is media, otherwise false
 */
const isMediaType = (type: ExhibitionPageResourceType) => {
  return type === ExhibitionPageResourceType.Image || type === ExhibitionPageResourceType.Video;
};

export default withStyles(styles)(DynamicResourceSwitchWhenList);
